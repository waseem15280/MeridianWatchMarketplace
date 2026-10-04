using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.marketplace.Application.Common.Interfaces;
using MyWatchMarketplace.marketplace.Application.DTOs;
using MyWatchMarketplace.marketplace.Domain.Entities;
using MyWatchMarketplace.marketplace.Infrastructure;
using MyWatchMarketplace.marketplace.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddInfrastructureServices(builder.Configuration);

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
}

using (var scope = app.Services.CreateScope())
{
    var initialiser = scope.ServiceProvider
    .GetRequiredService<MarketplaceDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();

        app.Logger.LogInformation(
            "Marketplace database initialized successfully.");
    }

    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialise Marketplace database. Please ensure PostgreSQL Docker is running.");
    }
}

app.UseHttpsRedirection();
var listingsApi = app.MapGroup("/api/marketplace/listings");

app.MapGet("/api/marketplace/health", () => Results.Ok(new { status = "Healthy", service = "Marketplace" }))
   .WithName("MarketplaceHealth");

// Image Upload Endpoint (Cloudinary)
app.MapPost("/api/marketplace/images/upload", async (HttpRequest request, [FromServices] ICloudinaryService cloudinaryService, CancellationToken cancellationToken) =>
{
    if (!request.HasFormContentType)
    {
        return Results.BadRequest(new { message = "Content-Type must be multipart/form-data" });
    }

    var form = await request.ReadFormAsync(cancellationToken);
    var files = form.Files;

    if (files.Count == 0)
    {
        return Results.BadRequest(new { message = "No files uploaded." });
    }

    if (files.Count > 5)
    {
        return Results.BadRequest(new { message = "Maximum of 5 images allowed per listing." });
    }

    var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"
    };

    var uploadedUrls = new List<string>();
    foreach (var file in files)
    {
        if (file.Length == 0) continue;
        if (file.Length > 10 * 1024 * 1024)
        {
            return Results.BadRequest(new { message = $"File '{file.FileName}' exceeds the maximum allowed size of 10MB." });
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext) || !allowedExtensions.Contains(ext))
        {
            return Results.BadRequest(new { message = $"File format '{ext}' is not supported. Allowed formats: JPG, JPEG, PNG, WEBP, GIF, AVIF." });
        }

        using var stream = file.OpenReadStream();
        var url = await cloudinaryService.UploadImageAsync(stream, file.FileName, cancellationToken: cancellationToken);
        uploadedUrls.Add(url);
    }

    return Results.Ok(new { urls = uploadedUrls });
}).DisableAntiforgery();

// 1. GET /api/marketplace/listings - Query with filtering & search
listingsApi.MapGet("/", async (
    string? search,
    string? brand,
    string? movement,
    string? condition,
    decimal? minPrice,
    decimal? maxPrice,
    bool? hasBox,
    bool? hasPapers,
    string? sortBy,
    MarketplaceDbContext db) =>
{
    var query = db.WatchListings.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        var s = search.ToLower();
        query = query.Where(w =>
            w.Brand.ToLower().Contains(s) ||
            w.Model.ToLower().Contains(s) ||
            w.ReferenceNumber.ToLower().Contains(s) ||
            w.Description.ToLower().Contains(s));
    }

    if (!string.IsNullOrWhiteSpace(brand))
    {
        var brands = brand.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        query = query.Where(w => brands.Contains(w.Brand));
    }

    if (!string.IsNullOrWhiteSpace(movement))
    {
        var movements = movement.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        query = query.Where(w => movements.Contains(w.Movement));
    }

    if (!string.IsNullOrWhiteSpace(condition))
    {
        var conditions = condition.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        query = query.Where(w => conditions.Contains(w.Condition));
    }

    if (minPrice.HasValue)
        query = query.Where(w => w.Price >= minPrice.Value);

    if (maxPrice.HasValue)
        query = query.Where(w => w.Price <= maxPrice.Value);

    if (hasBox.HasValue && hasBox.Value)
        query = query.Where(w => w.HasOriginalBox);

    if (hasPapers.HasValue && hasPapers.Value)
        query = query.Where(w => w.HasOriginalPapers);

    // Sorting
    query = sortBy switch
    {
        "price-asc" => query.OrderBy(w => w.Price),
        "price-desc" => query.OrderByDescending(w => w.Price),
        "rating-desc" => query.OrderByDescending(w => w.SellerRating),
        "popular" => query.OrderByDescending(w => w.ViewsCount),
        _ => query.OrderByDescending(w => w.CreatedAt)
    };

    var results = await query.Select(w => new WatchListingDto(
        w.Id,
        w.SellerId,
        w.SellerName,
        w.SellerRating,
        w.SellerReviewCount,
        w.SellerVerified,
        w.SellerLocation,
        w.Brand,
        w.Model,
        w.ReferenceNumber,
        w.Year,
        w.Price,
        w.OriginalPrice,
        w.Currency,
        w.Condition,
        w.Movement,
        w.CaseMaterial,
        w.CaseDiameter,
        w.DialColor,
        w.BraceletMaterial,
        w.WaterResistance,
        w.Caliber,
        w.PowerReserve,
        w.HasOriginalBox,
        w.HasOriginalPapers,
        w.HasServicePapers,
        w.WarrantyUntil,
        w.Images,
        w.Description,
        w.ProvenanceNotes,
        w.AuthenticityVerified,
        w.Status,
        w.CreatedAt,
        w.ViewsCount,
        w.WishlistCount,
        w.IsFeatured,
        w.FromPersonalCollectionId
    )).ToListAsync();

    return Results.Ok(results);
});

