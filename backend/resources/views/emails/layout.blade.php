<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $subject ?? 'NextGen' }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f8f8f8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8; padding:32px 16px;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; border:1px solid #e4e4e6; overflow:hidden;">
<tr>
<td style="padding:32px 32px 8px 32px;">
<span style="font-size:20px; font-weight:700; color:#18181b;">&#9651; NextGen</span>
</td>
</tr>
<tr>
<td style="padding:16px 32px 32px 32px; color:#3f3f45; font-size:14px; line-height:1.6;">
@yield('content')
</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr>
<td align="center" style="padding:20px 8px; color:#a1a1aa; font-size:11px; letter-spacing:0.05em; text-transform:uppercase;">
&copy; {{ date('Y') }} NextGen. All rights reserved.
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
