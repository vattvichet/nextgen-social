<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class FileUrl
{
    public static function make(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (config('filesystems.default') === 's3') {
            return Storage::temporaryUrl($path, now()->addMinutes(5));
        }

        return Storage::url($path);
    }
}
