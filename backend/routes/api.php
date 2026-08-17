<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostLikeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SavedPostController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Mid-login 2FA challenge: gated by the short-lived pending_token issued by
// /login itself (checked inside the controller), not by the auth:api guard -
// the user doesn't have a full session yet at this point.
Route::post('/login/verify-otp', [AuthController::class, 'verifyLoginOtp']);
Route::post('/login/verify-recovery', [AuthController::class, 'verifyLoginRecovery']);

// Public read access: anyone can browse the feed, posts/comments, and the member directory without logging in.
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{user}', [UserController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [ProfileController::class, 'update'])->middleware('throttle:profile-update');
    Route::post('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::post('/posts', [PostController::class, 'store'])->middleware('throttle:posts-create');
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    Route::get('/saved-posts', [SavedPostController::class, 'index']);
    Route::post('/posts/{post}/save', [SavedPostController::class, 'store']);
    Route::delete('/posts/{post}/save', [SavedPostController::class, 'destroy']);

    Route::post('/posts/{post}/like', [PostLikeController::class, 'store']);
    Route::delete('/posts/{post}/like', [PostLikeController::class, 'destroy']);

    Route::get('/2fa/status', [TwoFactorController::class, 'status']);
    Route::post('/2fa/setup', [TwoFactorController::class, 'setup']);
    Route::post('/2fa/verify-setup', [TwoFactorController::class, 'verifySetup']);
    Route::get('/2fa/recovery-codes', [TwoFactorController::class, 'recoveryCodes']);
    Route::post('/2fa/recovery-codes/regenerate', [TwoFactorController::class, 'regenerateRecoveryCodes']);
    Route::delete('/2fa/disable', [TwoFactorController::class, 'disable']);
});
