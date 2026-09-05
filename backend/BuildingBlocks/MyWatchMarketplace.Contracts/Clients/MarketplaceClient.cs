using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using MyWatchMarketplace.Contracts.DTOs;

namespace MyWatchMarketplace.Contracts.Clients;

public class MarketplaceClient : IMarketplaceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MarketplaceClient> _logger;

    public MarketplaceClient(HttpClient httpClient, ILogger<MarketplaceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> UpdateListingStatusAsync(string listingId, string status, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PatchAsJsonAsync(
                $"/api/marketplace/listings/{listingId}/status",
                new UpdateListingStatusRequest(status),
                cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update listing status for {ListingId} to {Status}", listingId, status);
            return false;
        }
    }

    public async Task<bool> AdjustWishlistCountAsync(string listingId, int delta, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                $"/api/marketplace/listings/{listingId}/wishlist-delta",
                new WishlistCountDeltaRequest(delta),
                cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to adjust wishlist count for {ListingId} by {Delta}", listingId, delta);
            return false;
        }
    }

    public async Task<CreateListingResponse?> CreateListingFromVaultAsync(CreateListingFromVaultRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/marketplace/listings",
                request,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("CreateListingFromVault failed with status code {StatusCode}", response.StatusCode);
                return null;
            }

            return await response.Content.ReadFromJsonAsync<CreateListingResponse>(cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create listing from vault for watch {Model}", request.Model);
            return null;
        }
    }
}

