<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'images.max' => 'You can upload up to 5 photos per post.',
            'images.*.image' => 'Each file must be a photo.',
            'images.*.max' => 'Each photo must be 5MB or smaller.',
            'images.*.uploaded' => 'Each photo must be 5MB or smaller.',
        ];
    }
}
