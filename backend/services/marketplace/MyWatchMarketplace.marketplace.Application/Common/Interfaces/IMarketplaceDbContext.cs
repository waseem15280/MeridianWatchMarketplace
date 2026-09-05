using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.marketplace.Domain.Entities;

namespace MyWatchMarketplace.marketplace.Application.Common.Interfaces;

public interface IMarketplaceDbContext
{
    DbSet<WatchListing> WatchListings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
