namespace MyWatchMarketplace.SharedKernel.Common;

public interface IDomainEvent
{
    DateTimeOffset OccurredOn { get; }
}

public abstract record BaseDomainEvent : IDomainEvent
{
    public DateTimeOffset OccurredOn { get; init; } = DateTimeOffset.UtcNow;
}

