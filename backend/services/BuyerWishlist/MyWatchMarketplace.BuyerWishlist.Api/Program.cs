using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.BuyerWishlist.Application.DTOs;
using MyWatchMarketplace.BuyerWishlist.Domain.Entities;
using MyWatchMarketplace.BuyerWishlist.Domain.Enums;
using MyWatchMarketplace.BuyerWishlist.Infrastructure;
using MyWatchMarketplace.BuyerWishlist.Infrastructure.Persistence;
using MyWatchMarketplace.Contracts.Clients;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddBuyerWishlistInfrastructureServices(builder.Configuration);

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
    var initialiser = scope.ServiceProvider.GetRequiredService<BuyerWishlistDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialise BuyerWishlistDb on startup. Ensure PostgreSQL is running.");
        app.Logger.LogWarning(ex, "Could not initialise BuyerWishlist database. Ensure PostgreSQL Docker is running.");
    }
}

app.UseHttpsRedirection();
var wishlistApi = app.MapGroup("/api/buyer-wishlist");

app.MapGet("/api/buyer-wishlist/health", () => Results.Ok(new { status = "Healthy", service = "BuyerWishlist" }))
   .WithName("BuyerWishlistHealth");
// 1. GET /api/buyer-wishlist?buyerId={buyerId}
wishlistApi.MapGet("/", async (string? buyerId, BuyerWishlistDbContext db) =>
{
    var bId = buyerId ?? "user-current-seller";
    var items = await db.WishlistItems.AsNoTracking()
        .Where(w => w.BuyerId == bId)
        .OrderByDescending(w => w.AddedAt)
        .Select(w => new WishlistItemDto(
            w.Id,
            w.BuyerId,
            w.ListingId,
            w.WatchBrand,
            w.WatchModel,
            w.PriceWhenAdded,
            w.Notes,
            w.Priority.ToString(),
            w.AddedAt
        )).ToListAsync();

    return Results.Ok(items);
});

// 2. GET /api/buyer-wishlist/check?buyerId={buyerId}&listingId={listingId}
wishlistApi.MapGet("/check", async (string buyerId, string listingId, BuyerWishlistDbContext db) =>
{
    var exists = await db.WishlistItems.AsNoTracking()
        .AnyAsync(w => w.BuyerId == buyerId && w.ListingId == listingId);

    return Results.Ok(new { inWishlist = exists });
});

// 3. POST /api/buyer-wishlist - Add item to wishlist (INTER-SERVICE: BuyerWishlist -> Marketplace)
wishlistApi.MapPost("/", async (
    AddWishlistItemRequest request,
    BuyerWishlistDbContext db,
    IMarketplaceClient marketplaceClient) =>
{
    var buyerId = request.BuyerId ?? "user-current-seller";

    var existing = await db.WishlistItems
        .FirstOrDefaultAsync(w => w.BuyerId == buyerId && w.ListingId == request.ListingId);

    if (existing is not null)
    {
        return Results.Ok(new WishlistItemDto(
            existing.Id,
            existing.BuyerId,
            existing.ListingId,
            existing.WatchBrand,
            existing.WatchModel,
            existing.PriceWhenAdded,
            existing.Notes,
            existing.Priority.ToString(),
            existing.AddedAt
        ));
    }

    var priority = Enum.TryParse<PriorityLevel>(request.Priority, true, out var parsedPriority)
        ? parsedPriority
        : PriorityLevel.Medium;

    var item = new WishlistItem
    {
        BuyerId = buyerId,
        ListingId = request.ListingId,
        WatchBrand = request.WatchBrand,
        WatchModel = request.WatchModel,
        PriceWhenAdded = request.PriceWhenAdded,
        Notes = request.Notes,
        Priority = priority,
        AddedAt = DateTimeOffset.UtcNow
    };

    db.WishlistItems.Add(item);
    await db.SaveChangesAsync();

    // Notify Marketplace to increment wishlist count
    await marketplaceClient.AdjustWishlistCountAsync(request.ListingId, 1);

    return Results.Created($"/api/buyer-wishlist/{item.Id}", new WishlistItemDto(
        item.Id,
        item.BuyerId,
        item.ListingId,
        item.WatchBrand,
        item.WatchModel,
        item.PriceWhenAdded,
        item.Notes,
        item.Priority.ToString(),
        item.AddedAt
    ));
});

// 4. DELETE /api/buyer-wishlist/{listingId}?buyerId={buyerId} (INTER-SERVICE: BuyerWishlist -> Marketplace)
wishlistApi.MapDelete("/{listingId}", async (
    string listingId,
    string? buyerId,
    BuyerWishlistDbContext db,
    IMarketplaceClient marketplaceClient) =>
{
    var bId = buyerId ?? "user-current-seller";
    var item = await db.WishlistItems
        .FirstOrDefaultAsync(w => w.BuyerId == bId && w.ListingId == listingId);

    if (item is null) return Results.NotFound();

    db.WishlistItems.Remove(item);
    await db.SaveChangesAsync();

    // Notify Marketplace to decrement wishlist count
    await marketplaceClient.AdjustWishlistCountAsync(listingId, -1);

    return Results.NoContent();
});

// 5. DELETE /api/buyer-wishlist/clear?buyerId={buyerId}
wishlistApi.MapDelete("/clear", async (string? buyerId, BuyerWishlistDbContext db) =>
{
    var bId = buyerId ?? "user-current-seller";
    var items = await db.WishlistItems.Where(w => w.BuyerId == bId).ToListAsync();

    db.WishlistItems.RemoveRange(items);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// 6. PUT /api/buyer-wishlist/{id}/notes
wishlistApi.MapPut("/{id:int}/notes", async (int id, UpdateWishlistNotesRequest request, BuyerWishlistDbContext db) =>
{
    var item = await db.WishlistItems.FirstOrDefaultAsync(w => w.Id == id);
    if (item is null) return Results.NotFound();

    if (request.Notes is not null) item.Notes = request.Notes;
    if (!string.IsNullOrWhiteSpace(request.Priority) && Enum.TryParse<PriorityLevel>(request.Priority, true, out var p))
    {
        item.Priority = p;
    }

    await db.SaveChangesAsync();
    return Results.Ok(item);
});

app.Run();

