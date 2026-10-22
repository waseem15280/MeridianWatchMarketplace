using MyWatchMarketplace.EmailService.Application.Common.Interfaces;

namespace MyWatchMarketplace.EmailService.Infrastructure.Templates;

public class HtmlEmailTemplateService : IEmailTemplateService
{
    public string GeneratePasswordResetEmail(string recipientName, string resetUrl, int expirationMinutes)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>Reset Your Meridian Password</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }}
    .wrapper {{
      width: 100%;
      table-layout: fixed;
      background-color: #0b0f19;
      padding-bottom: 40px;
    }}
    .main {{
      background-color: #111827;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border: 1px solid #1f2937;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }}
    .header {{
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid #334155;
    }}
    .brand {{
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #f59e0b;
      text-transform: uppercase;
      margin: 0;
    }}
    .subbrand {{
      font-size: 11px;
      letter-spacing: 0.3em;
      color: #94a3b8;
      text-transform: uppercase;
      margin-top: 6px;
    }}
    .content {{
      padding: 36px 32px;
    }}
    .greeting {{
      font-size: 18px;
      font-weight: 600;
      color: #f8fafc;
      margin-bottom: 16px;
    }}
    .paragraph {{
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 24px;
    }}
    .button-container {{
      text-align: center;
      margin: 32px 0;
    }}
    .button {{
      display: inline-block;
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 36px;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);
      letter-spacing: 0.05em;
    }}
    .link-fallback {{
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 12px 16px;
      word-break: break-all;
      font-family: monospace;
      font-size: 13px;
      color: #38bdf8;
      margin-bottom: 24px;
    }}
    .notice {{
      font-size: 13px;
      color: #94a3b8;
      border-left: 3px solid #f59e0b;
      padding-left: 12px;
      margin: 24px 0;
    }}
    .footer {{
      background-color: #0b0f19;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }}
  </style>
</head>
<body>
  <div class=""wrapper"">
    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" border=""0"">
      <tr>
        <td align=""center"" style=""padding: 24px 12px;"">
          <div class=""main"">
            <div class=""header"">
              <div class=""brand"">MERIDIAN</div>
              <div class=""subbrand"">HAUTE HORLOGERIE &amp; TIMEPIECES</div>
            </div>
            <div class=""content"">
              <div class=""greeting"">Hello {recipientName},</div>
              <p class=""paragraph"">
                We received a request to reset the password for your Meridian Watch Marketplace account. Click the button below to establish a new password:
              </p>
              <div class=""button-container"">
                <a href=""{resetUrl}"" class=""button"" target=""_blank"">Reset Your Password</a>
              </div>
              <div class=""notice"">
                <strong>Important:</strong> This reset link will securely expire in <strong>{expirationMinutes} minutes</strong>. If you did not initiate this request, no action is required; your account remains completely secure.
              </div>
              <p class=""paragraph"" style=""font-size: 13px; color: #94a3b8; margin-top: 24px;"">
                If the button above does not work, copy and paste the following URL directly into your web browser:
              </p>
              <div class=""link-fallback"">
                {resetUrl}
              </div>
            </div>
            <div class=""footer"">
              &copy; {DateTime.UtcNow.Year} Meridian Watch Marketplace. All rights reserved.<br>
              Refined Horology Exchange &bull; Certified Authenticity
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>";
    }

    public string GeneratePasswordChangedConfirmationEmail(string recipientName)
    {
        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <title>Password Changed Successfully</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }}
    .wrapper {{
      width: 100%;
      background-color: #0b0f19;
      padding: 30px 12px;
    }}
    .main {{
      background-color: #111827;
      margin: 0 auto;
      max-width: 600px;
      border: 1px solid #1f2937;
      border-radius: 12px;
      overflow: hidden;
    }}
    .header {{
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid #334155;
    }}
    .brand {{
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #f59e0b;
    }}
    .content {{
      padding: 36px 32px;
    }}
    .alert-box {{
      background-color: rgba(16, 185, 129, 0.1);
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      color: #34d399;
      font-weight: 500;
    }}
    .footer {{
      background-color: #0b0f19;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }}
  </style>
</head>
<body>
  <div class=""wrapper"">
    <div class=""main"">
      <div class=""header"">
        <div class=""brand"">MERIDIAN</div>
      </div>
      <div class=""content"">
        <h2 style=""color: #f8fafc; margin-top: 0;"">Password Updated</h2>
        <p>Hello {recipientName},</p>
        <div class=""alert-box"">
          Your password for Meridian Watch Marketplace was successfully changed on {DateTime.UtcNow:MMMM dd, yyyy HH:mm} UTC.
        </div>
        <p style=""color: #94a3b8; font-size: 14px;"">
          If you did not perform this change, please contact our security team immediately.
        </p>
      </div>
      <div class=""footer"">
        &copy; {DateTime.UtcNow.Year} Meridian Watch Marketplace.
      </div>
    </div>
  </div>
</body>
</html>";
    }
}

