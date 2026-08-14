<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('posts-create', function ($request) {
            return Limit::perHour(20)->by($request->user()?->id ?: $request->ip())
                ->response(function ($request, $headers) {
                    return response()->json([
                        'message' => "You've reached the limit of 20 posts per hour.",
                    ], 429, $headers);
                });
        });

        RateLimiter::for('profile-update', function ($request) {
            return Limit::perHour(3)->by($request->user()?->id ?: $request->ip())
                ->response(function ($request, $headers) {
                    return response()->json([
                        'message' => "You've reached the limit of 3 profile updates per hour.",
                    ], 429, $headers);
                });
        });
    }
}
