namespace MyWatchMarketplace.EmailService.Application.Common.Models;

public record EmailResult(
    bool Success,
    string? MessageId = null,
    string? ErrorMessage = null,
    DateTimeOffset SentAt = default
);

