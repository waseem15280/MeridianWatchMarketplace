using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.CollectorVault.Application.DTOs;
using MyWatchMarketplace.CollectorVault.Domain.Entities;
using MyWatchMarketplace.CollectorVault.Infrastructure;
using MyWatchMarketplace.CollectorVault.Infrastructure.Persistence;
using MyWatchMarketplace.Contracts.Clients;
using MyWatchMarketplace.Contracts.DTOs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCollectorVaultInfrastructureServices(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    using var scope = app.Services.CreateScope();
    var initialiser = scope.ServiceProvider.GetRequiredService<CollectorVaultDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialise CollectorVault database. Ensure PostgreSQL Docker is running.");
    }
}

app.UseHttpsRedirection();
var vaultApi = app.MapGroup("/api/collector-vault/watches");

app.MapGet("/api/collector-vault/health", () => Results.Ok(new { status = "Healthy", service = "CollectorVault" }))
   .WithName("CollectorVaultHealth");

// 1. GET /api/collector-vault/watches?userId={userId}
vaultApi.MapGet("/", async (string? userId, CollectorVaultDbContext db) =>
{
    var query = db.VaultWatches.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(userId))
    {
        query = query.Where(w => w.UserId == userId);
    }

    var list = await query.OrderByDescending(w => w.CreatedAt)
        .Select(w => new VaultWatchDto(
            w.Id,
            w.UserId,
            w.Brand,
            w.Model,
            w.ReferenceNumber,
            w.Year,
            w.SerialNumber,
            w.CaseDiameter,
            w.CaseMaterial,
            w.Movement,
            w.DialColor,
            w.Condition,
            w.PurchasePrice,
            w.PurchaseDate,
            w.EstimatedMarketValue,
            w.Images,
            w.Notes,
            w.IsListedForSale,
            w.ListingId,
            w.CreatedAt
        )).ToListAsync();

    return Results.Ok(list);
});

// 2. GET /api/collector-vault/watches/{id:int}
vaultApi.MapGet("/{id:int}", async (int id, CollectorVaultDbContext db) =>
{
    var watch = await db.VaultWatches.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id);
    if (watch is null) return Results.NotFound(new { message = $"Watch {id} not found in vault." });

    return Results.Ok(new VaultWatchDto(
        watch.Id,
        watch.UserId,
        watch.Brand,
        watch.Model,
        watch.ReferenceNumber,
        watch.Year,
        watch.SerialNumber,
        watch.CaseDiameter,
        watch.CaseMaterial,
        watch.Movement,
        watch.DialColor,
        watch.Condition,
        watch.PurchasePrice,
        watch.PurchaseDate,
        watch.EstimatedMarketValue,
        watch.Images,
        watch.Notes,
        watch.IsListedForSale,
        watch.ListingId,
        watch.CreatedAt
    ));
});

// 3. POST /api/collector-vault/watches - Add to vault
vaultApi.MapPost("/", async (CreateVaultWatchRequest request, CollectorVaultDbContext db) =>
{
    var watch = new VaultWatch
    {
        UserId = request.UserId ?? "1",
        Brand = request.Brand,
        Model = request.Model,
        ReferenceNumber = request.ReferenceNumber,
        Year = request.Year,
        SerialNumber = request.SerialNumber,
        CaseDiameter = request.CaseDiameter,
        CaseMaterial = request.CaseMaterial,
        Movement = request.Movement,
        DialColor = request.DialColor,
        Condition = request.Condition,
        PurchasePrice = request.PurchasePrice,
        PurchaseDate = request.PurchaseDate,
        EstimatedMarketValue = request.EstimatedMarketValue,
        Images = request.Images ?? new(),
        Notes = request.Notes,
        IsListedForSale = false,
        CreatedAt = DateTimeOffset.UtcNow
    };

    db.VaultWatches.Add(watch);
    await db.SaveChangesAsync();

    return Results.Created($"/api/collector-vault/watches/{watch.Id}", watch);
});

