<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $authUser = $this->optionalAuthUser($request);

        $posts = Post::with('user', 'images')
            ->withCount(['comments', 'likedByUsers as likes_count'])
            ->when($authUser, fn ($query) => $query->withExists([
                'savedByUsers as is_saved' => fn ($q) => $q->where('user_id', $authUser->id),
                'likedByUsers as is_liked' => fn ($q) => $q->where('user_id', $authUser->id),
            ]))
            ->when($request->filled('user_id'), fn ($query) => $query->where('user_id', $request->user_id))
            ->latest()
            ->paginate(10);

        return PostResource::collection($posts);
    }

    private function optionalAuthUser(Request $request): ?User
    {
        try {
            return Auth::guard('api')->user();
        } catch (\Throwable) {
            return null;
        }
    }

    public function store(StorePostRequest $request)
    {
        $post = Auth::guard('api')->user()->posts()->create([
            'body' => $request->body,
        ]);

        foreach ($request->file('images', []) as $position => $file) {
            $post->images()->create([
                'path' => $file->store('posts'),
                'position' => $position,
            ]);
        }

        $post->load('user', 'images')->loadCount(['comments', 'likedByUsers as likes_count']);

        return new PostResource($post);
    }

    public function show(Request $request, Post $post)
    {
        $post->load('user', 'images', 'comments.user')->loadCount(['comments', 'likedByUsers as likes_count']);

        if ($authUser = $this->optionalAuthUser($request)) {
            $post->is_saved = $post->savedByUsers()->where('user_id', $authUser->id)->exists();
            $post->is_liked = $post->likedByUsers()->where('user_id', $authUser->id)->exists();
        }

        return new PostResource($post);
    }

    public function destroy(Post $post)
    {
        if ($post->user_id !== Auth::guard('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        foreach ($post->images as $image) {
            Storage::delete($image->path);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted.']);
    }
}
