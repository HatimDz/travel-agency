<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Get all products
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // In a real application, this would fetch actual data from the database
        // For now, we're returning mock data
        $products = Product::paginate(20);

        return response()->json($products);
    }

    /**
     * Get a specific product by ID
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        // Mock product data for demonstration
        $product = Product::find($id);

        return response()->json($product);
    }
}
