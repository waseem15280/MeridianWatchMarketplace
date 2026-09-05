using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.BuyerWishlist.Domain.Enums;

namespace MyWatchMarketplace.BuyerWishlist.Domain.Entities;

public class WishlistItem : BaseAuditableEntity<int>
{
    public string BuyerId { get; set; } = string.Empty;

    public string ListingId { get; set; } = string.Empty;

    public string? WatchBrand { get; set; }

    public string? WatchModel { get; set; }

    public decimal? PriceWhenAdded { get; set; }

    public string? Notes { get; set; }

    public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;

    public DateTimeOffset AddedAt { get; set; } = DateTimeOffset.UtcNow;
}

