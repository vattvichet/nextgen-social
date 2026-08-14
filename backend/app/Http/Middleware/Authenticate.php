<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * This is an API-only backend with no web login route, so never redirect
     * on unauthenticated requests — always let it fall through to a JSON 401.
     */
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
