using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.Contracts.Clients;
using MyWatchMarketplace.Contracts.DTOs;
using MyWatchMarketplace.CustomerOrders.Application.DTOs;
using MyWatchMarketplace.CustomerOrders.Domain.Entities;
using MyWatchMarketplace.CustomerOrders.Infrastructure;
using MyWatchMarketplace.CustomerOrders.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCustomerOrdersInfrastructureServices(builder.Configuration);

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
    var initialiser = scope.ServiceProvider.GetRequiredService<CustomerOrdersDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialise CustomerOrdersDb on startup. Ensure PostgreSQL is running.");
        app.Logger.LogWarning(ex, "Could not initialise CustomerOrders database. Ensure PostgreSQL Docker is running.");
    }
}

app.UseHttpsRedirection();
var ordersApi = app.MapGroup("/api/customer-orders");

app.MapGet("/api/customer-orders/health", () => Results.Ok(new { status = "Healthy", service = "CustomerOrders" }))
   .WithName("CustomerOrdersHealth");
// 1. GET /api/customer-orders?userId={userId}&role={buyer|seller}
ordersApi.MapGet("/", async (string? userId, string? role, CustomerOrdersDbContext db) =>
{
    var uId = userId ?? "user-current-seller";
    var query = db.CustomerOrders.AsNoTracking().AsQueryable();

    if (role == "seller")
    {
        query = query.Where(o => o.SellerId == uId);
    }
    else if (role == "buyer")
    {
        query = query.Where(o => o.BuyerId == uId);
    }
    else
    {
        query = query.Where(o => o.BuyerId == uId || o.SellerId == uId);
    }

    var list = await query.OrderByDescending(o => o.CreatedAt)
        .Select(o => new CustomerOrderDto(
            o.Id,
            o.ListingId,
            o.WatchModel,
            o.WatchBrand,
            o.WatchReference,
            o.WatchImage,
            o.BuyerId,
            o.BuyerName,
            o.SellerId,
            o.SellerName,
            o.Price,
            o.ShippingFee,
            o.TotalAmount,
            o.Status,
            o.ShippingAddress,
            o.PaymentMethod,
            o.PaymentStatus,
            o.CreatedAt,
            o.TrackingNumber,
            o.HasReviewed
        )).ToListAsync();

    return Results.Ok(list);
});

// 2. GET /api/customer-orders/{id}
ordersApi.MapGet("/{id}", async (string id, CustomerOrdersDbContext db) =>
{
    var o = await db.CustomerOrders.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
    if (o is null) return Results.NotFound(new { message = $"Order {id} not found." });

    return Results.Ok(new CustomerOrderDto(
        o.Id,
        o.ListingId,
        o.WatchModel,
        o.WatchBrand,
        o.WatchReference,
        o.WatchImage,
        o.BuyerId,
        o.BuyerName,
        o.SellerId,
        o.SellerName,
        o.Price,
        o.ShippingFee,
        o.TotalAmount,
        o.Status,
        o.ShippingAddress,
        o.PaymentMethod,
        o.PaymentStatus,
        o.CreatedAt,
        o.TrackingNumber,
        o.HasReviewed
    ));
});

// 3. POST /api/customer-orders - Checkout & place order (INTER-SERVICE: CustomerOrders -> Marketplace)
ordersApi.MapPost("/", async (
    CreateCustomerOrderRequest request,
    CustomerOrdersDbContext db,
    IMarketplaceClient marketplaceClient) =>
{
    var buyerId = request.BuyerId ?? "user-current-buyer";
    var buyerName = request.BuyerName ?? "Julian Sterling";
    var totalAmount = request.Price + request.ShippingFee;

    var order = new CustomerOrder
    {
        Id = "ord-" + Guid.NewGuid().ToString("N")[..8],
        ListingId = request.ListingId,
        WatchModel = request.WatchModel,
        WatchBrand = request.WatchBrand,
        WatchReference = request.WatchReference,
        WatchImage = request.WatchImage,
        BuyerId = buyerId,
        BuyerName = buyerName,
        SellerId = request.SellerId,
        SellerName = request.SellerName,
        Price = request.Price,
        ShippingFee = request.ShippingFee,
        TotalAmount = totalAmount,
        ShippingAddress = request.ShippingAddress,
        PaymentMethod = request.PaymentMethod ?? "Escrow via Stripe",
        PaymentStatus = "Held in Escrow",
        Status = "pending",
        CreatedAt = DateTimeOffset.UtcNow,
        HasReviewed = false
    };

    db.CustomerOrders.Add(order);
    await db.SaveChangesAsync();

    // Notify Marketplace that watch is reserved
    await marketplaceClient.UpdateListingStatusAsync(request.ListingId, "reserved");

    return Results.Created($"/api/customer-orders/{order.Id}", order);
});

