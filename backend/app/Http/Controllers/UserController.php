<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserSummaryResource;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount('posts')->orderBy('name')->get();

        return UserSummaryResource::collection($users);
    }

    public function show(User $user)
    {
        $user->loadCount('posts');

        return new UserSummaryResource($user);
    }
}
