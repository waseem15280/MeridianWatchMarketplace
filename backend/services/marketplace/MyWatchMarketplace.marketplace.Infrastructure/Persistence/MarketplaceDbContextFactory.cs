using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MyWatchMarketplace.marketplace.Infrastructure.Persistence;

public class MarketplaceDbContextFactory : IDesignTimeDbContextFactory<MarketplaceDbContext>
{
    private const string DefaultConnectionString =
        "Host=localhost;Port=5432;Database=MarketplaceDb;Username=postgres;Password=Pa55w.rd";

    public MarketplaceDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__MarketplaceDbConnection")
            ?? DefaultConnectionString;

        var optionsBuilder = new DbContextOptionsBuilder<MarketplaceDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MigrationsAssembly(typeof(MarketplaceDbContext).Assembly.FullName);
        });

        return new MarketplaceDbContext(optionsBuilder.Options);
    }
}

