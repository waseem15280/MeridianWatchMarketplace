using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;

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
                var pending = await _context.Database.GetPendingMigrationsAsync();
                if (pending != null && pending.Any())
                {
                    await _context.Database.MigrateAsync();
                }
                else
                {
                    await _context.Database.EnsureCreatedAsync();
                }
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
                Id = 1,
                BuyerId = "1",
                ListingId = 1,
                WatchBrand = "Rolex",
                WatchModel = "Cosmograph Daytona \"Panda\"",
                PriceWhenAdded = 31500m,
                Priority = MyWatchMarketplace.BuyerWishlist.Domain.Enums.PriorityLevel.High,
                Notes = "Grail sports chronograph. Track for price movement.",
                AddedAt = DateTimeOffset.UtcNow.AddDays(-10)
            },
            new()
            {
                Id = 2,
                BuyerId = "1",
                ListingId = 2,
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

        if (_context.Database.IsNpgsql())
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync("SELECT setval(pg_get_serial_sequence('\"WishlistItems\"', 'Id'), (SELECT COALESCE(MAX(\"Id\"), 1) FROM \"WishlistItems\"));");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not reset Postgres sequences for BuyerWishlist.");
            }
        }

        _logger.LogInformation("Seeded {Count} wishlist items into BuyerWishlistDb.", seedItems.Count);
    }
}
