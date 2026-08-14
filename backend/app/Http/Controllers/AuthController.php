<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        
        $user = User::create([
            'name' => $request->username,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // try {
        //     Mail::to($user->email)->send(new WelcomeMail($user));
        // } catch (\Throwable $e) {
        //     Log::warning('Failed to send welcome email: '.$e->getMessage());
        // }

        $token = JWTAuth::fromUser($user);

        return $this->tokenResponse($token, $user);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->login)
            ->orWhere('username', $request->login)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $token = Auth::guard('api')->login($user);

        return $this->tokenResponse($token, $user);
    }

    public function logout()
    {
        Auth::guard('api')->logout();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me()
    {
        return new UserResource(Auth::guard('api')->user());
    }

    protected function tokenResponse(string $token, User $user)
    {
        return response()->json([
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'bearer',
        ]);
    }
}
