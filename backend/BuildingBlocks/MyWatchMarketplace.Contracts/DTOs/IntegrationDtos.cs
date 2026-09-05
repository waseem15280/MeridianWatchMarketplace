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
    string FromPersonalCollectionId
);

public record CreateListingResponse(string Id, string Status);

public record SellerSaleNotificationRequest(string SellerId, decimal Amount);

public record SyncOfferToSellerRequest(
    string OfferId,
    string ListingId,
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

