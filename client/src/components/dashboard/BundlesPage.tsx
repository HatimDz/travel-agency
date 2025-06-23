import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Download,
  UploadCloud,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  Calendar,
  Loader2,
  XCircle,
  MapPin
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  getBundles,
  toggleBundleStatus,
  deleteBundle
} from '@/services/BundleService';

// Bundle type based on your BundleService
interface Bundle {
  id: number | string;
  name: string;
  type: 'Silver' | 'Gold' | 'Platinum';
  description: string;
  price: number;
  active: boolean;
  product_ids: number[];
  created_at?: string;
}

const getBundleIcon = () => (
  <Package className="h-5 w-5 text-amber-500" />
);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState<'grid' | 'table'>('table');

  const navigate = useNavigate();
  const { toast } = useToast();

  // bundle handler
  const handleAddBundle = () => {
    navigate('/dashboard/bundles/new');
  };

  // Fetch bundles data from BundleService
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const data = await getBundles();

        setBundles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching bundles:', error);
        toast({
          title: "Error",
          description: "Failed to load bundles. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [toast]);

  // Filter bundles based on search term and filters
  const filteredBundles = (bundles || []).filter(bundle => {
    const matchesSearch =
      bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && bundle.active) ||
      (filterStatus === 'inactive' && !bundle.active);

    return matchesSearch && matchesStatus;
  });

  // Delete bundle handler
  const handleDeleteBundle = async (id: number | string) => {
    try {
      await deleteBundle(id);
      setBundles(prev => prev.filter(bundle => bundle.id !== id));
      toast({
        title: "Bundle Deleted",
        description: "The bundle has been successfully removed.",
      });
    } catch (error) {
      console.error('Error deleting bundle:', error);
      toast({
        title: "Error",
        description: "Failed to delete the bundle. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Toggle bundle status handler
  const handleToggleStatus = async (id: number | string) => {
    try {
      const bundle = bundles.find(b => b.id === id);
      if (!bundle) return;

      await toggleBundleStatus(id, !bundle.active);

      setBundles(prev => prev.map(b =>
        b.id === id ? { ...b, active: !b.active } : b
      ));
      
      toast({
        title: bundle.active ? "Bundle Deactivated" : "Bundle Activated",
        description: `The bundle status has been updated to ${bundle.active ? 'inactive' : 'active'}.`,
      });
    } catch (error) {
      console.error('Error updating bundle status:', error);
      toast({
        title: "Error",
        description: "Failed to update the bundle status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Table columns definition
  const columns: ColumnDef<Bundle, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Bundle',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center">
            {getBundleIcon()}
          </div>
          <div className="max-w-[300px]">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{row.original.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{row.original.description}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.type}</span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatPrice(row.original.price)}
        </span>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) =>
        row.original.active ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/dashboard/bundle-detail/${row.original.id}`)}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/dashboard/bundle-edit/${row.original.id}`)}
              className="cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleStatus(row.original.id)}
              className="cursor-pointer"
            >
              {row.original.active ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteBundle(row.original.id)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with title and main action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Bundles</h2>
          <p className="text-muted-foreground">Manage your travel bundles and package deals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddBundle}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bundle
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <Filter className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundles table */}
      <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800 dark:text-gray-200">Bundle Inventory</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                {filteredBundles.length} bundles found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={view === 'table' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView('table')}
                  className="flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-1"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M3 15h18" />
                    <path d="M9 3v18" />
                    <path d="M15 3v18" />
                  </svg>
                  Table
                </Button>
                <Button
                  variant={view === 'grid' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView('grid')}
                  className="flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 mr-1"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                  Grid
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
                <UploadCloud className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="inline-block p-3 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20">
                <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-100 border-t-indigo-500"></div>
              </div>
            </div>
          ) : (
            <div>
              {view === 'table' && (
                <div className="w-full">
                  <DataTable
                    columns={columns}
                    data={filteredBundles}
                    searchKey="name"
                    onAddNew={handleAddBundle}
                    filterOptions={[
                      {
                        label: "Status",
                        value: "active",
                        options: [
                          { label: "All", value: "all" },
                          { label: "Active", value: "true" },
                          { label: "Inactive", value: "false" },
                        ],
                      },
                    ]}
                    isLoading={loading}
                  />
                </div>
              )}

              {view === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredBundles.map(bundle => (
                    <Card key={bundle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {getBundleIcon()}
                            </div>
                            <div>
                              <CardTitle className="text-base">{bundle.name}</CardTitle>
                              <CardDescription className="text-xs">{bundle.type} Bundle</CardDescription>
                            </div>
                          </div>
                          <Badge variant={bundle.active ? "default" : "secondary"}>
                            {bundle.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{bundle.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <div>
                          <span className="text-lg font-semibold">{formatPrice(bundle.price)}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/bundle-detail/${bundle.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(filteredBundles || []).length} of {(bundles || []).length} bundles
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}