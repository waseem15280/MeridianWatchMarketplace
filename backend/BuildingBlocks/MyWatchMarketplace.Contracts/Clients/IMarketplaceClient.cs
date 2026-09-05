using MyWatchMarketplace.Contracts.DTOs;

namespace MyWatchMarketplace.Contracts.Clients;

public interface IMarketplaceClient
{
    Task<bool> UpdateListingStatusAsync(string listingId, string status, CancellationToken cancellationToken = default);
    Task<bool> AdjustWishlistCountAsync(string listingId, int delta, CancellationToken cancellationToken = default);
    Task<CreateListingResponse?> CreateListingFromVaultAsync(CreateListingFromVaultRequest request, CancellationToken cancellationToken = default);
}

