namespace MyWatchMarketplace.Contracts.DTOs;

public record UpdateListingStatusRequest(string Status);

public record WishlistCountDeltaRequest(int Delta);

public record CreateListingFromVaultRequest(
    string SellerId,
    string SellerName,
    string Brand,
    string Model,
    string ReferenceNumber,
    int Year,
    decimal Price,
    string Currency,
    string Condition,
    string Movement,
    string CaseMaterial,
    int CaseDiameter,
    string DialColor,
    List<string> Images,
    string Description,
    int? FromPersonalCollectionId
);

public record CreateListingResponse(int Id, string Status);

public record SellerSaleNotificationRequest(string SellerId, decimal Amount);

public record SyncOfferToSellerRequest(
    int OfferId,
    int ListingId,
    string BuyerId,
    string BuyerName,
    string SellerId,
    decimal OfferAmount,
    decimal OriginalListingPrice,
    string Message,
    string Status,
    string WatchModel,
    string WatchBrand,
    string WatchImage
);

public record RespondOfferRequest(string Status, decimal? CounterAmount);
