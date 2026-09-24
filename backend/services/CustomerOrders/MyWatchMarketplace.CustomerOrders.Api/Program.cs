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
        app.Logger.LogWarning(ex, "Could not initialise CustomerOrders database. Ensure PostgreSQL Docker is running.");
    }
}

app.UseHttpsRedirection();
var ordersApi = app.MapGroup("/api/customer-orders");

app.MapGet("/api/customer-orders/health", () => Results.Ok(new { status = "Healthy", service = "CustomerOrders" }))
   .WithName("CustomerOrdersHealth");

// 1. GET /api/customer-orders?buyerId={buyerId}&sellerId={sellerId}
ordersApi.MapGet("/", async (string? buyerId, string? sellerId, CustomerOrdersDbContext db) =>
{
    var query = db.CustomerOrders.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(buyerId))
    {
        query = query.Where(o => o.BuyerId == buyerId);
    }

    if (!string.IsNullOrWhiteSpace(sellerId))
    {
        query = query.Where(o => o.SellerId == sellerId);
    }

    var orders = await query.OrderByDescending(o => o.CreatedAt)
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

    return Results.Ok(orders);
});

// 2. GET /api/customer-orders/{id:int}
ordersApi.MapGet("/{id:int}", async (int id, CustomerOrdersDbContext db) =>
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
    var buyerId = request.BuyerId ?? "4";
    var buyerName = request.BuyerName ?? "Julian Sterling";
    var totalAmount = request.Price + request.ShippingFee;

    var order = new CustomerOrder
    {
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
        Status = "pending",
        ShippingAddress = request.ShippingAddress,
        PaymentMethod = request.PaymentMethod ?? "Escrow via Stripe",
        PaymentStatus = "Held in Escrow",
        CreatedAt = DateTimeOffset.UtcNow,
        HasReviewed = false
    };

    db.CustomerOrders.Add(order);
    await db.SaveChangesAsync();

    // Call Marketplace microservice to mark the watch as pending
    await marketplaceClient.UpdateListingStatusAsync(order.ListingId, "pending");

    return Results.Created($"/api/customer-orders/{order.Id}", order);
});

// 4. PATCH /api/customer-orders/{id:int}/status - Update status & escrow release (INTER-SERVICE: CustomerOrders -> Marketplace + SellerHub)
ordersApi.MapPatch("/{id:int}/status", async (
    int id,
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

    if (request.Status == "completed")
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
    var bId = buyerId ?? "1";
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
    var buyerId = request.BuyerId ?? "1";
    var buyerName = request.BuyerName ?? "Alexander Vance";

    var offer = new BuyerOffer
    {
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

    // Replicate offer to SellerHub microservice
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

// 7. PATCH /api/customer-orders/offers/{offerId:int}/respond - Respond to counter offer
ordersApi.MapPatch("/offers/{offerId:int}/respond", async (
    int offerId,
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
