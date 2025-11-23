import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import logger from '@/lib/logger';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, ChevronDown, Download, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * # DataTable Pattern - TanStack Table
 * 
 * Pattern complet de table de données avec fonctionnalités avancées :
 * - **Tri multi-colonnes** : Cliquez sur les en-têtes pour trier
 * - **Filtrage en temps réel** : Recherche globale et par colonne
 * - **Pagination** : Navigation avec contrôle de taille de page
 * - **Sélection multiple** : Cases à cocher avec sélection en masse
 * - **Actions en masse** : Suppression et export groupés
 * - **Visibilité des colonnes** : Masquer/afficher les colonnes
 * - **Responsive** : Adaptation mobile/desktop
 */

// Types de données
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string;
}

// Données d'exemple
const generateMockData = (count: number): User[] => {
  const roles = ['Admin', 'User', 'Manager', 'Developer', 'Designer'];
  const statuses: User['status'][] = ['active', 'inactive', 'pending'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(2024, 0, Math.floor(Math.random() * 365)).toISOString().split('T')[0],
    lastLogin: new Date(2024, 0, Math.floor(Math.random() * 365)).toISOString().split('T')[0],
  }));
};

// Composant DataTable
function DataTableDemo() {
  const [data] = useState<User[]>(() => generateMockData(50));
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { toast } = useToast();

  // Définition des colonnes
  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-muted"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-muted"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('role')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : status === 'inactive'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-muted"
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('createdAt')}</div>,
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => <div>{row.getValue('lastLogin')}</div>,
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toast({
                  title: 'Edit User',
                  description: `Editing ${user.name}`,
                });
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toast({
                  title: 'Delete User',
                  description: `Deleting ${user.name}`,
                  variant: 'destructive',
                });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Actions en masse
  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    toast({
      title: 'Bulk Delete',
      description: `Deleting ${selectedRows.length} users`,
      variant: 'destructive',
    });
  };

  const handleExport = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : data;
    
    toast({
      title: 'Export Data',
      description: `Exporting ${dataToExport.length} records`,
    });
    
    // Simuler export CSV
    logger.debug('Exporting:', dataToExport);
  };

  return (
    <div className="w-full space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          {/* Actions en masse */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
            </>
          )}
          
          {/* Export tout */}
          {table.getFilteredSelectedRowModel().rows.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          )}
          
          {/* Visibilité des colonnes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof DataTableDemo> = {
  title: 'Patterns/DataTable',
  component: DataTableDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## DataTable Pattern - TanStack Table

Pattern complet de table de données avec toutes les fonctionnalités avancées :

### Fonctionnalités
- ✅ **Tri multi-colonnes** : Tri ascendant/descendant sur plusieurs colonnes
- ✅ **Filtrage en temps réel** : Recherche globale et filtres par colonne
- ✅ **Pagination** : Navigation avec contrôle de taille de page
- ✅ **Sélection multiple** : Cases à cocher avec sélection en masse
- ✅ **Actions en masse** : Suppression et export groupés
- ✅ **Visibilité des colonnes** : Masquer/afficher les colonnes dynamiquement
- ✅ **Responsive** : Adaptation mobile/desktop
- ✅ **États visuels** : Statuts avec badges colorés
- ✅ **Actions par ligne** : Édition et suppression individuelles

### Technologies
- **TanStack Table v8** : Gestion complète de la table
- **Shadcn UI** : Composants de base
- **React Hook Form** : (pour filtres avancés)
- **Zod** : (pour validation des données)

### Cas d'usage
- Tableaux d'utilisateurs
- Listes de commandes
- Catalogues de produits
- Dashboards d'administration
- Rapports de données
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DataTableDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Table de données complète avec toutes les fonctionnalités activées.',
      },
    },
  },
};

export const WithSelection: Story = {
  render: () => <DataTableDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Démonstration de la sélection multiple et des actions en masse.',
      },
    },
  },
};

export const CodeExample: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <h2>Installation</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`npm install @tanstack/react-table`}</code>
        </pre>

        <h2>Usage de base</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';

function DataTable() {
  const [data] = useState<User[]>(mockData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
  });

  return <Table>...</Table>;
}`}</code>
        </pre>

        <h2>Définition des colonnes</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => 
          table.toggleAllPageRowsSelected(!!value)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button onClick={() => column.toggleSorting()}>
        Name <ArrowUpDown />
      </Button>
    ),
  },
];`}</code>
        </pre>

        <h2>Actions en masse</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`const selectedRows = table.getFilteredSelectedRowModel().rows;

const handleBulkDelete = () => {
  const ids = selectedRows.map(row => row.original.id);
  // Appeler l'API de suppression
  deleteUsers(ids);
};

const handleExport = () => {
  const data = selectedRows.map(row => row.original);
  // Exporter en CSV
  exportToCSV(data);
};`}</code>
        </pre>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemples de code pour implémenter la DataTable.',
      },
    },
  },
};
