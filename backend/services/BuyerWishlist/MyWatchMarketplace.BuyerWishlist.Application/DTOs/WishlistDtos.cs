namespace MyWatchMarketplace.BuyerWishlist.Application.DTOs;

public record WishlistItemDto(
    int Id,
    string BuyerId,
    int ListingId,
    string? WatchBrand,
    string? WatchModel,
    decimal? PriceWhenAdded,
    string? Notes,
    string Priority,
    DateTimeOffset AddedAt
);

public record AddWishlistItemRequest(
    string? BuyerId,
    int ListingId,
    string? WatchBrand,
    string? WatchModel,
    decimal? PriceWhenAdded,
    string? Notes,
    string? Priority
);

public record UpdateWishlistNotesRequest(
    string? Notes,
    string? Priority
);
