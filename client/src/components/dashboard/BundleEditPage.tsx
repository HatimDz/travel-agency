import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts } from '@/services/productService';
import { getBundleById, updateBundle } from '@/services/BundleService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check, ArrowLeft } from 'lucide-react';

const bundleFormSchema = z.object({
  name: z.string().min(3, { message: "Bundle name must be at least 3 characters." }),
  type: z.enum(['Silver', 'Gold', 'Platinum'], { required_error: "Please select a bundle type." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  active: z.boolean().default(true),
  product_ids: z.array(z.number()).min(1, { message: "Select at least one product." })
});

type BundleFormData = z.infer<typeof bundleFormSchema>;

export function BundleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BundleFormData>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: {
      name: "",
      type: undefined,
      description: "",
      price: 0,
      active: true,
      product_ids: []
    }
  });

  // Fetch bundle and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch products
        const response = await getProducts({ isActive: true });
        const data = Array.isArray(response) ? response : response.data;
        const formattedProducts = data.map((product: any) => ({
          ...product,
          isActive: product.is_active ?? true,
          image: product.image,
          rating: product.rating || 0,
          location: product.location || 'Not specified'
        }));
        setProducts(formattedProducts);

        // Fetch bundle
        const bundle = await getBundleById(id!);

        // If bundle.products exists, extract product IDs from it (API response as shown in your prompt)
        let bundleProductIds: number[] = [];
        if (Array.isArray(bundle.products)) {
          bundleProductIds = bundle.products.map((p: any) => Number(p.id));
        } else if (Array.isArray(bundle.product_ids)) {
          bundleProductIds = bundle.product_ids.map((pid: any) => Number(pid));
        }

        form.reset({
          name: bundle.name,
          type: bundle.type,
          description: bundle.description,
          price: Number(bundle.price),
          active: !!bundle.active || !!bundle.is_active,
          product_ids: bundleProductIds
        });
      } catch (err) {
        setError("Failed to load bundle or products.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  async function onSubmit(data: BundleFormData) {
    try {
      setIsSubmitting(true);
      await updateBundle(id!, {
        ...data
      });
      toast({
        title: "Bundle Updated",
        description: "Your bundle has been successfully updated.",
        variant: "default"
      });
      navigate('/dashboard/bundles');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the bundle. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Edit Bundle</h2>
          <p className="text-muted-foreground">Update your travel bundle details</p>
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
          <CardTitle className="text-xl">Edit Bundle Information</CardTitle>
          <CardDescription>Modify the details of your bundle</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <Form {...form}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bundle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bundle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bundle Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a bundle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Platinum">Platinum</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-6 w-6 rounded-full border flex items-center justify-center cursor-pointer ${
                                field.value
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                              }`}
                              onClick={() => form.setValue('active', !field.value)}>
                              {field.value && <Check className="h-4 w-4" />}
                            </div>
                            <span>Active Bundle</span>
                          </div>
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base">Bundle Status</FormLabel>
                          <FormDescription>
                            Active bundles will be visible to customers in the shop
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter bundle description"
                            className="h-32 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="product_ids"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Products in Bundle</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* Slider Buttons */}
                            <button
                              type="button"
                              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-900/80 rounded-full shadow p-2"
                              onClick={() => {
                                const container = document.getElementById('products-slider');
                                if (container) container.scrollBy({ left: -320, behavior: 'smooth' });
                              }}
                              aria-label="Scroll left"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <div
                              id="products-slider"
                              className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2 px-8"
                              style={{ scrollSnapType: 'x mandatory' }}
                            >
                              {isLoading ? (
                                <div className="text-center py-12 w-full">
                                  <span>Loading products...</span>
                                </div>
                              ) : error ? (
                                <div className="text-center py-12 w-full">
                                  <span className="text-red-500">{error}</span>
                                </div>
                              ) : products.length > 0 ? (
                                products.map((product) => (
                                  <div
                                    key={product.id}
                                    className={`min-w-[280px] max-w-[320px] flex-shrink-0 rounded-xl border bg-white dark:bg-gray-900 shadow-md relative group transition-all duration-300
                                      ${field.value.includes(Number(product.id)) ? 'ring-2 ring-indigo-500' : 'hover:ring-2 hover:ring-indigo-300'}
                                    `}
                                    style={{ scrollSnapAlign: 'start' }}
                                  >
                                    {/* Checkbox overlay */}
                                    <div className="absolute top-3 right-3 z-20">
                                      <input
                                        type="checkbox"
                                        className="accent-indigo-500 w-5 h-5 rounded border-gray-300"
                                        checked={field.value.includes(Number(product.id))}
                                        onChange={e => {
                                          const pid = Number(product.id);
                                          if (e.target.checked) {
                                            if (!field.value.includes(pid)) {
                                              field.onChange([...field.value, pid]);
                                            }
                                          } else {
                                            field.onChange(field.value.filter((id: number) => id !== pid));
                                          }
                                        }}
                                      />
                                    </div>
                                    {/* Card Image */}
                                    <div className="relative aspect-w-16 aspect-h-9 overflow-hidden rounded-t-xl">
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-40 w-full object-cover transition-transform group-hover:scale-105 duration-500"
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
                                    {/* Card Content */}
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
                                ))
                              ) : (
                                <div className="text-center py-12 w-full">
                                  <p className="text-muted-foreground">No products available at the moment.</p>
                                </div>
                              )}
                            </div>
                            {/* Slider Buttons */}
                            <button
                              type="button"
                              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-900/80 rounded-full shadow p-2"
                              onClick={() => {
                                const container = document.getElementById('products-slider');
                                if (container) container.scrollBy({ left: 320, behavior: 'smooth' });
                              }}
                              aria-label="Scroll right"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select one or more products to include in this bundle.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/bundles')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                     onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}