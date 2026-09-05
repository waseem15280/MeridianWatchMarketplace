using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.Contracts.DTOs;
using MyWatchMarketplace.SellerHub.Application.DTOs;
using MyWatchMarketplace.SellerHub.Domain.Common;
using MyWatchMarketplace.SellerHub.Domain.Entities;
using MyWatchMarketplace.SellerHub.Infrastructure;
using MyWatchMarketplace.SellerHub.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSellerHubInfrastructureServices(builder.Configuration);

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
    var initialiser = scope.ServiceProvider.GetRequiredService<SellerHubDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialise SellerHubDb on startup. Ensure PostgreSQL is running.");
        app.Logger.LogWarning(ex, "Could not initialise SellerHub database. Ensure PostgreSQL Docker is running.");
    }
}

app.UseHttpsRedirection();
var sellerApi = app.MapGroup("/api/seller-hub");

app.MapGet("/api/seller-hub/health", () => Results.Ok(new { status = "Healthy", service = "SellerHub" }))
   .WithName("SellerHubHealth");
// 1. GET /api/seller-hub/profiles - List all user/seller accounts
sellerApi.MapGet("/profiles", async (SellerHubDbContext db) =>
{
    var profiles = await db.SellerProfiles.AsNoTracking()
        .Select(p => new SellerProfileDto(
            p.Id,
            p.Name,
            p.Email,
            p.Avatar,
            p.Location,
            p.MemberSince,
            p.VerifiedDealer,
            p.Bio,
            p.Rating,
            p.ReviewCount,
            p.TotalSalesCount,
            p.ResponseRate,
            p.AvgShipTime,
            p.Phone
        )).ToListAsync();

    return Results.Ok(profiles);
});

// 2. GET /api/seller-hub/profiles/{userId}
sellerApi.MapGet("/profiles/{userId}", async (string userId, SellerHubDbContext db) =>
{
    var p = await db.SellerProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
    if (p is null) return Results.NotFound(new { message = $"Profile {userId} not found." });

    return Results.Ok(new SellerProfileDto(
        p.Id,
        p.Name,
        p.Email,
        p.Avatar,
        p.Location,
        p.MemberSince,
        p.VerifiedDealer,
        p.Bio,
        p.Rating,
        p.ReviewCount,
        p.TotalSalesCount,
        p.ResponseRate,
        p.AvgShipTime,
        p.Phone
    ));
});

// 3. PUT /api/seller-hub/profiles/{userId}
sellerApi.MapPut("/profiles/{userId}", async (string userId, UpdateSellerProfileRequest request, SellerHubDbContext db) =>
{
    var p = await db.SellerProfiles.FirstOrDefaultAsync(x => x.Id == userId);
    if (p is null) return Results.NotFound();

    if (!string.IsNullOrWhiteSpace(request.Name)) p.Name = request.Name;
    if (!string.IsNullOrWhiteSpace(request.Email)) p.Email = request.Email;
    if (!string.IsNullOrWhiteSpace(request.Avatar)) p.Avatar = request.Avatar;
    if (!string.IsNullOrWhiteSpace(request.Location)) p.Location = request.Location;
    if (!string.IsNullOrWhiteSpace(request.Bio)) p.Bio = request.Bio;
    if (request.Phone is not null) p.Phone = request.Phone;
    if (!string.IsNullOrWhiteSpace(request.ResponseRate)) p.ResponseRate = request.ResponseRate;
    if (!string.IsNullOrWhiteSpace(request.AvgShipTime)) p.AvgShipTime = request.AvgShipTime;

    await db.SaveChangesAsync();
    return Results.Ok(p);
});

// 4. GET /api/seller-hub/reviews?sellerId={sellerId}
sellerApi.MapGet("/reviews", async (string? sellerId, SellerHubDbContext db) =>
{
    var query = db.SellerReviews.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(sellerId))
    {
        query = query.Where(r => r.SellerId == sellerId);
    }

    var reviews = await query.OrderByDescending(r => r.Date)
        .Select(r => new SellerReviewDto(
            r.Id,
            r.SellerId,
            r.BuyerId,
            r.BuyerName,
            r.BuyerAvatar,
            r.Rating,
            r.SubRatings,
            r.Comment,
            r.WatchModel,
            r.WatchReference,
            r.Date,
            r.VerifiedPurchase,
            r.SellerReply
        )).ToListAsync();

    return Results.Ok(reviews);
});

