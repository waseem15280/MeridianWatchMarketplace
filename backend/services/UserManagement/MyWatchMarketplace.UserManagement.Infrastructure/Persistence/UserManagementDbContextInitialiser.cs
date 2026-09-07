using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyWatchMarketplace.UserManagement.Domain.Entities;
using MyWatchMarketplace.UserManagement.Domain.Enums;
using MyWatchMarketplace.UserManagement.Infrastructure.Security;

namespace MyWatchMarketplace.UserManagement.Infrastructure.Persistence;

public class UserManagementDbContextInitialiser
{
    private readonly ILogger<UserManagementDbContextInitialiser> _logger;
    private readonly UserManagementDbContext _context;

    public UserManagementDbContextInitialiser(
        ILogger<UserManagementDbContextInitialiser> logger,
        UserManagementDbContext context)
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
                await _context.Database.EnsureCreatedAsync();
            }

            await SeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the UserManagement database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        if (await _context.Logins.AnyAsync())
        {
            return;
        }

        var defaultPasswordHash = PasswordHasher.HashPassword("password123");
        var adminPasswordHash = PasswordHasher.HashPassword("admin123");

        var logins = new List<UserLogin>
        {
            // 1. Alexander Vance - Has 3 personas: Seller, Collector, Buyer
            new()
            {
                Id = "login-alexander",
                Username = "alexander",
                Email = "alexander.vance@horology.com",
                PasswordHash = defaultPasswordHash,
                IsActive = true,
                LastLoginAt = DateTimeOffset.UtcNow,
                Accounts = new List<UserAccount>
                {
                    new()
                    {
                        Id = "user-current-seller",
                        UserLoginId = "login-alexander",
                        Name = "Alexander Vance (Dealer Studio)",
                        Email = "alexander.vance@horology.com",
                        Role = UserRole.Seller,
                        Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                        Location = "New York, USA",
                        MemberSince = "2022",
                        VerifiedDealer = true,
                        Bio = "Lifelong collector and independent horologist based in Manhattan. Specializing in vintage chronographs and modern independent watchmaking.",
                        Rating = 4.92,
                        ReviewCount = 19,
                        TotalSalesCount = 37,
                        ResponseRate = "99%",
                        AvgShipTime = "Within 24 hours (FedEx Priority Overnight)",
                        Phone = "+1 212 555 0199",
                        IsDefault = true
                    },
                    new()
                    {
                        Id = "account-alexander-collector",
                        UserLoginId = "login-alexander",
                        Name = "Alexander Vance (Private Vault)",
                        Email = "alexander.vault@horology.com",
                        Role = UserRole.Collector,
                        Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                        Location = "New York, USA",
                        MemberSince = "2022",
                        VerifiedDealer = true,
                        Bio = "Private archival vault focusing on neo-vintage stainless steel chronographs.",
                        Rating = 5.0,
                        ReviewCount = 5,
                        TotalSalesCount = 0,
                        ResponseRate = "100%",
                        AvgShipTime = "N/A",
                        Phone = "+1 212 555 0199",
                        IsDefault = false
                    },
                    new()
                    {
                        Id = "account-alexander-buyer",
                        UserLoginId = "login-alexander",
                        Name = "Alexander Vance (Buyer)",
                        Email = "alexander.buyer@horology.com",
                        Role = UserRole.Buyer,
                        Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                        Location = "New York, USA",
                        MemberSince = "2022",
                        VerifiedDealer = false,
                        Bio = "Seeking unpolished complete-set pieces from vetted European collectors.",
                        Rating = 5.0,
                        ReviewCount = 8,
                        TotalSalesCount = 0,
                        ResponseRate = "100%",
                        AvgShipTime = "N/A",
                        Phone = "+1 212 555 0199",
                        IsDefault = false
                    }
                }
            },

            // 2. Julian Sterling - Has 2 personas: Buyer and Collector
            new()
            {
                Id = "login-julian",
                Username = "julian",
                Email = "j.sterling@collector.io",
                PasswordHash = defaultPasswordHash,
                IsActive = true,
                LastLoginAt = DateTimeOffset.UtcNow,
                Accounts = new List<UserAccount>
                {
                    new()
                    {
                        Id = "user-current-buyer",
                        UserLoginId = "login-julian",
                        Name = "Julian Sterling (Acquisition Account)",
                        Email = "j.sterling@collector.io",
                        Role = UserRole.Buyer,
                        Avatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
                        Location = "Zurich, Switzerland",
                        MemberSince = "2023",
                        VerifiedDealer = false,
                        Bio = "Passionate timepiece collector looking for grail watches, perpetual calendars, and limited edition chronographs.",
                        Rating = 5.0,
                        ReviewCount = 6,
                        TotalSalesCount = 2,
                        ResponseRate = "100%",
                        AvgShipTime = "N/A",
                        Phone = "+41 44 222 3344",
                        IsDefault = true
                    },
                    new()
                    {
                        Id = "account-julian-collector",
                        UserLoginId = "login-julian",
                        Name = "Julian Sterling (Vault)",
                        Email = "j.sterling.vault@collector.io",
                        Role = UserRole.Collector,
                        Avatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
                        Location = "Zurich, Switzerland",
                        MemberSince = "2023",
                        VerifiedDealer = false,
                        Bio = "Curator of Swiss high complications and grand tapisserie dials.",
                        Rating = 5.0,
                        ReviewCount = 2,
                        TotalSalesCount = 0,
                        ResponseRate = "100%",
                        AvgShipTime = "N/A",
                        Phone = "+41 44 222 3344",
                        IsDefault = false
                    }
                }
            },

            // 3. Admin Account
            new()
            {
                Id = "login-admin",
                Username = "admin",
                Email = "admin@meridianmarket.com",
                PasswordHash = adminPasswordHash,
                IsActive = true,
                LastLoginAt = DateTimeOffset.UtcNow,
                Accounts = new List<UserAccount>
                {
                    new()
                    {
                        Id = "account-admin-ops",
                        UserLoginId = "login-admin",
                        Name = "Meridian Platform Admin",
                        Email = "admin@meridianmarket.com",
                        Role = UserRole.Admin,
                        Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                        Location = "Meridian HQ, London",
                        MemberSince = "2020",
                        VerifiedDealer = true,
                        Bio = "Global compliance, escrow dispute resolution, and marketplace administration.",
                        Rating = 5.0,
                        ReviewCount = 0,
                        TotalSalesCount = 0,
                        ResponseRate = "100%",
                        AvgShipTime = "Instantaneous",
                        Phone = "+44 20 7000 0000",
                        IsDefault = true
                    }
                }
            },

            // 4. Geneva Horology Gallery
            new()
            {
                Id = "login-geneva",
                Username = "geneva_dealer",
                Email = "contact@genevahorology.ch",
                PasswordHash = defaultPasswordHash,
                IsActive = true,
                LastLoginAt = DateTimeOffset.UtcNow,
                Accounts = new List<UserAccount>
                {
                    new()
                    {
                        Id = "seller-geneva",
                        UserLoginId = "login-geneva",
                        Name = "Geneva Horology Gallery",
                        Email = "contact@genevahorology.ch",
                        Role = UserRole.Seller,
                        Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                        Location = "Geneva, Switzerland",
                        MemberSince = "2019",
                        VerifiedDealer = true,
                        Bio = "Established dealer specializing in rare neo-vintage and modern haute horlogerie.",
                        Rating = 4.95,
                        ReviewCount = 48,
                        TotalSalesCount = 182,
                        ResponseRate = "100%",
                        AvgShipTime = "Same day (Insured Ferrari Express)",
                        Phone = "+41 22 819 4000",
                        IsDefault = true
                    }
                }
            },

            // 5. Crown & Caliber Atelier
            new()
            {
                Id = "login-crown",
                Username = "crown_atelier",
                Email = "vault@crowncaliber.co.uk",
                PasswordHash = defaultPasswordHash,
                IsActive = true,
                LastLoginAt = DateTimeOffset.UtcNow,
                Accounts = new List<UserAccount>
                {
                    new()
                    {
                        Id = "seller-crown",
                        UserLoginId = "login-crown",
                        Name = "Crown & Caliber Atelier",
                        Email = "vault@crowncaliber.co.uk",
                        Role = UserRole.Seller,
                        Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
                        Location = "Mayfair, London, UK",
                        MemberSince = "2021",
                        VerifiedDealer = true,
                        Bio = "Curated boutique in Mayfair focusing on sports chronographs and iconic Swiss icons.",
                        Rating = 4.88,
                        ReviewCount = 32,
                        TotalSalesCount = 94,
                        ResponseRate = "98%",
                        AvgShipTime = "Within 24 hours",
                        Phone = "+44 20 7946 0912",
                        IsDefault = true
                    }
                }
            },

            // 6. Ginza Chrono Vault
            new()
            {
                Id = "login-tokyo",
                Username = "ginza_vault",
                Email = "tokyo@ginzachronovault.jp",
                PasswordHash = defaultPasswordHash,
                IsActive = true,
                LastLoginAt = DateTimeOffset.UtcNow,
                Accounts = new List<UserAccount>
                {
                    new()
                    {
                        Id = "seller-tokyo",
                        UserLoginId = "login-tokyo",
                        Name = "Ginza Chrono Vault",
                        Email = "tokyo@ginzachronovault.jp",
                        Role = UserRole.Seller,
                        Avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
                        Location = "Ginza, Tokyo, Japan",
                        MemberSince = "2020",
                        VerifiedDealer = true,
                        Bio = "Direct Japanese collector vault sourcing immaculate Grand Seiko and Patek Philippe.",
                        Rating = 4.98,
                        ReviewCount = 65,
                        TotalSalesCount = 240,
                        ResponseRate = "100%",
                        AvgShipTime = "Next day (DHL Global Express)",
                        Phone = "+81 3 5555 0143",
                        IsDefault = true
                    }
                }
            }
        };

        _context.Logins.AddRange(logins);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} user logins with multiple distinct role accounts into UserAccountDb.", logins.Count);
    }
}
