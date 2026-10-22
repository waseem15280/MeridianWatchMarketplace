using MyWatchMarketplace.EmailService.Domain.Enums;

namespace MyWatchMarketplace.EmailService.Application.Common.Models;

public record EmailMessage(
    string To,
    string Subject,
    string BodyHtml,
    string? BodyText = null,
    EmailType Type = EmailType.PasswordReset
);

