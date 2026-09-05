using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.CollectorVault.Application.Common.Interfaces;
using MyWatchMarketplace.CollectorVault.Infrastructure.Persistence;

namespace MyWatchMarketplace.CollectorVault.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCollectorVaultInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CollectorVaultDbConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=CollectorVaultDb;Username=postgres;Password=Pa55w.rd";

        services.AddDbContext<CollectorVaultDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(CollectorVaultDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<ICollectorVaultDbContext>(provider =>
            provider.GetRequiredService<CollectorVaultDbContext>());

        services.AddScoped<CollectorVaultDbContextInitialiser>();

        // Register inter-service MarketplaceClient
        services.AddHttpClient<MyWatchMarketplace.Contracts.Clients.IMarketplaceClient, MyWatchMarketplace.Contracts.Clients.MarketplaceClient>(client =>
        {
            var url = configuration["Services:MarketplaceUrl"] ?? "http://localhost:5101";
            client.BaseAddress = new Uri(url);
        });

        return services;
    }
}

