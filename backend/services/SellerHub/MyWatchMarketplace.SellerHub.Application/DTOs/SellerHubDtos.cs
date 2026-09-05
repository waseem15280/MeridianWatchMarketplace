using MyWatchMarketplace.SellerHub.Domain.Common;

namespace MyWatchMarketplace.SellerHub.Application.DTOs;

public record SellerProfileDto(
    string Id,
    string Name,
    string Email,
    string Avatar,
    string Location,
    string MemberSince,
    bool VerifiedDealer,
    string Bio,
    double Rating,
    int ReviewCount,
    int TotalSalesCount,
    string ResponseRate,
    string AvgShipTime,
    string? Phone
);

public record UpdateSellerProfileRequest(
    string? Name,
    string? Email,
    string? Avatar,
    string? Location,
    string? Bio,
    string? Phone,
    string? ResponseRate,
    string? AvgShipTime
);

public record SellerReviewDto(
    string Id,
    string SellerId,
    string BuyerId,
    string BuyerName,
    string? BuyerAvatar,
    int Rating,
    ReviewSubRatings? SubRatings,
    string Comment,
    string WatchModel,
    string? WatchReference,
    string Date,
    bool VerifiedPurchase,
    string? SellerReply
);

public record CreateSellerReviewRequest(
    string SellerId,
    string BuyerId,
    string BuyerName,
    string? BuyerAvatar,
    int Rating,
    ReviewSubRatings? SubRatings,
    string Comment,
    string WatchModel,
    string? WatchReference,
    bool VerifiedPurchase
);

public record ReviewReplyRequest(string SellerReply);

public record SellerOfferNegotiationDto(
    string Id,
    string SellerId,
    string ListingId,
    string BuyerId,
    string BuyerName,
    string WatchModel,
    string WatchBrand,
    string WatchImage,
    decimal OfferAmount,
    decimal OriginalListingPrice,
    decimal? CounterAmount,
    string Message,
    string Status,
    DateTimeOffset CreatedAt
);

public record RespondToSellerOfferRequest(
    string Status,
    decimal? CounterAmount
);

