using MyWatchMarketplace.EmailService.Application.Common.Models;

namespace MyWatchMarketplace.EmailService.Application.Common.Interfaces;

public interface IEmailSender
{
    Task<EmailResult> SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);
}

