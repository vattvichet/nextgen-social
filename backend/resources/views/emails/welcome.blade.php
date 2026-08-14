@extends('emails.layout')

@section('content')
<p style="margin:0 0 16px 0; font-size:18px; font-weight:700; color:#18181b;">Welcome, {{ $name }} &#128075;</p>

<p style="margin:0 0 16px 0;">
Thanks for joining NextGen! Your account <strong>@{{ $username }}</strong> is ready to go &mdash; share a post, upload some photos, and see what everyone else is up to.
</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr>
<td style="border-radius:8px; background-color:#18181b;">
<a href="{{ $feedUrl }}" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">
Go to your feed
</a>
</td>
</tr>
</table>

<p style="margin:0; color:#71717a; font-size:13px;">
If you didn't create this account, you can safely ignore this email.
</p>
@endsection
