<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Project extends Model
{
    protected $appends = ['image_url'];

    protected $casts = [
        'images' => 'array',
    ];

    protected $fillable = [
        'title',
        'slug',
        'description',
        'repo_url',
        'live_url',
        'image',
        'status'
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image
            ?  config('app.url') . Storage::url($this->image)
            : null;
    }

    public function technologies()
    {
        return $this->belongsToMany(Technology::class);
    }

    public function images()
    {
        return $this->hasMany(ProjectImage::class);
    }
}
