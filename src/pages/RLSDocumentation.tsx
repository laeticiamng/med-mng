import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Search, Database, Lock, Users, Key, AlertCircle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Interface pour les données brutes retournées par la fonction SQL
// Aligné avec get_rls_policies() qui retourne table_schema, table_name, policy_name, policy_cmd, policy_roles, policy_qual, policy_with_check
interface RawPolicy {
  table_schema: string;
  table_name: string;
  policy_name: string;
  policy_cmd: string;
  policy_roles: string[];
  policy_qual: string | null;
  policy_with_check: string | null;
}

// Aligné avec get_rls_table_summaries() qui retourne table_name, rls_enabled, policy_count
interface RawTableSummary {
  table_name: string;
  rls_enabled: boolean;
  policy_count: number;
}

// Interfaces enrichies utilisées dans le composant
interface Policy {
  tablename: string;
  policyname: string;
  cmd: string;
  roles: string[];
  qual: string | null;
  with_check: string | null;
}

interface TableSummary {
  tablename: string;
  policy_count: number;
  has_rls: boolean;
  commands: string[];
}

const RLSDocumentation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["rls-policies"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_rls_policies");
      if (error) throw error;
      // Transformer les données brutes en format enrichi
      const rawData = data as RawPolicy[];
      return rawData.map(p => ({
        tablename: p.table_name,
        policyname: p.policy_name,
        cmd: p.policy_cmd,
        roles: p.policy_roles || ['authenticated'],
        qual: p.policy_qual,
        with_check: p.policy_with_check,
      })) as Policy[];
    },
  });

  const { data: tableSummaries } = useQuery({
    queryKey: ["rls-table-summaries"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_rls_table_summaries");
      if (error) throw error;
      const rawData = data as RawTableSummary[];
      // Transformer vers TableSummary
      return rawData.map(t => ({
        tablename: t.table_name,
        policy_count: t.policy_count,
        has_rls: t.rls_enabled,
        commands: [] // Sera rempli après le chargement des policies
      })) as TableSummary[];
    },
  });

  const getSecurityRationale = (tablename: string): string => {
    const rationales: Record<string, string> = {
      profiles: "Données personnelles utilisateur - isolation complète entre utilisateurs",
      badges: "Récompenses personnelles - chaque utilisateur ne voit que ses propres badges",
      chat_conversations: "Conversations privées - accès limité au propriétaire",
      chat_messages: "Messages privés - accès via la conversation propriétaire",
      emotions: "Données émotionnelles sensibles - strictement privées",
      emotionscare_songs: "Catalogue musical - lecture publique, écriture authentifiée",
      emotionscare_user_songs: "Bibliothèque musicale personnelle - scope utilisateur",
      med_mng_items: "Contenu médical personnel - isolation utilisateur obligatoire",
      edn_items_immersive: "Contenu éducatif - lecture publique, écriture restreinte",
      oic_competences: "Référentiel compétences - lecture publique pour accès universel",
      admin_changelog: "Logs administratifs - accès admin/service uniquement",
      audit_reports: "Rapports d'audit - service role uniquement",
      dsar_approvals: "Approbations DSAR - approbateurs voient uniquement leurs assignations",
      api_integrations: "Clés API - scope utilisateur avec validation stricte",
      posts: "Publications communautaires - lecture publique, écriture authentifiée",
      comments: "Commentaires publics - lecture publique, modification par auteur",
    };
    return rationales[tablename] || "Politique de sécurité standard avec isolation utilisateur";
  };

  const getCategoryFromTable = (tablename: string): string => {
    if (tablename.includes("chat") || tablename.includes("message") || tablename.includes("conversation")) return "communication";
    if (tablename.includes("emotion") || tablename.includes("breathing") || tablename.includes("wellness")) return "wellness";
    if (tablename.includes("med_") || tablename.includes("clinical") || tablename.includes("health")) return "medical";
    if (tablename.includes("admin") || tablename.includes("audit") || tablename.includes("compliance")) return "admin";
    if (tablename.includes("community") || tablename.includes("post") || tablename.includes("comment")) return "social";
    if (tablename.includes("edn_") || tablename.includes("oic_") || tablename.includes("quiz")) return "education";
    return "other";
  };

  const getCommandBadgeVariant = (cmd: string) => {
    switch (cmd) {
      case "SELECT": return "default";
      case "INSERT": return "secondary";
      case "UPDATE": return "outline";
      case "DELETE": return "destructive";
      case "ALL": return "default";
      default: return "outline";
    }
  };

  const categories = [
    { value: "all", label: "Toutes", icon: Database },
    { value: "communication", label: "Communication", icon: Users },
    { value: "wellness", label: "Bien-être", icon: Shield },
    { value: "medical", label: "Médical", icon: Lock },
    { value: "admin", label: "Administration", icon: Key },
    { value: "social", label: "Social", icon: Users },
    { value: "education", label: "Éducation", icon: Database },
  ];

  // Enrichir les tableSummaries avec les commandes des policies
  const enrichedTableSummaries = tableSummaries?.map(table => {
    const tablePolicies = policies?.filter(p => p.tablename === table.tablename) || [];
    const commands = [...new Set(tablePolicies.map(p => p.cmd))];
    return { ...table, commands };
  });

  const filteredTables = enrichedTableSummaries?.filter(table => {
    const matchesSearch = table.tablename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || getCategoryFromTable(table.tablename) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const securityScore = enrichedTableSummaries ? 
    Math.round((enrichedTableSummaries.filter(t => t.policy_count > 0).length / enrichedTableSummaries.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Documentation RLS - Row Level Security
            </h1>
            <p className="text-muted-foreground">
              Politiques de sécurité au niveau des lignes avec rationale de sécurité
            </p>
          </div>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{securityScore}%</div>
              <div className="text-sm text-muted-foreground">Score de sécurité</div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{enrichedTableSummaries?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Tables totales</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">
                  {enrichedTableSummaries?.filter(t => t.policy_count > 0).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Tables protégées</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">{policies?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Policies actives</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">
                  {enrichedTableSummaries?.filter(t => t.policy_count === 0).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Sans policies</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-7 w-full">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              {policiesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredTables?.map((table) => {
                    const tablePolicies = policies?.filter(p => p.tablename === table.tablename) || [];
                    const hasNoPolicies = table.policy_count === 0;

                    return (
                      <AccordionItem key={table.tablename} value={table.tablename}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              {hasNoPolicies ? (
                                <AlertCircle className="h-5 w-5 text-warning" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-success" />
                              )}
                              <span className="font-mono font-semibold">{table.tablename}</span>
                              <Badge variant="outline">{table.policy_count} policies</Badge>
                            </div>
                            <div className="flex gap-2">
                              {table.commands.map(cmd => (
                                <Badge key={cmd} variant={getCommandBadgeVariant(cmd)}>
                                  {cmd}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pl-8 pt-2">
                            {/* Security Rationale */}
                            <Card className="p-4 bg-primary/5 border-primary/20">
                              <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-sm mb-1">Rationale de sécurité</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {getSecurityRationale(table.tablename)}
                                  </p>
                                </div>
                              </div>
                            </Card>

                            {/* Policies List */}
                            {tablePolicies.length > 0 ? (
                              <div className="space-y-3">
                                {tablePolicies.map((policy, idx) => (
                                  <Card key={idx} className="p-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-semibold">{policy.policyname}</h5>
                                        <div className="flex gap-2">
                                          <Badge variant={getCommandBadgeVariant(policy.cmd)}>
                                            {policy.cmd}
                                          </Badge>
                                          {policy.roles.map(role => (
                                            <Badge key={role} variant="secondary">
                                              {role}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      {policy.qual && (
                                        <div>
                                          <div className="text-xs font-semibold text-muted-foreground mb-1">
                                            USING (condition de lecture)
                                          </div>
                                          <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                                            {policy.qual}
                                          </code>
                                        </div>
                                      )}
                                      {policy.with_check && (
                                        <div>
                                          <div className="text-xs font-semibold text-muted-foreground mb-1">
                                            WITH CHECK (condition d'écriture)
                                          </div>
                                          <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                                            {policy.with_check}
                                          </code>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <Card className="p-4 border-warning/50 bg-warning/10">
                                <div className="flex items-center gap-3">
                                  <AlertCircle className="h-5 w-5 text-warning" />
                                  <p className="text-sm text-muted-foreground">
                                    Aucune policy définie pour cette table. 
                                    RLS peut être activé mais sans restriction.
                                  </p>
                                </div>
                              </Card>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RLSDocumentation;
