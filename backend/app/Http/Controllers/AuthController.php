<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Mail\WelcomeMail;
use App\Models\User;
use App\Services\DpTotpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    private const PENDING_2FA_PURPOSE = '2fa_pending';
    private const PENDING_2FA_TTL_MINUTES = 5;

    public function __construct(private DpTotpService $dpTotp)
    {
    }

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

        $token = $this->issueFullToken($user);

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

        if ($this->userHasTwoFactorEnabled($user)) {
            $guard = Auth::guard('api');
            $guard->factory()->emptyClaims();

            $pendingToken = $guard
                ->claims(['purpose' => self::PENDING_2FA_PURPOSE])
                ->setTTL(self::PENDING_2FA_TTL_MINUTES)
                ->login($user);

            return response()->json([
                'status' => '2fa_required',
                'pending_token' => $pendingToken,
            ]);
        }

        $token = $this->issueFullToken($user);

        return $this->tokenResponse($token, $user);
    }

    public function verifyLoginOtp(Request $request)
    {
        $request->validate(['otp_code' => ['required', 'string']]);

        $user = $this->resolvePendingUser($request);

        if (! $user) {
            return response()->json(['message' => 'Your session has expired. Please log in again.'], 401);
        }

        $verify = $this->dpTotp->verify((string) $user->id, $request->otp_code);

        if (! $verify->successful() || $verify->json('status') !== 'verified') {
            return response()->json([
                'status' => 'invalid_code',
                'message' => $verify->json('message') ?? 'That code is incorrect or expired.',
            ], 422);
        }

        $token = $this->issueFullToken($user);

        return $this->tokenResponse($token, $user);
    }

    public function verifyLoginRecovery(Request $request)
    {
        $request->validate(['recovery_code' => ['required', 'string']]);

        $user = $this->resolvePendingUser($request);

        if (! $user) {
            return response()->json(['message' => 'Your session has expired. Please log in again.'], 401);
        }

        $verify = $this->dpTotp->verifyRecovery((string) $user->id, $request->recovery_code);

        if (! $verify->successful() || $verify->json('status') !== 'verified') {
            return response()->json([
                'status' => 'invalid_code',
                'message' => $verify->json('message') ?? 'That recovery code is incorrect or already used.',
            ], 422);
        }

        $token = $this->issueFullToken($user);

        $response = $this->tokenResponse($token, $user)->getData(true);
        $response['recovery_codes_remaining'] = $verify->json('recovery_codes_remaining');

        return response()->json($response);
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

    /**
     * Mint a normal, full-access token.
     *
     * tymon/jwt-auth's payload Factory accumulates claims across calls within
     * the same process instead of resetting between them (its internal
     * Collection is only cleared when make() is explicitly told to via
     * make(true), which the library itself never does) - and setTTL() is
     * similarly sticky. Left alone, a token minted right after the
     * short-lived pending-2FA token above would inherit both its
     * "purpose: 2fa_pending" claim AND its 5-minute TTL. Reset both
     * explicitly so every real token is clean regardless of what was minted
     * earlier in this process.
     */
    private function issueFullToken(User $user): string
    {
        $guard = Auth::guard('api');
        $guard->factory()->emptyClaims();

        return $guard->claims([])->setTTL(config('jwt.ttl'))->login($user);
    }

    /**
     * Whether this user has 2FA enabled, per DP TOTP. Fails safe (returns
     * false, i.e. skip the OTP challenge) if the key isn't configured yet or
     * the service is unreachable - a third-party outage should not be able
     * to lock every user in the app out of logging in, only the (currently
     * small) set who've actually enabled 2FA lose the challenge during such
     * an outage.
     */
    private function userHasTwoFactorEnabled(User $user): bool
    {
        if (! config('services.dp_totp.api_key')) {
            return false;
        }

        try {
            $status = $this->dpTotp->status((string) $user->id);

            return $status->successful() && (bool) $status->json('two_factor_enabled');
        } catch (\Throwable $e) {
            Log::warning('DP TOTP status check failed during login: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Validate the short-lived pending-login token issued after a
     * successful password check when 2FA is enabled, and resolve the user
     * it belongs to. Returns null for anything invalid, expired, or not
     * actually a pending-2FA token (e.g. a normal access token).
     */
    private function resolvePendingUser(Request $request): ?User
    {
        $pendingToken = $request->input('pending_token');

        if (! $pendingToken) {
            return null;
        }

        try {
            JWTAuth::setToken($pendingToken);

            if (JWTAuth::getClaim('purpose') !== self::PENDING_2FA_PURPOSE) {
                return null;
            }

            return JWTAuth::authenticate() ?: null;
        } catch (JWTException) {
            return null;
        }
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
