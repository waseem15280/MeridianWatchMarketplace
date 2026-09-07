using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.UserManagement.Domain.Enums;

namespace MyWatchMarketplace.UserManagement.Domain.Entities;

public class UserAccount : BaseAuditableEntity<string>
{
    public string UserLoginId { get; set; } = string.Empty;

    public UserLogin? UserLogin { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public string Avatar { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string MemberSince { get; set; } = string.Empty;

    public bool VerifiedDealer { get; set; }

    public string Bio { get; set; } = string.Empty;

    public double Rating { get; set; }

    public int ReviewCount { get; set; }

    public int TotalSalesCount { get; set; }

    public string ResponseRate { get; set; } = string.Empty;

    public string AvgShipTime { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public bool IsDefault { get; set; }
}
