using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.UserManagement.Domain.Entities;

namespace MyWatchMarketplace.UserManagement.Application.Common.Interfaces;

public interface IUserManagementDbContext
{
    DbSet<UserLogin> Logins { get; }
    DbSet<UserAccount> Accounts { get; }
    DbSet<SellerOnboardingRequest> SellerOnboardingRequests { get; }
    DbSet<SellerDecisionNotification> SellerDecisionNotifications { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
