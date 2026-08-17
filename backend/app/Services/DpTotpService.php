<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Thin server-side proxy for the DP TOTP 2FA API. The API key never
 * leaves the backend - every method here attaches it as a header and
 * returns the raw response so callers can inspect status/json as needed.
 */
class DpTotpService
{
    private function client()
    {
        return Http::baseUrl(config('services.dp_totp.base_url'))
            ->withHeaders(['X-API-KEY' => config('services.dp_totp.api_key')])
            ->acceptJson();
    }

    public function setup(string $externalUserId, string $email): Response
    {
        return $this->client()->post('/api/v1/totp/setup', [
            'external_user_id' => $externalUserId,
            'email' => $email,
        ]);
    }

    public function verifySetup(string $externalUserId, string $otpCode): Response
    {
        return $this->client()->post('/api/v1/totp/verify_setup', [
            'external_user_id' => $externalUserId,
            'otp_code' => $otpCode,
        ]);
    }

    public function verify(string $externalUserId, string $otpCode): Response
    {
        return $this->client()->post('/api/v1/totp/verify', [
            'external_user_id' => $externalUserId,
            'otp_code' => $otpCode,
        ]);
    }

    public function verifyRecovery(string $externalUserId, string $recoveryCode): Response
    {
        return $this->client()->post('/api/v1/totp/verify_recovery', [
            'external_user_id' => $externalUserId,
            'recovery_code' => $recoveryCode,
        ]);
    }

    public function status(string $externalUserId): Response
    {
        return $this->client()->get('/api/v1/totp/status', [
            'external_user_id' => $externalUserId,
        ]);
    }

    public function recoveryCodes(string $externalUserId): Response
    {
        return $this->client()->get('/api/v1/totp/recovery_codes', [
            'external_user_id' => $externalUserId,
        ]);
    }

    public function regenerateRecoveryCodes(string $externalUserId, string $otpCode): Response
    {
        return $this->client()->post('/api/v1/totp/recovery_codes/regenerate', [
            'external_user_id' => $externalUserId,
            'otp_code' => $otpCode,
        ]);
    }

    public function disable(string $externalUserId): Response
    {
        return $this->client()->delete('/api/v1/totp/disable', [
            'external_user_id' => $externalUserId,
        ]);
    }
}
