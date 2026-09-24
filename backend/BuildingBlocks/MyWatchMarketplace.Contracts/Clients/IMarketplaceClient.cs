using MyWatchMarketplace.Contracts.DTOs;

namespace MyWatchMarketplace.Contracts.Clients;

public interface IMarketplaceClient
{
    Task<bool> UpdateListingStatusAsync(int listingId, string status, CancellationToken cancellationToken = default);
    Task<bool> AdjustWishlistCountAsync(int listingId, int delta, CancellationToken cancellationToken = default);
    Task<CreateListingResponse?> CreateListingFromVaultAsync(CreateListingFromVaultRequest request, CancellationToken cancellationToken = default);
}