// 5. POST /api/seller-hub/reviews - Leave a review & recompute aggregate
sellerApi.MapPost("/reviews", async (CreateSellerReviewRequest request, SellerHubDbContext db) =>
{
    var review = new SellerReview
    {
        Id = "rev-" + Guid.NewGuid().ToString("N")[..8],
        SellerId = request.SellerId,
        BuyerId = request.BuyerId,
        BuyerName = request.BuyerName,
        BuyerAvatar = request.BuyerAvatar,
        Rating = request.Rating,
        SubRatings = request.SubRatings ?? new ReviewSubRatings { Accuracy = request.Rating, Communication = request.Rating, Shipping = request.Rating, Authenticity = request.Rating },
        Comment = request.Comment,
        WatchModel = request.WatchModel,
        WatchReference = request.WatchReference,
        Date = DateTimeOffset.UtcNow.ToString("MMMM yyyy"),
        VerifiedPurchase = request.VerifiedPurchase
    };

    db.SellerReviews.Add(review);
    await db.SaveChangesAsync();

    // Recompute seller rating
    var seller = await db.SellerProfiles.FirstOrDefaultAsync(p => p.Id == request.SellerId);
    if (seller is not null)
    {
        var allRatings = await db.SellerReviews.Where(r => r.SellerId == request.SellerId).Select(r => r.Rating).ToListAsync();
        seller.Rating = Math.Round(allRatings.Average(), 2);
        seller.ReviewCount = allRatings.Count;
        await db.SaveChangesAsync();
    }

    return Results.Created($"/api/seller-hub/reviews/{review.Id}", review);
});

// 6. POST /api/seller-hub/reviews/{reviewId}/reply
sellerApi.MapPost("/reviews/{reviewId}/reply", async (string reviewId, ReviewReplyRequest request, SellerHubDbContext db) =>
{
    var review = await db.SellerReviews.FirstOrDefaultAsync(r => r.Id == reviewId);
    if (review is null) return Results.NotFound();

    review.SellerReply = request.SellerReply;
    await db.SaveChangesAsync();
    return Results.Ok(review);
});

// 7. GET /api/seller-hub/offers?sellerId={sellerId}
sellerApi.MapGet("/offers", async (string? sellerId, SellerHubDbContext db) =>
{
    var sId = sellerId ?? "user-current-seller";
    var offers = await db.SellerOffers.AsNoTracking()
        .Where(o => o.SellerId == sId)
        .OrderByDescending(o => o.CreatedAt)
        .Select(o => new SellerOfferNegotiationDto(
            o.Id,
            o.SellerId,
            o.ListingId,
            o.BuyerId,
            o.BuyerName,
            o.WatchModel,
            o.WatchBrand,
            o.WatchImage,
            o.OfferAmount,
            o.OriginalListingPrice,
            o.CounterAmount,
            o.Message,
            o.Status,
            o.CreatedAt
        )).ToListAsync();

    return Results.Ok(offers);
});

// 8. PATCH /api/seller-hub/offers/{offerId}/respond
sellerApi.MapPatch("/offers/{offerId}/respond", async (string offerId, RespondOfferRequest request, SellerHubDbContext db) =>
{
    var offer = await db.SellerOffers.FirstOrDefaultAsync(o => o.Id == offerId);
    if (offer is null) return Results.NotFound();

    offer.Status = request.Status;
    if (request.CounterAmount.HasValue) offer.CounterAmount = request.CounterAmount.Value;

    await db.SaveChangesAsync();
    return Results.Ok(offer);
});

// 9. POST /api/seller-hub/sales-count (INTER-SERVICE: Called by CustomerOrders when order is completed)
sellerApi.MapPost("/sales-count", async (SellerSaleNotificationRequest request, SellerHubDbContext db) =>
{
    var seller = await db.SellerProfiles.FirstOrDefaultAsync(p => p.Id == request.SellerId);
    if (seller is not null)
    {
        seller.TotalSalesCount++;
        await db.SaveChangesAsync();
    }
    return Results.Ok(new { success = true });
});

// 10. POST /api/seller-hub/offers/sync (INTER-SERVICE: Called by CustomerOrders when buyer creates offer)
sellerApi.MapPost("/offers/sync", async (SyncOfferToSellerRequest request, SellerHubDbContext db) =>
{
    var existing = await db.SellerOffers.FirstOrDefaultAsync(o => o.Id == request.OfferId);
    if (existing is null)
    {
        var negotiation = new SellerOfferNegotiation
        {
            Id = request.OfferId,
            SellerId = request.SellerId,
            ListingId = request.ListingId,
            BuyerId = request.BuyerId,
            BuyerName = request.BuyerName,
            OfferAmount = request.OfferAmount,
            OriginalListingPrice = request.OriginalListingPrice,
            Message = request.Message,
            Status = request.Status,
            WatchModel = request.WatchModel,
            WatchBrand = request.WatchBrand,
            WatchImage = request.WatchImage,
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.SellerOffers.Add(negotiation);
    }
    else
    {
        existing.Status = request.Status;
    }

    await db.SaveChangesAsync();
    return Results.Ok(new { success = true });
});

app.Run();

