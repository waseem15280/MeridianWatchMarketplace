using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.CollectorVault.Domain.Entities;

public class ValuationRecord : BaseAuditableEntity<int>
{
    public string VaultWatchId { get; set; } = string.Empty;

    public DateTimeOffset RecordedDate { get; set; } = DateTimeOffset.UtcNow;

    public decimal EstimatedValue { get; set; }

    public string Source { get; set; } = "User";

    public string? Notes { get; set; }
}

