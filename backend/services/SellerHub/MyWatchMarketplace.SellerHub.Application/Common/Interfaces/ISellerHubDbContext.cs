using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.SellerHub.Domain.Entities;

namespace MyWatchMarketplace.SellerHub.Application.Common.Interfaces;

public interface ISellerHubDbContext
{
    DbSet<SellerProfile> SellerProfiles { get; }

    DbSet<SellerReview> SellerReviews { get; }

    DbSet<SellerOfferNegotiation> SellerOffers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

