using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MyWatchMarketplace.CustomerOrders.Infrastructure.Persistence;

public class CustomerOrdersDbContextInitialiser
{
    private readonly ILogger<CustomerOrdersDbContextInitialiser> _logger;
    private readonly CustomerOrdersDbContext _context;

    public CustomerOrdersDbContextInitialiser(
        ILogger<CustomerOrdersDbContextInitialiser> logger,
        CustomerOrdersDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            if (_context.Database.IsNpgsql())
            {
                await _context.Database.MigrateAsync();
                await _context.Database.EnsureCreatedAsync();
            }

            await SeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the CustomerOrders database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        if (await _context.CustomerOrders.AnyAsync())
        {
            return;
        }

        var seedOrders = new List<MyWatchMarketplace.CustomerOrders.Domain.Entities.CustomerOrder>
        {
            new()
            {
                Id = "ord-omega-speedmaster",
                ListingId = "watch-omega-moonwatch",
                WatchModel = "Speedmaster Professional Moonwatch Sapphire",
                WatchBrand = "Omega",
                WatchReference = "310.30.42.50.01.002",
                WatchImage = "https://images.unsplash.com/photo-1547996160-71dfa63582d8?auto=format&fit=crop&w=1200&q=80",
                BuyerId = "user-current-buyer",
                BuyerName = "Julian Sterling",
                SellerId = "user-current-seller",
                SellerName = "Alexander Vance",
                Price = 6800m,
                ShippingFee = 150m,
                TotalAmount = 6950m,
                Status = "completed",
                ShippingAddress = "Bahnhofstrasse 45, 8001 Zurich, Switzerland",
                PaymentMethod = "Escrow via Stripe",
                PaymentStatus = "Funds Released",
                CreatedAt = DateTimeOffset.Parse("2026-07-28T10:00:00Z"),
                TrackingNumber = "FE-992019481US",
                HasReviewed = true
            },
            new()
            {
                Id = "ord-rolex-sub",
                ListingId = "watch-rolex-submariner",
                WatchModel = "Submariner Date \"Starbucks\"",
                WatchBrand = "Rolex",
                WatchReference = "126610LV",
                WatchImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
                BuyerId = "user-current-buyer",
                BuyerName = "Julian Sterling",
                SellerId = "seller-crown",
                SellerName = "Crown & Caliber Atelier",
                Price = 14200m,
                ShippingFee = 150m,
                TotalAmount = 14350m,
                Status = "shipped",
                ShippingAddress = "Bahnhofstrasse 45, 8001 Zurich, Switzerland",
                PaymentMethod = "Escrow via Stripe",
                PaymentStatus = "Held in Escrow",
                CreatedAt = DateTimeOffset.Parse("2026-08-30T16:45:00Z"),
                TrackingNumber = "DHL-481902819",
                HasReviewed = false
            }
        };

        _context.CustomerOrders.AddRange(seedOrders);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} orders into CustomerOrdersDb.", seedOrders.Count);
    }
}

