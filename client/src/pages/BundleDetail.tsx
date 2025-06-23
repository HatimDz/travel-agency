import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBundleClientById } from "@/services/BundleService";
import { getProducts } from "@/services/productService";

function getDefaultImageByType(type?: string) {
  switch (type) {
    case "hotel":
      return "/images/default-hotel.jpg";
    case "flight":
      return "/images/default-flight.jpg";
    case "sport":
      return "/images/default-sport.jpg";
    case "entertainment":
      return "/images/default-entertainment.jpg";
    default:
      return "/images/default-product.jpg";
  }
}

export function BundleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const bundleData = await getBundleClientById(id!);
        setBundle(bundleData);

        // If bundle has products relation, use it, else fetch all and filter
        if (bundleData.products && Array.isArray(bundleData.products)) {
          setProducts(bundleData.products);
        } else if (bundleData.product_ids && bundleData.product_ids.length > 0) {
          const all = await getProducts({ isActive: true });
          const allProducts = Array.isArray(all) ? all : all.data;
          setProducts(
            allProducts.filter((p: any) => bundleData.product_ids.includes(p.id))
          );
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError("Failed to load bundle details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBundle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 border-r-purple-600 border-b-indigo-600 border-l-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
            <div className="text-indigo-600 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-3">Bundle Not Found</h2>
            <p className="text-indigo-700 mb-6">
              The bundle you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent"></div>
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        {/* Bundle Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-indigo-900/80 to-transparent">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 text-xs font-medium uppercase tracking-wider">
                    {bundle.type}
                  </Badge>
                  <Badge variant={bundle.active ? "success" : "destructive"}>
                    {bundle.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                  {bundle.name}
                </h1>
              </div>
              <div className="flex items-center bg-purple-600/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
                <div className="text-white">
                  <div className="text-sm uppercase tracking-wider font-medium mb-1">Price</div>
                  <div className="text-3xl font-bold">${bundle.price}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <Card className="overflow-hidden border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b border-indigo-100">
                <CardTitle className="text-xl text-indigo-900">About This Bundle</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none text-indigo-800">
                  <p className="text-lg leading-relaxed">{bundle.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Products in Bundle */}
            <Card className="overflow-hidden border-0 shadow-lg bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b border-indigo-100">
                <CardTitle className="text-xl text-indigo-900 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-indigo-500" />
                  Products Included
                </CardTitle>
                <CardDescription>
                  {products.length} product{products.length !== 1 ? "s" : ""} in this bundle
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {products.length === 0 ? (
                  <div className="text-gray-400">No products in this bundle.</div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2 px-2" style={{ scrollSnapType: 'x mandatory' }}>
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-xl border bg-white dark:bg-gray-900 shadow-md relative group transition-all duration-300 hover:shadow-xl"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <div className="relative aspect-w-16 aspect-h-9 overflow-hidden rounded-t-xl">
                          <img
                            src={product.image || getDefaultImageByType(product.type)}
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                <CardTitle className="flex items-center">Bundle Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      {bundle.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm text-gray-700">
                      Created: {bundle.created_at ? new Date(bundle.created_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Type: </span>
                    <span className="text-sm">{bundle.type}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Price: </span>
                    <span className="text-sm">${bundle.price}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Products: </span>
                    <span className="text-sm">{products.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}