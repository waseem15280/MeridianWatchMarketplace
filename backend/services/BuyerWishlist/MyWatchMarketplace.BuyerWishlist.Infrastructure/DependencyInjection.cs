using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.BuyerWishlist.Application.Common.Interfaces;
using MyWatchMarketplace.BuyerWishlist.Infrastructure.Persistence;

namespace MyWatchMarketplace.BuyerWishlist.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddBuyerWishlistInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("BuyerWishlistDbConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=BuyerWishlistDb;Username=postgres;Password=Pa55w.rd";

        services.AddDbContext<BuyerWishlistDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(BuyerWishlistDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<IBuyerWishlistDbContext>(provider =>
            provider.GetRequiredService<BuyerWishlistDbContext>());

        services.AddScoped<BuyerWishlistDbContextInitialiser>();

        // Register inter-service MarketplaceClient
        services.AddHttpClient<MyWatchMarketplace.Contracts.Clients.IMarketplaceClient, MyWatchMarketplace.Contracts.Clients.MarketplaceClient>(client =>
        {
            var url = configuration["Services:MarketplaceUrl"] ?? "http://localhost:5101";
            client.BaseAddress = new Uri(url);
        });

        return services;
    }
}

