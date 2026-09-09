using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace MyWatchMarketplace.marketplace.Infrastructure.Persistence;

public class MarketplaceDbContextInitialiser
{
    private readonly ILogger<MarketplaceDbContextInitialiser> _logger;
    private readonly MarketplaceDbContext _context;

    public MarketplaceDbContextInitialiser(
        ILogger<MarketplaceDbContextInitialiser> logger,
        MarketplaceDbContext context)
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
            _logger.LogError(ex, "An error occurred while initialising the Marketplace database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        if (await _context.WatchListings.AnyAsync())
        {
            return;
        }

        var seedListings = new List<MyWatchMarketplace.marketplace.Domain.Entities.WatchListing>
        {
            new()
            {
                Id = "watch-rolex-daytona",
                SellerId = "seller-geneva",
                SellerName = "Geneva Horology Gallery",
                SellerRating = 4.95,
                SellerReviewCount = 48,
                SellerVerified = true,
                SellerLocation = "Geneva, Switzerland",
                Brand = "Rolex",
                Model = "Cosmograph Daytona \"Panda\"",
                ReferenceNumber = "116500LN",
                Year = 2023,
                Price = 31500m,
                OriginalPrice = 34000m,
                Currency = "USD",
                Condition = "Mint",
                Movement = "Automatic",
                CaseMaterial = "Oystersteel",
                CaseDiameter = 40,
                DialColor = "White Lacquer (Panda)",
                BraceletMaterial = "Oystersteel with Oysterlock Safety Clasp",
                WaterResistance = "100 meters / 330 feet",
                Caliber = "Rolex Calibre 4130 Superlative Chronometer",
                PowerReserve = "72 Hours",
                HasOriginalBox = true,
                HasOriginalPapers = true,
                HasServicePapers = true,
                WarrantyUntil = "2028",
                Images = new()
                {
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1547996160-71dfa63582d8?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
                },
                Description = "Iconic Rolex Daytona reference 116500LN with striking white dial and black Cerachrom bezel. Full set including green presentation box, warranty card dated November 2023, manuals, and both hangtags. Unpolished, razor-sharp bevels.",
                ProvenanceNotes = "Purchased directly from Bucherer Geneva AD. One private owner since new.",
                AuthenticityVerified = true,
                Status = "active",
                CreatedAt = DateTimeOffset.Parse("2026-08-20T10:00:00Z"),
                ViewsCount = 1420,
                WishlistCount = 114,
                IsFeatured = true
            },
            new()
            {
                Id = "watch-patek-nautilus",
                SellerId = "seller-tokyo",
                SellerName = "Ginza Chrono Vault",
                SellerRating = 4.98,
                SellerReviewCount = 65,
                SellerVerified = true,
                SellerLocation = "Ginza, Tokyo, Japan",
                Brand = "Patek Philippe",
                Model = "Nautilus Blue Dial",
                ReferenceNumber = "5711/1A-010",
                Year = 2021,
                Price = 118000m,
                Currency = "USD",
                Condition = "Mint",
                Movement = "Automatic",
                CaseMaterial = "Stainless Steel",
                CaseDiameter = 40,
                DialColor = "Horizontally Embossed Blue",
                BraceletMaterial = "Stainless Steel Integrated Bracelet",
                WaterResistance = "120 meters",
                Caliber = "Patek Philippe Calibre 26-330 S C",
                PowerReserve = "45 Hours",
                HasOriginalBox = true,
                HasOriginalPapers = true,
                HasServicePapers = false,
                WarrantyUntil = "Expired (Original Certificate 2021)",
                Images = new()
                {
                    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80"
                },
                Description = "The Holy Grail of luxury steel sports timepieces. Reference 5711/1A-010 in stainless steel with signature blue gradated horizontally embossed dial. Complete with piano-lacquer wooden box, leather folio, Certificate of Origin, and instruction booklets.",
                ProvenanceNotes = "Acquired from a private collector in Minato-ku, Tokyo. Kept in a vault since initial purchase.",
                AuthenticityVerified = true,
                Status = "active",
                CreatedAt = DateTimeOffset.Parse("2026-08-25T14:30:00Z"),
                ViewsCount = 3890,
                WishlistCount = 286,
                IsFeatured = true
            },
            new()
            {
                Id = "watch-ap-royaloak",
                SellerId = "seller-crown",
                SellerName = "Crown & Caliber Atelier",
                SellerRating = 4.88,
                SellerReviewCount = 32,
                SellerVerified = true,
                SellerLocation = "Mayfair, London, UK",
                Brand = "Audemars Piguet",
                Model = "Royal Oak \"Jumbo\" Extra-Thin",
                ReferenceNumber = "16202ST.OO.1240ST.01",
                Year = 2022,
                Price = 72000m,
                Currency = "USD",
                Condition = "Mint",
                Movement = "Automatic",
                CaseMaterial = "Stainless Steel",
                CaseDiameter = 39,
                DialColor = "Bleu Nuit, Nuage 50 (Petite Tapisserie)",
                BraceletMaterial = "Stainless Steel Integrated Bracelet with AP Folding Clasp",
                WaterResistance = "50 meters",
                Caliber = "AP Calibre 7121",
                PowerReserve = "55 Hours",
                HasOriginalBox = true,
                HasOriginalPapers = true,
                HasServicePapers = true,
                WarrantyUntil = "2027",
                Images = new()
                {
                    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80"
                },
                Description = "50th Anniversary edition 'Jumbo' Extra-Thin reference 16202ST featuring the commemorative '50-years' oscillating weight visible through the sapphire caseback. Fitted with the classic Petite Tapisserie dial.",
                ProvenanceNotes = "Delivered new by AP House London in July 2022. Single collector provenance.",
                AuthenticityVerified = true,
                Status = "active",
                CreatedAt = DateTimeOffset.Parse("2026-08-28T09:15:00Z"),
                ViewsCount = 2110,
                WishlistCount = 145,
                IsFeatured = true
            }
        };

        _context.WatchListings.AddRange(seedListings);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} initial watch listings into MarketplaceDb.", seedListings.Count);
    }
}

