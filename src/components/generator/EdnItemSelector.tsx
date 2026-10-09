import React, { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { estItemGratuit, NOMBRE_ITEMS_GRATUITS } from '@/config/offre';
import { rechercherItems, trierItemsParNumero } from '@/lib/itemsEdn';
import { cn } from '@/lib/utils';
import { ApercuItemSelectionne } from './ApercuItemSelectionne';

interface ItemListe {
  item_code: string;
  title: string;
  subtitle?: string;
  slug?: string;
}

interface EdnItemSelectorProps {
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  allEdnItems: ItemListe[];
  itemsLoading: boolean;
  itemsError: string | null;
  /** Paroles stockées pour l'item choisi, telles que chargées par la page. */
  ednLyrics?: {
    paroles_rang_a?: string[];
    paroles_rang_b?: string[];
    paroles_rang_ab?: string[];
  } | null;
  /**
   * Compte sans Med MNG Premium : les 10 items d'essai sont signalés et
   * proposés en premier (leurs paroles sont lisibles gratuitement).
   */
  signalerItemsEssai?: boolean;
}

/**
 * Choix de l'item : liste complète des 367 items dans l'ordre officiel
 * (IC-1 → IC-367), recherche par numéro, titre ou mot-clé, titres lisibles
 * sur deux lignes. Remplace un menu déroulant qui triait par ordre
 * alphabétique du code (IC-1, IC-10, IC-100…) et n'affichait que 100 items.
 */
export const EdnItemSelector: React.FC<EdnItemSelectorProps> = ({
  selectedItem,
  setSelectedItem,
  allEdnItems,
  itemsLoading,
  itemsError,
  ednLyrics,
  signalerItemsEssai = false,
}) => {
  const [ouvert, setOuvert] = useState(false);
  const [requete, setRequete] = useState('');

  const resultats = useMemo(() => {
    const trouves = rechercherItems(allEdnItems, requete);
    if (!signalerItemsEssai || requete.trim()) return trouves;
    // Sans recherche, un compte gratuit voit d'abord ses items d'essai.
    return [
      ...trouves.filter((i) => estItemGratuit(i.item_code)),
      ...trouves.filter((i) => !estItemGratuit(i.item_code)),
    ];
  }, [allEdnItems, requete, signalerItemsEssai]);

  const selection = useMemo(
    () =>
      trierItemsParNumero(allEdnItems).find(
        (i) => i.item_code === selectedItem
      ),
    [allEdnItems, selectedItem]
  );

  const choisir = (code: string) => {
    setSelectedItem(code);
    setRequete('');
    setOuvert(false);
  };

  return (
    <div className="space-y-3">
      <Popover
        open={ouvert}
        onOpenChange={(o) => {
          setOuvert(o);
          if (!o) setRequete('');
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={ouvert}
            aria-haspopup="listbox"
            aria-label={
              selection
                ? `Item choisi : ${selection.item_code}, ${selection.title}. Changer d'item`
                : 'Choisir un item EDN'
            }
            disabled={itemsLoading || Boolean(itemsError)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-3 text-left',
              'transition-colors duration-200 hover:border-primary/50 hover:bg-background/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {itemsLoading ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Chargement des 367 items…
              </span>
            ) : itemsError ? (
              <span className="text-sm text-destructive">
                Liste des items indisponible : {itemsError}
              </span>
            ) : selection ? (
              <>
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  {selection.item_code}
                </Badge>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground line-clamp-2">
                  {selection.title}
                </span>
              </>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">
                Rechercher par numéro, titre ou mot-clé…
              </span>
            )}
            <ChevronsUpDown
              className="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] min-w-[18rem] p-0"
          onOpenAutoFocus={(e) => {
            // Sur écran tactile, le clavier ne s'ouvre pas d'office : la liste reste lisible.
            if (window.matchMedia?.('(pointer: coarse)').matches)
              e.preventDefault();
          }}
        >
          <Command shouldFilter={false} loop>
            <CommandInput
              value={requete}
              onValueChange={setRequete}
              placeholder="Numéro (12), titre ou mot-clé…"
              aria-label="Rechercher un item EDN"
            />
            <div className="flex items-center justify-between border-b px-3 py-1.5 text-[11px] text-muted-foreground">
              <span>
                {requete.trim()
                  ? `${resultats.length} résultat${resultats.length > 1 ? 's' : ''} sur ${allEdnItems.length}`
                  : `${allEdnItems.length} items, ordre officiel`}
              </span>
              {signalerItemsEssai && (
                <span>{NOMBRE_ITEMS_GRATUITS} items d'essai en tête</span>
              )}
            </div>
            <CommandList className="max-h-[min(60vh,26rem)]">
              <CommandEmpty>
                Aucun item ne correspond à « {requete} ».
              </CommandEmpty>
              {resultats.map((item) => {
                const choisi = item.item_code === selectedItem;
                const essai =
                  signalerItemsEssai && estItemGratuit(item.item_code);
                return (
                  <CommandItem
                    key={item.item_code}
                    value={item.item_code}
                    onSelect={() => choisir(item.item_code)}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 data-[selected=true]:bg-primary/10"
                  >
                    <span className="w-14 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                      {item.item_code}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-snug text-foreground line-clamp-2">
                      {item.title}
                    </span>
                    {essai && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        Essai
                      </Badge>
                    )}
                    <Check
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0 text-primary',
                        choisi ? 'opacity-100' : 'opacity-0'
                      )}
                      aria-hidden="true"
                    />
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selection && (
        <ApercuItemSelectionne
          itemCode={selection.item_code}
          titre={selection.title}
          slug={selection.slug || selection.item_code?.toLowerCase()}
          parolesRangA={ednLyrics?.paroles_rang_a}
          parolesRangB={ednLyrics?.paroles_rang_b}
          parolesRangAB={ednLyrics?.paroles_rang_ab}
        />
      )}
    </div>
  );
};
