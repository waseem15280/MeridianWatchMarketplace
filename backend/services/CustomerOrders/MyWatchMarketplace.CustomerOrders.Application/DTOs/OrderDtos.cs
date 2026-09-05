namespace MyWatchMarketplace.CustomerOrders.Application.DTOs;

public record CustomerOrderDto(
    string Id,
    string ListingId,
    string WatchModel,
    string WatchBrand,
    string WatchReference,
    string WatchImage,
    string BuyerId,
    string BuyerName,
    string SellerId,
    string SellerName,
    decimal Price,
    decimal ShippingFee,
    decimal TotalAmount,
    string Status,
    string ShippingAddress,
    string PaymentMethod,
    string PaymentStatus,
    DateTimeOffset CreatedAt,
    string? TrackingNumber,
    bool HasReviewed
);

public record CreateCustomerOrderRequest(
    string ListingId,
    string WatchModel,
    string WatchBrand,
    string WatchReference,
    string WatchImage,
    string? BuyerId,
    string? BuyerName,
    string SellerId,
    string SellerName,
    decimal Price,
    decimal ShippingFee,
    string ShippingAddress,
    string? PaymentMethod
);

public record UpdateOrderStatusRequest(
    string Status,
    string? TrackingNumber
);

public record BuyerOfferDto(
    string Id,
    string ListingId,
    string BuyerId,
    string BuyerName,
    string SellerId,
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

public record CreateBuyerOfferRequest(
    string ListingId,
    string? BuyerId,
    string? BuyerName,
    string SellerId,
    string WatchModel,
    string WatchBrand,
    string WatchImage,
    decimal OfferAmount,
    decimal OriginalListingPrice,
    string Message
);

public record RespondBuyerOfferRequest(
    string Status,
    decimal? CounterAmount
);

