using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.UserManagement.Domain.Entities;

public class SellerDecisionNotification : BaseAuditableEntity<int>
{
    public int RequestId { get; set; }

    public int? UserLoginId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty; // "approved" | "rejected"

    public string DisplayName { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string? RejectionReason { get; set; }

    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public bool Acknowledged { get; set; }
}
