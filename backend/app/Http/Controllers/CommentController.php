<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Post $post)
    {
        $comments = $post->comments()->with('user')->get();

        return CommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Post $post)
    {
        $comment = $post->comments()->create([
            'user_id' => Auth::guard('api')->id(),
            'body' => $request->body,
        ]);

        $comment->load('user');

        return new CommentResource($comment);
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== Auth::guard('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }
}
