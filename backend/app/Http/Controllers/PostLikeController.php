<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class PostLikeController extends Controller
{
    private const MAX_ATTEMPTS = 20;
    private const DECAY_SECONDS = 3;

    public function store(Post $post)
    {
        $key = $this->throttleKey();

        $executed = RateLimiter::attempt($key, self::MAX_ATTEMPTS, function () use ($post) {
            Auth::guard('api')->user()->likedPosts()->syncWithoutDetaching([$post->id]);
        }, self::DECAY_SECONDS);

        if (! $executed) {
            return $this->tooManyAttemptsResponse($key);
        }

        return response()->json([
            'message' => 'Post liked.',
            'is_liked' => true,
            'likes_count' => $post->likedByUsers()->count(),
        ]);
    }

    public function destroy(Post $post)
    {
        $key = $this->throttleKey();

        $executed = RateLimiter::attempt($key, self::MAX_ATTEMPTS, function () use ($post) {
            Auth::guard('api')->user()->likedPosts()->detach($post->id);
        }, self::DECAY_SECONDS);

        if (! $executed) {
            return $this->tooManyAttemptsResponse($key);
        }

        return response()->json([
            'message' => 'Post unliked.',
            'is_liked' => false,
            'likes_count' => $post->likedByUsers()->count(),
        ]);
    }

    private function throttleKey(): string
    {
        return 'post-like:'.Auth::guard('api')->id();
    }

    private function tooManyAttemptsResponse(string $key)
    {
        return response()->json([
            'message' => "You're liking too fast. Please slow down.",
        ], 429, ['Retry-After' => RateLimiter::availableIn($key)]);
    }
}
