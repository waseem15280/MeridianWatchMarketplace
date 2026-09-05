using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.SellerHub.Domain.Common;

namespace MyWatchMarketplace.SellerHub.Domain.Entities;

public class SellerReview : BaseAuditableEntity<string>
{
    public string SellerId { get; set; } = string.Empty;

    public string BuyerId { get; set; } = string.Empty;

    public string BuyerName { get; set; } = string.Empty;

    public string? BuyerAvatar { get; set; }

    public int Rating { get; set; }

    public ReviewSubRatings? SubRatings { get; set; }

    public string Comment { get; set; } = string.Empty;

    public string WatchModel { get; set; } = string.Empty;

    public string? WatchReference { get; set; }

    public string Date { get; set; } = string.Empty;

    public bool VerifiedPurchase { get; set; }

    public string? SellerReply { get; set; }
}