// 4. PUT /api/collector-vault/watches/{id:int}
vaultApi.MapPut("/{id:int}", async (int id, UpdateVaultWatchRequest request, CollectorVaultDbContext db) =>
{
    var watch = await db.VaultWatches.FirstOrDefaultAsync(w => w.Id == id);
    if (watch is null) return Results.NotFound();

    if (!string.IsNullOrWhiteSpace(request.Condition)) watch.Condition = request.Condition;
    if (request.EstimatedMarketValue.HasValue) watch.EstimatedMarketValue = request.EstimatedMarketValue.Value;
    if (request.PurchasePrice.HasValue) watch.PurchasePrice = request.PurchasePrice.Value;
    if (!string.IsNullOrWhiteSpace(request.PurchaseDate)) watch.PurchaseDate = request.PurchaseDate;
    if (!string.IsNullOrWhiteSpace(request.Notes)) watch.Notes = request.Notes;
    if (request.Images is not null) watch.Images = request.Images;

    await db.SaveChangesAsync();
    return Results.Ok(watch);
});

// 5. DELETE /api/collector-vault/watches/{id:int}
vaultApi.MapDelete("/{id:int}", async (int id, CollectorVaultDbContext db) =>
{
    var watch = await db.VaultWatches.FirstOrDefaultAsync(w => w.Id == id);
    if (watch is null) return Results.NotFound();

    db.VaultWatches.Remove(watch);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// 6. POST /api/collector-vault/watches/{id:int}/valuations
vaultApi.MapPost("/{id:int}/valuations", async (int id, AddValuationRequest request, CollectorVaultDbContext db) =>
{
    var watch = await db.VaultWatches.FirstOrDefaultAsync(w => w.Id == id);
    if (watch is null) return Results.NotFound();

    var record = new ValuationRecord
    {
        VaultWatchId = id,
        RecordedDate = DateTimeOffset.UtcNow,
        EstimatedValue = request.EstimatedValue,
        Source = request.Source ?? "User",
        Notes = request.Notes
    };

    watch.EstimatedMarketValue = request.EstimatedValue;

    db.ValuationRecords.Add(record);
    await db.SaveChangesAsync();

    return Results.Created($"/api/collector-vault/watches/{id}/valuations/{record.Id}", record);
});

// 7. GET /api/collector-vault/watches/{id:int}/valuations
vaultApi.MapGet("/{id:int}/valuations", async (int id, CollectorVaultDbContext db) =>
{
    var records = await db.ValuationRecords.AsNoTracking()
        .Where(v => v.VaultWatchId == id)
        .OrderByDescending(v => v.RecordedDate)
        .Select(v => new ValuationRecordDto(v.Id, v.VaultWatchId, v.EstimatedValue, v.RecordedDate, v.Source, v.Notes))
        .ToListAsync();

    return Results.Ok(records);
});

// 8. POST /api/collector-vault/watches/{id:int}/list-for-sale (INTER-SERVICE: CollectorVault -> Marketplace)
vaultApi.MapPost("/{id:int}/list-for-sale", async (
    int id,
    ListVaultWatchForSaleRequest request,
    CollectorVaultDbContext db,
    IMarketplaceClient marketplaceClient) =>
{
    var watch = await db.VaultWatches.FirstOrDefaultAsync(w => w.Id == id);
    if (watch is null) return Results.NotFound(new { message = $"Watch {id} not found." });

    // Call Marketplace API to create new listing
    var listingReq = new CreateListingFromVaultRequest(
        SellerId: request.SellerId ?? watch.UserId,
        SellerName: request.SellerName ?? "Alexander Vance",
        Brand: watch.Brand,
        Model: watch.Model,
        ReferenceNumber: watch.ReferenceNumber,
        Year: watch.Year,
        Price: request.Price,
        Currency: "USD",
        Condition: watch.Condition,
        Movement: watch.Movement,
        CaseMaterial: watch.CaseMaterial,
        CaseDiameter: (int)watch.CaseDiameter,
        DialColor: watch.DialColor,
        Images: watch.Images,
        Description: request.Description ?? watch.Notes ?? $"Offering my personal {watch.Brand} {watch.Model} from collection.",
        FromPersonalCollectionId: watch.Id
    );

    var createdListing = await marketplaceClient.CreateListingFromVaultAsync(listingReq);

    watch.IsListedForSale = true;
    watch.ListingId = createdListing?.Id;

    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Listed for sale on Marketplace", watchId = watch.Id, listingId = watch.ListingId });
});

// 9. POST /api/collector-vault/watches/{id:int}/unlink-listing
vaultApi.MapPost("/{id:int}/unlink-listing", async (int id, CollectorVaultDbContext db) =>
{
    var watch = await db.VaultWatches.FirstOrDefaultAsync(w => w.Id == id);
    if (watch is null) return Results.NotFound();

    watch.IsListedForSale = false;
    watch.ListingId = null;
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Unlinked listing from vault watch", watchId = watch.Id });
});

app.Run();
