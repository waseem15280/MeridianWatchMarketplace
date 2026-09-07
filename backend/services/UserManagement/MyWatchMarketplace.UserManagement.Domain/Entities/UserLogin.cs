using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.UserManagement.Domain.Entities;

public class UserLogin : BaseAuditableEntity<string>
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTimeOffset? LastLoginAt { get; set; }

    public ICollection<UserAccount> Accounts { get; set; } = new List<UserAccount>();
}