// 4. PATCH /api/customer-orders/{id}/status - Update status & escrow release (INTER-SERVICE: CustomerOrders -> Marketplace + SellerHub)
ordersApi.MapPatch("/{id}/status", async (
    string id,
    UpdateOrderStatusRequest request,
    CustomerOrdersDbContext db,
    IMarketplaceClient marketplaceClient,
    ISellerHubClient sellerHubClient) =>
{
    var order = await db.CustomerOrders.FirstOrDefaultAsync(o => o.Id == id);
    if (order is null) return Results.NotFound();

    order.Status = request.Status;
    if (!string.IsNullOrWhiteSpace(request.TrackingNumber))
    {
        order.TrackingNumber = request.TrackingNumber;
    }

    if (request.Status == "completed" || request.Status == "delivered")
    {
        order.PaymentStatus = "Funds Released";
        // Notify Marketplace watch is sold
        await marketplaceClient.UpdateListingStatusAsync(order.ListingId, "sold");
        // Notify SellerHub to increment sales count
        await sellerHubClient.IncrementSalesCountAsync(order.SellerId, order.TotalAmount);
    }
    else if (request.Status == "shipped")
    {
        order.PaymentStatus = "Held in Escrow";
    }

    await db.SaveChangesAsync();
    return Results.Ok(order);
});

// 5. GET /api/customer-orders/offers?buyerId={buyerId}
ordersApi.MapGet("/offers", async (string? buyerId, CustomerOrdersDbContext db) =>
{
    var bId = buyerId ?? "user-current-seller";
    var offers = await db.BuyerOffers.AsNoTracking()
        .Where(o => o.BuyerId == bId)
        .OrderByDescending(o => o.CreatedAt)
        .Select(o => new BuyerOfferDto(
            o.Id,
            o.ListingId,
            o.BuyerId,
            o.BuyerName,
            o.SellerId,
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

// 6. POST /api/customer-orders/offers - Buyer submits offer (INTER-SERVICE: CustomerOrders -> SellerHub)
ordersApi.MapPost("/offers", async (
    CreateBuyerOfferRequest request,
    CustomerOrdersDbContext db,
    ISellerHubClient sellerHubClient) =>
{
    var buyerId = request.BuyerId ?? "user-current-seller";
    var buyerName = request.BuyerName ?? "Alexander Vance";

    var offer = new BuyerOffer
    {
        Id = "off-" + Guid.NewGuid().ToString("N")[..8],
        ListingId = request.ListingId,
        BuyerId = buyerId,
        BuyerName = buyerName,
        SellerId = request.SellerId,
        WatchModel = request.WatchModel,
        WatchBrand = request.WatchBrand,
        WatchImage = request.WatchImage,
        OfferAmount = request.OfferAmount,
        OriginalListingPrice = request.OriginalListingPrice,
        Message = request.Message,
        Status = "pending",
        CreatedAt = DateTimeOffset.UtcNow
    };

    db.BuyerOffers.Add(offer);
    await db.SaveChangesAsync();

    // Sync offer to SellerHub inbox
    await sellerHubClient.SyncOfferToSellerAsync(new SyncOfferToSellerRequest(
        offer.Id,
        offer.ListingId,
        offer.BuyerId,
        offer.BuyerName,
        offer.SellerId,
        offer.OfferAmount,
        offer.OriginalListingPrice,
        offer.Message,
        offer.Status,
        offer.WatchModel,
        offer.WatchBrand,
        offer.WatchImage
    ));

    return Results.Created($"/api/customer-orders/offers/{offer.Id}", offer);
});

// 7. PATCH /api/customer-orders/offers/{offerId}/respond - Respond to counter offer
ordersApi.MapPatch("/offers/{offerId}/respond", async (
    string offerId,
    RespondBuyerOfferRequest request,
    CustomerOrdersDbContext db,
    ISellerHubClient sellerHubClient) =>
{
    var offer = await db.BuyerOffers.FirstOrDefaultAsync(o => o.Id == offerId);
    if (offer is null) return Results.NotFound();

    offer.Status = request.Status;
    if (request.CounterAmount.HasValue) offer.CounterAmount = request.CounterAmount.Value;

    await db.SaveChangesAsync();

    // Mirror status to SellerHub
    await sellerHubClient.UpdateOfferStatusAsync(offer.Id, request.Status, request.CounterAmount);

    return Results.Ok(offer);
});

app.Run();

