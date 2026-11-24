namespace MyWatchMarketplace.SellerHub.Application.DTOs;

public record ChatMessageDto(
    string Id,
    string ConversationId,
    string ListingId,
    string BuyerId,
    string BuyerName,
    string SellerId,
    string SellerName,
    string Sender,
    string Text,
    string? ImageUrl,
    string? WatchBrand,
    string? WatchModel,
    decimal? Price,
    DateTimeOffset CreatedAt,
    bool IsRead = false
);

public record ChatConversationDto(
    string Id,
    string ListingId,
    string WatchModel,
    string WatchBrand,
    string WatchImage,
    decimal Price,
    string BuyerId,
    string BuyerName,
    string SellerId,
    string SellerName,
    string LastMessage,
    DateTimeOffset LastMessageAt,
    int UnreadCountSeller,
    int UnreadCountBuyer
);

public record MobileNotificationDto(
    string Id,
    string ConversationId,
    string ListingId,
    string WatchModel,
    string WatchBrand,
    string WatchImage,
    decimal Price,
    string BuyerName,
    string MessageText,
    DateTimeOffset Timestamp,
    bool IsRead
);
