namespace MyWatchMarketplace.SharedKernel.Common;

public abstract class BaseAuditableEntity<TId> : BaseEntity<TId>, IAuditableEntity
{
    public DateTimeOffset Created { get; set; }

    public string? CreatedBy { get; set; }

    public DateTimeOffset LastModified { get; set; }

    public string? LastModifiedBy { get; set; }
}

public abstract class BaseAuditableEntity : BaseAuditableEntity<int>
{
}

