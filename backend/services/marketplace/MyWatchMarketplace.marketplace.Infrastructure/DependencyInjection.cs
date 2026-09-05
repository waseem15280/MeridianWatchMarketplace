using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.marketplace.Application.Common.Interfaces;
using MyWatchMarketplace.marketplace.Infrastructure.Persistence;

namespace MyWatchMarketplace.marketplace.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MarketplaceDbConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=MarketplaceDb;Username=postgres;Password=Pa55w.rd";

        services.AddDbContext<MarketplaceDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(MarketplaceDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<IMarketplaceDbContext>(provider =>
            provider.GetRequiredService<MarketplaceDbContext>());

        services.AddScoped<MarketplaceDbContextInitialiser>();

        return services;
    }
}

