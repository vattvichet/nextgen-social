@extends('emails.layout')

@section('content')
<p style="margin:0 0 16px 0; font-size:18px; font-weight:700; color:#18181b;">Reset your password</p>

<p style="margin:0 0 16px 0;">
Hi {{ $name }}, we received a request to reset the password for your NextGen account. Click the button below to choose a new one.
</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr>
<td style="border-radius:8px; background-color:#18181b;">
<a href="{{ $resetUrl }}" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">
Reset password
</a>
</td>
</tr>
</table>

<p style="margin:0 0 12px 0; color:#71717a; font-size:13px;">
This link expires in 60 minutes. If you didn't request a password reset, you can safely ignore this email &mdash; your password won't be changed.
</p>

<p style="margin:0; color:#a1a1aa; font-size:12px; word-break:break-all;">
{{ $resetUrl }}
</p>
@endsection
