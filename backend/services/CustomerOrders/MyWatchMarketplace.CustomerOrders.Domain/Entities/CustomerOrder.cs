using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.CustomerOrders.Domain.Entities;

public class CustomerOrder : BaseAuditableEntity<string>
{
    public string ListingId { get; set; } = string.Empty;

    public string WatchModel { get; set; } = string.Empty;

    public string WatchBrand { get; set; } = string.Empty;

    public string WatchReference { get; set; } = string.Empty;

    public string WatchImage { get; set; } = string.Empty;

    public string BuyerId { get; set; } = string.Empty;

    public string BuyerName { get; set; } = string.Empty;

    public string SellerId { get; set; } = string.Empty;

    public string SellerName { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public decimal ShippingFee { get; set; }

    public decimal TotalAmount { get; set; }

    public string ShippingAddress { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = "Escrow";

    public string PaymentStatus { get; set; } = "Authorized";

    public string Status { get; set; } = "pending";

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public string? TrackingNumber { get; set; }

    public bool HasReviewed { get; set; }
}

