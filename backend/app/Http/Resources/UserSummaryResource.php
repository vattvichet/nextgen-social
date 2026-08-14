<?php

namespace App\Http\Resources;

use App\Support\FileUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'avatar_url' => FileUrl::make($this->avatar_path),
            'bio' => $this->bio,
            'posts_count' => $this->whenCounted('posts'),
            'created_at' => $this->created_at,
        ];
    }
}
