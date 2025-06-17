<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bundle extends Model
{
      protected $fillable = [
        'name',
        'type',       // Silver, Gold, Platinum
        'description',
        'price',
        'active'
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'bundle_product')->withTimestamps();
    }
}
