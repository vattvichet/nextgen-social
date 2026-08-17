<?php

namespace App\Http\Controllers;

use App\Services\DpTotpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TwoFactorController extends Controller
{
    public function __construct(private DpTotpService $dpTotp)
    {
    }

    public function status()
    {
        $user = Auth::guard('api')->user();

        $response = $this->dpTotp->status((string) $user->id);

        // DP TOTP returns 404 "User not found. Call /setup first." for
        // anyone who has never started setup - which is the normal state
        // for most users, not an error. Translate it into a clean "not
        // enabled" response instead of surfacing it as a failure.
        if ($response->status() === 404) {
            return response()->json([
                'two_factor_enabled' => false,
                'recovery_codes_remaining' => 0,
                'status' => 'not_enabled',
            ]);
        }

        return response()->json($response->json(), $response->status());
    }

    public function setup()
    {
        $user = Auth::guard('api')->user();

        $response = $this->dpTotp->setup((string) $user->id, $user->email);

        return response()->json($response->json(), $response->status());
    }

    public function verifySetup(Request $request)
    {
        $request->validate(['otp_code' => ['required', 'string']]);

        $user = Auth::guard('api')->user();

        $response = $this->dpTotp->verifySetup((string) $user->id, $request->otp_code);

        return response()->json($response->json(), $response->status());
    }

    public function recoveryCodes()
    {
        $user = Auth::guard('api')->user();

        $response = $this->dpTotp->recoveryCodes((string) $user->id);

        return response()->json($response->json(), $response->status());
    }

    public function regenerateRecoveryCodes(Request $request)
    {
        $request->validate(['otp_code' => ['required', 'string']]);

        $user = Auth::guard('api')->user();

        $response = $this->dpTotp->regenerateRecoveryCodes((string) $user->id, $request->otp_code);

        return response()->json($response->json(), $response->status());
    }

    public function disable(Request $request)
    {
        $request->validate(['otp_code' => ['required', 'string']]);

        $user = Auth::guard('api')->user();
        $externalUserId = (string) $user->id;

        // DP TOTP's own /disable endpoint doesn't require a live code, so we
        // enforce that ourselves here as the guard for this destructive action.
        $verify = $this->dpTotp->verify($externalUserId, $request->otp_code);

        if (! $verify->successful() || $verify->json('status') !== 'verified') {
            return response()->json([
                'status' => 'invalid_code',
                'message' => 'That code is incorrect or expired.',
            ], 422);
        }

        $response = $this->dpTotp->disable($externalUserId);

        return response()->json($response->json(), $response->status());
    }
}
