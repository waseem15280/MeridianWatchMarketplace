using MyWatchMarketplace.EmailService.Domain.Enums;
using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.EmailService.Domain.Entities;

public class EmailLog : BaseAuditableEntity<int>
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public EmailType Type { get; set; }
    public bool IsSent { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
}

