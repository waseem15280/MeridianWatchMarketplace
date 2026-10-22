using MyWatchMarketplace.EmailService.Domain.Enums;

namespace MyWatchMarketplace.EmailService.Application.Features.SendEmail;

public record SendEmailRequest(
    string To,
    string Subject,
    string BodyHtml,
    string? BodyText = null,
    EmailType Type = EmailType.Notification
);

public record SendEmailResponse(
    bool Success,
    string? MessageId = null,
    string? ErrorMessage = null
);

