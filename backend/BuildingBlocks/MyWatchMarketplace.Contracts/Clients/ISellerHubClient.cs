using MyWatchMarketplace.Contracts.DTOs;

namespace MyWatchMarketplace.Contracts.Clients;

public interface ISellerHubClient
{
    Task<bool> IncrementSalesCountAsync(string sellerId, decimal amount, CancellationToken cancellationToken = default);
    Task<bool> SyncOfferToSellerAsync(SyncOfferToSellerRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateOfferStatusAsync(int offerId, string status, decimal? counterAmount = null, CancellationToken cancellationToken = default);
}
