<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Bundle;

class BundleController extends Controller
{
    public function index()
    {
        return Bundle::with('products')->get();
    }

    // POST /api/bundles
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:Silver,Gold,Platinum',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'active' => 'boolean',
            'product_ids' => 'array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $bundle = Bundle::create($validated);

        if (!empty($validated['product_ids'])) {
            $bundle->products()->attach($validated['product_ids']);
        }

        return response()->json($bundle->load('products'), 201);
    }

    // GET /api/bundles/{id}
    public function show($id)
    {
        return Bundle::with('products')->findOrFail($id);
    }

    // PUT /api/bundles/{id}
    public function update(Request $request, $id)
    {
        $bundle = Bundle::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|in:Silver,Gold,Platinum',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'active' => 'boolean',
            'product_ids' => 'array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $bundle->update($validated);

        if (isset($validated['product_ids'])) {
            $bundle->products()->sync($validated['product_ids']);
        }

        return response()->json($bundle->load('products'));
    }

    // DELETE /api/bundles/{id}
    public function destroy($id)
    {
        $bundle = Bundle::findOrFail($id);
        $bundle->products()->detach();
        $bundle->delete();

        return response()->json(['message' => 'Bundle deleted successfully']);
    }
}
