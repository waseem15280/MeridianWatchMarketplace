using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MyWatchMarketplace.BuyerWishlist.Infrastructure.Persistence;

public class BuyerWishlistDbContextInitialiser
{
    private readonly ILogger<BuyerWishlistDbContextInitialiser> _logger;
    private readonly BuyerWishlistDbContext _context;

    public BuyerWishlistDbContextInitialiser(
        ILogger<BuyerWishlistDbContextInitialiser> logger,
        BuyerWishlistDbContext context)
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
            _logger.LogError(ex, "An error occurred while initialising the BuyerWishlist database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        if (await _context.WishlistItems.AnyAsync())
        {
            return;
        }

        var seedItems = new List<MyWatchMarketplace.BuyerWishlist.Domain.Entities.WishlistItem>
        {
            new()
            {
                BuyerId = "user-current-seller",
                ListingId = "watch-rolex-daytona",
                WatchBrand = "Rolex",
                WatchModel = "Cosmograph Daytona \"Panda\"",
                PriceWhenAdded = 31500m,
                Priority = MyWatchMarketplace.BuyerWishlist.Domain.Enums.PriorityLevel.High,
                Notes = "Grail sports chronograph. Track for price movement.",
                AddedAt = DateTimeOffset.UtcNow.AddDays(-10)
            },
            new()
            {
                BuyerId = "user-current-seller",
                ListingId = "watch-patek-nautilus",
                WatchBrand = "Patek Philippe",
                WatchModel = "Nautilus Blue Dial",
                PriceWhenAdded = 118000m,
                Priority = MyWatchMarketplace.BuyerWishlist.Domain.Enums.PriorityLevel.High,
                Notes = "Mint full set from Ginza vault.",
                AddedAt = DateTimeOffset.UtcNow.AddDays(-5)
            }
        };

        _context.WishlistItems.AddRange(seedItems);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} wishlist items into BuyerWishlistDb.", seedItems.Count);
    }
}

