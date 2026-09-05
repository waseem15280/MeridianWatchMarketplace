using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.BuyerWishlist.Domain.Entities;

namespace MyWatchMarketplace.BuyerWishlist.Application.Common.Interfaces;

public interface IBuyerWishlistDbContext
{
    DbSet<WishlistItem> WishlistItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

