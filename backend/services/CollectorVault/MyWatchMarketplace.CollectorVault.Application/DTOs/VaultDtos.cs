namespace MyWatchMarketplace.CollectorVault.Application.DTOs;

public record VaultWatchDto(
    string Id,
    string UserId,
    string Brand,
    string Model,
    string ReferenceNumber,
    int Year,
    string? SerialNumber,
    double CaseDiameter,
    string CaseMaterial,
    string Movement,
    string DialColor,
    string Condition,
    decimal? PurchasePrice,
    string? PurchaseDate,
    decimal EstimatedMarketValue,
    List<string> Images,
    string? Notes,
    bool IsListedForSale,
    string? ListingId,
    DateTimeOffset CreatedAt
);

public record CreateVaultWatchRequest(
    string? UserId,
    string Brand,
    string Model,
    string ReferenceNumber,
    int Year,
    string? SerialNumber,
    double CaseDiameter,
    string CaseMaterial,
    string Movement,
    string DialColor,
    string Condition,
    decimal? PurchasePrice,
    string? PurchaseDate,
    decimal EstimatedMarketValue,
    List<string> Images,
    string? Notes
);

public record UpdateVaultWatchRequest(
    string? Condition,
    decimal? EstimatedMarketValue,
    decimal? PurchasePrice,
    string? PurchaseDate,
    string? Notes,
    List<string>? Images
);

public record ValuationRecordDto(
    int Id,
    string VaultWatchId,
    decimal EstimatedValue,
    DateTimeOffset RecordedDate,
    string Source,
    string? Notes
);

public record AddValuationRequest(
    decimal EstimatedValue,
    string? Source,
    string? Notes
);

public record ListVaultWatchForSaleRequest(
    decimal Price,
    string? Description,
    string? SellerId,
    string? SellerName
);
