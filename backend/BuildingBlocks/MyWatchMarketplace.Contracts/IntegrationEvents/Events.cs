namespace MyWatchMarketplace.Contracts.IntegrationEvents;

public interface IIntegrationEvent
{
    Guid EventId { get; }
    DateTimeOffset OccurredOn { get; }
}

public record ListingCreatedIntegrationEvent(
    Guid EventId,
    DateTimeOffset OccurredOn,
    string ListingId,
    string SellerId,
    string Brand,
    string Model,
    decimal Price
) : IIntegrationEvent;

public record ListingSoldIntegrationEvent(
    Guid EventId,
    DateTimeOffset OccurredOn,
    string ListingId,
    string BuyerId,
    string SellerId,
    decimal FinalPrice
) : IIntegrationEvent;

public record OrderPlacedIntegrationEvent(
    Guid EventId,
    DateTimeOffset OccurredOn,
    string OrderId,
    string ListingId,
    string BuyerId,
    string SellerId,
    decimal TotalAmount
) : IIntegrationEvent;