// 2. GET /api/marketplace/listings/{id:int}
listingsApi.MapGet("/{id:int}", async (int id, MarketplaceDbContext db) =>
{
    var listing = await db.WatchListings.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id);
    if (listing is null) return Results.NotFound(new { message = $"Listing {id} not found." });

    return Results.Ok(new WatchListingDto(
        listing.Id,
        listing.SellerId,
        listing.SellerName,
        listing.SellerRating,
        listing.SellerReviewCount,
        listing.SellerVerified,
        listing.SellerLocation,
        listing.Brand,
        listing.Model,
        listing.ReferenceNumber,
        listing.Year,
        listing.Price,
        listing.OriginalPrice,
        listing.Currency,
        listing.Condition,
        listing.Movement,
        listing.CaseMaterial,
        listing.CaseDiameter,
        listing.DialColor,
        listing.BraceletMaterial,
        listing.WaterResistance,
        listing.Caliber,
        listing.PowerReserve,
        listing.HasOriginalBox,
        listing.HasOriginalPapers,
        listing.HasServicePapers,
        listing.WarrantyUntil,
        listing.Images,
        listing.Description,
        listing.ProvenanceNotes,
        listing.AuthenticityVerified,
        listing.Status,
        listing.CreatedAt,
        listing.ViewsCount,
        listing.WishlistCount,
        listing.IsFeatured,
        listing.FromPersonalCollectionId
    ));
});

