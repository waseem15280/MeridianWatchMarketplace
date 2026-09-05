using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.CollectorVault.Domain.Entities;

public class VaultWatch : BaseAuditableEntity<string>
{
    public string UserId { get; set; } = string.Empty;

    public string Brand { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public string ReferenceNumber { get; set; } = string.Empty;

    public int Year { get; set; }

    public string? SerialNumber { get; set; }

    public double CaseDiameter { get; set; }

    public string CaseMaterial { get; set; } = string.Empty;

    public string Movement { get; set; } = string.Empty;

    public string DialColor { get; set; } = string.Empty;

    public string Condition { get; set; } = string.Empty;

    public decimal? PurchasePrice { get; set; }

    public string? PurchaseDate { get; set; }

    public decimal EstimatedMarketValue { get; set; }

    public List<string> Images { get; set; } = new();

    public string? Notes { get; set; }

    public bool IsListedForSale { get; set; }

    public string? ListingId { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

