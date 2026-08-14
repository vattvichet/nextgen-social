<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'min:3', 'max:30', 'alpha_dash', 'unique:users,username'],
            'email' => [
                'required', 'string', 'email', 'max:255', 'unique:users,email',
                function ($attribute, $value, $fail) {
                    if (! preg_match('/^nextgen\.?([0-9]{1,3})@dpcloud\.com$/i', $value, $matches)) {
                        $fail('Registration is currently limited to invited email addresses.');
                        return;
                    }

                    $number = (int) $matches[1];

                    if ($number < 1 || $number > 100) {
                        $fail('Registration is currently limited to invited email addresses.');
                    }
                },
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
