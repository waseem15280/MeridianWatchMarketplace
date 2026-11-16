using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.UserManagement.Domain.Entities;

public class SellerOnboardingRequest : BaseAuditableEntity<int>
{
    public string Type { get; set; } = "new_user"; // "new_user" | "new_persona"

    public int? UserLoginId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? Bio { get; set; }

    public string Status { get; set; } = "pending"; // "pending" | "approved" | "rejected"

    public DateTimeOffset SubmittedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? ReviewedAt { get; set; }

    public string? ReviewedBy { get; set; }

    public string? AdminNotes { get; set; }

    public string? RejectionReason { get; set; }

    public bool UserNotified { get; set; }
}
