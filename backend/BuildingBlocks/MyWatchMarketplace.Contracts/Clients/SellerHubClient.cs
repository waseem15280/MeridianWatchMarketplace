using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using MyWatchMarketplace.Contracts.DTOs;

namespace MyWatchMarketplace.Contracts.Clients;

public class SellerHubClient : ISellerHubClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SellerHubClient> _logger;

    public SellerHubClient(HttpClient httpClient, ILogger<SellerHubClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> IncrementSalesCountAsync(string sellerId, decimal amount, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/seller-hub/sales-count",
                new SellerSaleNotificationRequest(sellerId, amount),
                cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to increment sales count for seller {SellerId}", sellerId);
            return false;
        }
    }

    public async Task<bool> SyncOfferToSellerAsync(SyncOfferToSellerRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/seller-hub/offers/sync",
                request,
                cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync offer {OfferId} to seller {SellerId}", request.OfferId, request.SellerId);
            return false;
        }
    }

    public async Task<bool> UpdateOfferStatusAsync(string offerId, string status, decimal? counterAmount = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.PatchAsJsonAsync(
                $"/api/seller-hub/offers/{offerId}/respond",
                new RespondOfferRequest(status, counterAmount),
                cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update offer status for {OfferId} to {Status}", offerId, status);
            return false;
        }
    }
}

