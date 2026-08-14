<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(ProfileUpdateRequest $request)
    {
        $user = Auth::guard('api')->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::delete($user->avatar_path);
            }
            $user->avatar_path = $request->file('avatar')->store('avatars');
        }

        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }

        $user->save();

        return new UserResource($user);
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = Auth::guard('api')->user();
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
