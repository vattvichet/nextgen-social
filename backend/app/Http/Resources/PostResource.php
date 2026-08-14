<?php

namespace App\Http\Resources;

use App\Support\FileUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => FileUrl::make($image->path),
            ])),
            'comments_count' => $this->whenCounted('comments'),
            'likes_count' => $this->when(isset($this->likes_count), fn () => (int) $this->likes_count),
            'is_saved' => $this->when(isset($this->is_saved), fn () => (bool) $this->is_saved),
            'is_liked' => $this->when(isset($this->is_liked), fn () => (bool) $this->is_liked),
            'user' => new UserResource($this->whenLoaded('user')),
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
            'created_at' => $this->created_at,
        ];
    }
}
