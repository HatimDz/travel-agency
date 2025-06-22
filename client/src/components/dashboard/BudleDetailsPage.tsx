import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBundleById } from '@/services/BundleService';
import { getProducts } from '@/services/productService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

// Utility to get a default image by type
function getDefaultImageByType(type?: string) {
  switch (type) {
    case 'hotel':
      return '/images/default-hotel.jpg';
    case 'flight':
      return '/images/default-flight.jpg';
    case 'tour':
      return '/images/default-tour.jpg';
    default:
      return '/images/default-product.jpg';
  }
}

export function BudleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBundleAndProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch bundle details
        const bundleData = await getBundleById(id!);

        // Fetch all products (to map product_ids to product details)
        const response = await getProducts({ isActive: true });
        const allProducts = Array.isArray(response) ? response : response.data;

        const formattedProducts = allProducts.map((product: any) => ({
          ...product,
          image: product.image || getDefaultImageByType(product.type),
          rating: product.rating || 0,
          location: product.location || 'Not specified'
        }));

        setBundle(bundleData);
        setProducts(formattedProducts);
      } catch (err) {
        setError('Failed to load bundle details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBundleAndProducts();
  }, [id]);

  // Helper to get product details by id
  const getProductById = (pid: number) =>
    products.find((p) => p.id === pid);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Bundle Details
          </h2>
          <p className="text-muted-foreground">View all information about this bundle</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/bundles')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bundles
        </Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <CardTitle className="text-xl">Bundle Information</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : bundle?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : bundle ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-sm text-gray-500">Bundle Name</div>
                  <div className="font-bold text-lg">{bundle.name}</div>
                </div>
                <div>
                  <div className="mb-2 text-sm text-gray-500">Type</div>
                  <div className="font-semibold">{bundle.type}</div>
                </div>
                <div>
                  <div className="mb-2 text-sm text-gray-500">Price</div>
                  <div className="font-semibold text-indigo-600 text-lg">${bundle.price}</div>
                </div>
                <div>
                  <div className="mb-2 text-sm text-gray-500">Status</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${bundle.is_active || bundle.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {bundle.is_active || bundle.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <div className="mb-2 text-sm text-gray-500">Description</div>
                  <div className="text-gray-700 dark:text-gray-300">{bundle.description}</div>
                </div>
              </div>

              <div>
                <div className="mb-4 text-base font-semibold">Products in this Bundle</div>
                <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2 px-2" style={{ scrollSnapType: 'x mandatory' }}>
                  {bundle.product_ids && bundle.product_ids.length > 0 ? (
                    bundle.product_ids.map((pid: number) => {
                      const product = getProductById(pid);
                      if (!product) return null;
                      return (
                        <div
                          key={product.id}
                          className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-xl border bg-white dark:bg-gray-900 shadow-md relative group transition-all duration-300"
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <div className="relative aspect-w-16 aspect-h-9 overflow-hidden rounded-t-xl">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-40 w-full object-cover transition-transform group-hover:scale-105 duration-500"
                              onError={e => {
                                const target = e.target as HTMLImageElement;
                                target.src = getDefaultImageByType(product.type);
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            <div className="absolute top-3 left-3 z-10">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                                ${product.type === 'hotel' ? 'bg-blue-500 text-white' :
                                  product.type === 'flight' ? 'bg-purple-500 text-white' :
                                    product.type === 'sport' ? 'bg-green-500 text-white' :
                                      product.type === 'entertainment' ? 'bg-pink-500 text-white' :
                                        'bg-gray-500 text-white'}`}>
                                {product.type ? product.type.charAt(0).toUpperCase() + product.type.slice(1) : 'Product'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col p-4">
                            <div className="mb-1 font-bold text-lg truncate">{product.name}</div>
                            <div className="text-sm text-gray-500 mb-2 truncate">{product.location || 'Not specified'}</div>
                            <div className="text-xs text-gray-400 mb-2 line-clamp-2">{product.description || 'No description.'}</div>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="font-bold text-indigo-600">${product.sale_price ?? product.price ?? 0}</span>
                              {product.rating && product.rating > 0 && (
                                <span className="flex items-center text-yellow-500 text-xs font-semibold">
                                  <svg className="w-4 h-4 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {Number(product.rating).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400">No products in this bundle.</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}