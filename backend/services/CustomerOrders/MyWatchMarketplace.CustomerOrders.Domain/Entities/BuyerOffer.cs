using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.CustomerOrders.Domain.Entities;

public class BuyerOffer : BaseAuditableEntity<string>
{
    public string ListingId { get; set; } = string.Empty;

    public string BuyerId { get; set; } = string.Empty;

    public string BuyerName { get; set; } = string.Empty;

    public string SellerId { get; set; } = string.Empty;

    public string WatchModel { get; set; } = string.Empty;

    public string WatchBrand { get; set; } = string.Empty;

    public string WatchImage { get; set; } = string.Empty;

    public decimal OfferAmount { get; set; }

    public decimal OriginalListingPrice { get; set; }

    public decimal? CounterAmount { get; set; }

    public string Message { get; set; } = string.Empty;

    public string Status { get; set; } = "pending";

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

