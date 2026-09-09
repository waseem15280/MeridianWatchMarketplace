using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace MyWatchMarketplace.CollectorVault.Infrastructure.Persistence;

public class CollectorVaultDbContextInitialiser
{
    private readonly ILogger<CollectorVaultDbContextInitialiser> _logger;
    private readonly CollectorVaultDbContext _context;

    public CollectorVaultDbContextInitialiser(
        ILogger<CollectorVaultDbContextInitialiser> logger,
        CollectorVaultDbContext context)
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
            _logger.LogError(ex, "An error occurred while initialising the CollectorVault database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        if (await _context.VaultWatches.AnyAsync())
        {
            return;
        }

        var seedWatches = new List<MyWatchMarketplace.CollectorVault.Domain.Entities.VaultWatch>
        {
            new()
            {
                Id = "vault-omega-speedmaster",
                UserId = "user-current-seller",
                Brand = "Omega",
                Model = "Speedmaster Professional \"Pre-Moon\"",
                ReferenceNumber = "145.022-69ST",
                Year = 1969,
                SerialNumber = "27329182",
                CaseDiameter = 42,
                CaseMaterial = "Stainless Steel",
                Movement = "Manual Winding",
                DialColor = "Step Dial Matte Black",
                Condition = "Very Good",
                PurchasePrice = 7500m,
                PurchaseDate = "2021-04-12",
                EstimatedMarketValue = 12500m,
                Images = new()
                {
                    "https://images.unsplash.com/photo-1547996160-71dfa63582d8?auto=format&fit=crop&w=1200&q=80"
                },
                Notes = "Acquired at Phillips Geneva Auction. Calibre 861 transitional stepped dial with painted logo and DO90 bezel.",
                IsListedForSale = false,
                CreatedAt = DateTimeOffset.Parse("2026-08-01T12:00:00Z")
            },
            new()
            {
                Id = "vault-cartier-santos",
                UserId = "user-current-seller",
                Brand = "Cartier",
                Model = "Santos de Cartier Medium",
                ReferenceNumber = "WSSA0029",
                Year = 2022,
                SerialNumber = "40728912LX",
                CaseDiameter = 35.1,
                CaseMaterial = "Stainless Steel",
                Movement = "Automatic",
                DialColor = "Silvered Opaline",
                Condition = "Mint",
                PurchasePrice = 6800m,
                PurchaseDate = "2022-09-18",
                EstimatedMarketValue = 7200m,
                Images = new()
                {
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
                },
                Notes = "Daily dress icon with QuickSwitch bracelet mechanism and SmartLink adjustment system. Complete set.",
                IsListedForSale = false,
                CreatedAt = DateTimeOffset.Parse("2026-08-05T08:00:00Z")
            },
            new()
            {
                Id = "vault-tudor-blackbay",
                UserId = "user-current-seller",
                Brand = "Tudor",
                Model = "Black Bay 58 \"Navy Blue\"",
                ReferenceNumber = "M79030B-0001",
                Year = 2021,
                SerialNumber = "Q891204",
                CaseDiameter = 39,
                CaseMaterial = "Stainless Steel",
                Movement = "Automatic",
                DialColor = "Matte Navy Blue",
                Condition = "Very Good",
                PurchasePrice = 3700m,
                PurchaseDate = "2021-11-04",
                EstimatedMarketValue = 3400m,
                Images = new()
                {
                    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=80"
                },
                Notes = "Manufacture Calibre MT5402. Great wrist presence with comfortable 39mm proportions.",
                IsListedForSale = false,
                CreatedAt = DateTimeOffset.Parse("2026-08-10T14:20:00Z")
            }
        };

        _context.VaultWatches.AddRange(seedWatches);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} vault watches into CollectorVaultDb.", seedWatches.Count);
    }
}

