namespace MyWatchMarketplace.EmailService.Application.Common.Interfaces;

public interface IEmailTemplateService
{
    string GeneratePasswordResetEmail(string recipientName, string resetUrl, int expirationMinutes);
    string GeneratePasswordChangedConfirmationEmail(string recipientName);
}

