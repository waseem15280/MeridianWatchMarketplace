using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MyWatchMarketplace.SellerHub.Infrastructure.Persistence;

public class SellerHubDbContextInitialiser
{
    private readonly ILogger<SellerHubDbContextInitialiser> _logger;
    private readonly SellerHubDbContext _context;

    public SellerHubDbContextInitialiser(
        ILogger<SellerHubDbContextInitialiser> logger,
        SellerHubDbContext context)
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
            _logger.LogError(ex, "An error occurred while initialising the SellerHub database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        if (await _context.SellerProfiles.AnyAsync())
        {
            return;
        }

        var seedProfiles = new List<MyWatchMarketplace.SellerHub.Domain.Entities.SellerProfile>
        {
            new()
            {
                Id = "seller-geneva",
                Name = "Geneva Horology Gallery",
                Email = "contact@genevahorology.ch",
                Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                Location = "Geneva, Switzerland",
                MemberSince = "2019",
                VerifiedDealer = true,
                Bio = "Established dealer specializing in rare neo-vintage and modern haute horlogerie. All timepieces verified by in-house certified watchmakers in Geneva.",
                Rating = 4.95,
                ReviewCount = 48,
                TotalSalesCount = 182,
                ResponseRate = "100%",
                AvgShipTime = "Same day (Insured Ferrari Express)",
                Phone = "+41 22 819 4000"
            },
            new()
            {
                Id = "seller-crown",
                Name = "Crown & Caliber Atelier",
                Email = "vault@crowncaliber.co.uk",
                Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
                Location = "Mayfair, London, UK",
                MemberSince = "2021",
                VerifiedDealer = true,
                Bio = "Curated boutique in Mayfair focusing on sports chronographs and iconic Swiss icons with complete provenance and full box/papers.",
                Rating = 4.88,
                ReviewCount = 32,
                TotalSalesCount = 94,
                ResponseRate = "98%",
                AvgShipTime = "Within 24 hours",
                Phone = "+44 20 7946 0912"
            },
            new()
            {
                Id = "seller-tokyo",
                Name = "Ginza Chrono Vault",
                Email = "tokyo@ginzachronovault.jp",
                Avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
                Location = "Ginza, Tokyo, Japan",
                MemberSince = "2020",
                VerifiedDealer = true,
                Bio = "Direct Japanese collector vault sourcing immaculate Grand Seiko, Patek Philippe, and pristine Rolex pieces preserved in climate-controlled safes.",
                Rating = 4.98,
                ReviewCount = 65,
                TotalSalesCount = 240,
                ResponseRate = "100%",
                AvgShipTime = "Next day (DHL Global Express)",
                Phone = "+81 3 5555 0143"
            },
            new()
            {
                Id = "user-current-seller",
                Name = "Alexander Vance",
                Email = "alexander.vance@horology.com",
                Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                Location = "New York, USA",
                MemberSince = "2022",
                VerifiedDealer = true,
                Bio = "Lifelong collector and independent horologist based in Manhattan. Passionate about vintage chronographs and modern independent watchmaking.",
                Rating = 4.92,
                ReviewCount = 19,
                TotalSalesCount = 37,
                ResponseRate = "99%",
                AvgShipTime = "Within 24 hours (FedEx Priority Overnight)",
                Phone = "+1 212 555 0199"
            },
            new()
            {
                Id = "user-current-buyer",
                Name = "Julian Sterling",
                Email = "j.sterling@collector.io",
                Avatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
                Location = "Zurich, Switzerland",
                MemberSince = "2023",
                VerifiedDealer = false,
                Bio = "Passionate timepiece collector looking for grail watches, perpetual calendars, and limited edition chronographs.",
                Rating = 5.0,
                ReviewCount = 6,
                TotalSalesCount = 2,
                ResponseRate = "100%",
                AvgShipTime = "N/A"
            }
        };

        var seedReviews = new List<MyWatchMarketplace.SellerHub.Domain.Entities.SellerReview>
        {
            new()
            {
                Id = "rev-1",
                SellerId = "seller-geneva",
                BuyerId = "user-current-buyer",
                BuyerName = "Julian Sterling",
                BuyerAvatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
                Rating = 5,
                SubRatings = new MyWatchMarketplace.SellerHub.Domain.Common.ReviewSubRatings
                {
                    Accuracy = 5,
                    Communication = 5,
                    Shipping = 5,
                    Authenticity = 5
                },
                Comment = "Flawless transaction! Daytona arrived packaged like a museum artifact. Watchmaker certification paperwork matched Bucherer AD records perfectly.",
                WatchModel = "Rolex Cosmograph Daytona Panda",
                WatchReference = "116500LN",
                Date = "August 2026",
                VerifiedPurchase = true,
                SellerReply = "Thank you Julian! Wear this iconic piece in good health."
            },
            new()
            {
                Id = "rev-2",
                SellerId = "user-current-seller",
                BuyerId = "user-current-buyer",
                BuyerName = "Julian Sterling",
                BuyerAvatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
                Rating = 5,
                SubRatings = new MyWatchMarketplace.SellerHub.Domain.Common.ReviewSubRatings
                {
                    Accuracy = 5,
                    Communication = 5,
                    Shipping = 5,
                    Authenticity = 5
                },
                Comment = "Alexander is a true gentleman and horological scholar. Clear communication throughout escrow release and pristine packaging.",
                WatchModel = "Omega Speedmaster Professional",
                WatchReference = "310.30.42.50.01.002",
                Date = "July 2026",
                VerifiedPurchase = true,
                SellerReply = "Appreciate your business Julian! Enjoy the Moonwatch."
            }
        };

        _context.SellerProfiles.AddRange(seedProfiles);
        _context.SellerReviews.AddRange(seedReviews);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {ProfileCount} seller profiles and {ReviewCount} reviews into SellerHubDb.", seedProfiles.Count, seedReviews.Count);
    }
}

