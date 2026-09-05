using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.marketplace.Domain.Entities;

public class WatchListing : BaseAuditableEntity<string>
{
    public string SellerId { get; set; } = string.Empty;

    public string SellerName { get; set; } = string.Empty;

    public double SellerRating { get; set; }

    public int SellerReviewCount { get; set; }

    public bool SellerVerified { get; set; }

    public string SellerLocation { get; set; } = string.Empty;

    // Watch Details
    public string Brand { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public string ReferenceNumber { get; set; } = string.Empty;

    public int Year { get; set; }

    public decimal Price { get; set; }

    public decimal? OriginalPrice { get; set; }

    public string Currency { get; set; } = "USD";

    public string Condition { get; set; } = string.Empty;

    public string Movement { get; set; } = string.Empty;

    public string CaseMaterial { get; set; } = string.Empty;

    public double CaseDiameter { get; set; }

    public string DialColor { get; set; } = string.Empty;

    public string BraceletMaterial { get; set; } = string.Empty;

    public string? WaterResistance { get; set; }

    public string? Caliber { get; set; }

    public string? PowerReserve { get; set; }

    // Package details
    public bool HasOriginalBox { get; set; }

    public bool HasOriginalPapers { get; set; }

    public bool? HasServicePapers { get; set; }

    public string? WarrantyUntil { get; set; }

    // Content & Visuals
    public List<string> Images { get; set; } = new();

    public string Description { get; set; } = string.Empty;

    public string? ProvenanceNotes { get; set; }

    public bool AuthenticityVerified { get; set; }

    // Status & Metrics
    public string Status { get; set; } = "active";

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public int ViewsCount { get; set; }

    public int WishlistCount { get; set; }

    public bool? IsFeatured { get; set; }

    public string? FromPersonalCollectionId { get; set; }
}
