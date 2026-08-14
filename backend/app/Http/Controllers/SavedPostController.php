<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class SavedPostController extends Controller
{
    public function index()
    {
        $authUser = Auth::guard('api')->user();

        $posts = $authUser
            ->savedPosts()
            ->with('user', 'images')
            ->withCount(['comments', 'likedByUsers as likes_count'])
            ->withExists(['likedByUsers as is_liked' => fn ($q) => $q->where('user_id', $authUser->id)])
            ->orderByPivot('created_at', 'desc')
            ->paginate(10);

        $posts->getCollection()->each(fn (Post $post) => $post->is_saved = true);

        return PostResource::collection($posts);
    }

    public function store(Post $post)
    {
        Auth::guard('api')->user()->savedPosts()->syncWithoutDetaching([$post->id]);

        return response()->json(['message' => 'Post saved.', 'is_saved' => true]);
    }

    public function destroy(Post $post)
    {
        Auth::guard('api')->user()->savedPosts()->detach($post->id);

        return response()->json(['message' => 'Post unsaved.', 'is_saved' => false]);
    }
}