// 3. POST /api/marketplace/listings - Create listing
listingsApi.MapPost("/", async (CreateWatchListingRequest request, MarketplaceDbContext db, [FromServices] ICloudinaryService cloudinaryService, CancellationToken cancellationToken) =>
{
    var finalImages = new List<string>();
    if (request.Images != null)
    {
        foreach (var img in request.Images)
        {
            if (string.IsNullOrWhiteSpace(img)) continue;
            if (img.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
            {
                var uploadedUrl = await cloudinaryService.UploadImageAsync(img, cancellationToken: cancellationToken);
                finalImages.Add(uploadedUrl);
            }
            else
            {
                finalImages.Add(img);
            }
        }
    }

    var listing = new WatchListing
    {
        SellerId = request.SellerId ?? "1",
        SellerName = request.SellerName ?? "Alexander Vance",
        SellerRating = request.SellerRating ?? 4.92,
        SellerReviewCount = request.SellerReviewCount ?? 19,
        SellerVerified = request.SellerVerified ?? true,
        SellerLocation = request.SellerLocation ?? "New York, USA",
        Brand = request.Brand,
        Model = request.Model,
        ReferenceNumber = request.ReferenceNumber,
        Year = request.Year,
        Price = request.Price,
        OriginalPrice = request.OriginalPrice,
        Currency = request.Currency ?? "USD",
        Condition = request.Condition,
        Movement = request.Movement,
        CaseMaterial = request.CaseMaterial,
        CaseDiameter = request.CaseDiameter,
        DialColor = request.DialColor,
        BraceletMaterial = request.BraceletMaterial,
        WaterResistance = request.WaterResistance,
        Caliber = request.Caliber,
        PowerReserve = request.PowerReserve,
        HasOriginalBox = request.HasOriginalBox,
        HasOriginalPapers = request.HasOriginalPapers,
        HasServicePapers = request.HasServicePapers,
        WarrantyUntil = request.WarrantyUntil,
        Images = finalImages,
        Description = request.Description,
        ProvenanceNotes = request.ProvenanceNotes,
        AuthenticityVerified = request.AuthenticityVerified,
        Status = "active",
        CreatedAt = DateTimeOffset.UtcNow,
        ViewsCount = 1,
        WishlistCount = 0,
        IsFeatured = request.IsFeatured ?? false,
        FromPersonalCollectionId = request.FromPersonalCollectionId
    };

    db.WatchListings.Add(listing);
    await db.SaveChangesAsync(cancellationToken);

    return Results.Created($"/api/marketplace/listings/{listing.Id}", listing);
});

// 4. PUT /api/marketplace/listings/{id:int} - Update listing
listingsApi.MapPut("/{id:int}", async (int id, UpdateWatchListingRequest request, MarketplaceDbContext db, [FromServices] ICloudinaryService cloudinaryService, CancellationToken cancellationToken) =>
{
    var listing = await db.WatchListings.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    if (listing is null) return Results.NotFound(new { message = $"Listing {id} not found." });

    if (request.Price.HasValue) listing.Price = request.Price.Value;
    if (request.OriginalPrice.HasValue) listing.OriginalPrice = request.OriginalPrice.Value;
    if (!string.IsNullOrWhiteSpace(request.Condition)) listing.Condition = request.Condition;
    if (!string.IsNullOrWhiteSpace(request.Description)) listing.Description = request.Description;
    if (!string.IsNullOrWhiteSpace(request.ProvenanceNotes)) listing.ProvenanceNotes = request.ProvenanceNotes;
    if (request.Images is not null)
    {
        var finalImages = new List<string>();
        foreach (var img in request.Images)
        {
            if (string.IsNullOrWhiteSpace(img)) continue;
            if (img.StartsWith("data:image", StringComparison.OrdinalIgnoreCase))
            {
                var uploadedUrl = await cloudinaryService.UploadImageAsync(img, cancellationToken: cancellationToken);
                finalImages.Add(uploadedUrl);
            }
            else
            {
                finalImages.Add(img);
            }
        }
        listing.Images = finalImages;
    }
    if (!string.IsNullOrWhiteSpace(request.Status)) listing.Status = request.Status;
    if (request.IsFeatured.HasValue) listing.IsFeatured = request.IsFeatured.Value;

    await db.SaveChangesAsync(cancellationToken);
    return Results.Ok(listing);
});

// 5. DELETE /api/marketplace/listings/{id:int}
listingsApi.MapDelete("/{id:int}", async (int id, MarketplaceDbContext db) =>
{
    var listing = await db.WatchListings.FirstOrDefaultAsync(w => w.Id == id);
    if (listing is null) return Results.NotFound(new { message = $"Listing {id} not found." });

    db.WatchListings.Remove(listing);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// 6. PATCH /api/marketplace/listings/{id:int}/status (Called by CustomerOrders / SellerHub)
listingsApi.MapPatch("/{id:int}/status", async (int id, MyWatchMarketplace.Contracts.DTOs.UpdateListingStatusRequest request, MarketplaceDbContext db) =>
{
    var listing = await db.WatchListings.FirstOrDefaultAsync(w => w.Id == id);
    if (listing is null) return Results.NotFound(new { message = $"Listing {id} not found." });

    listing.Status = request.Status;
    await db.SaveChangesAsync();
    return Results.Ok(new { id = listing.Id, status = listing.Status });
});

// 7. POST /api/marketplace/listings/{id:int}/view
listingsApi.MapPost("/{id:int}/view", async (int id, MarketplaceDbContext db) =>
{
    var listing = await db.WatchListings.FirstOrDefaultAsync(w => w.Id == id);
    if (listing is null) return Results.NotFound();

    listing.ViewsCount++;
    await db.SaveChangesAsync();
    return Results.Ok(new { viewsCount = listing.ViewsCount });
});

// 8. POST /api/marketplace/listings/{id:int}/wishlist-delta (Called by BuyerWishlist)
listingsApi.MapPost("/{id:int}/wishlist-delta", async (int id, MyWatchMarketplace.Contracts.DTOs.WishlistCountDeltaRequest request, MarketplaceDbContext db) =>
{
    var listing = await db.WatchListings.FirstOrDefaultAsync(w => w.Id == id);
    if (listing is null) return Results.NotFound();

    listing.WishlistCount = Math.Max(0, listing.WishlistCount + request.Delta);
    await db.SaveChangesAsync();
    return Results.Ok(new { wishlistCount = listing.WishlistCount });
});

app.Run();
