using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.CustomerOrders.Application.Common.Interfaces;
using MyWatchMarketplace.CustomerOrders.Infrastructure.Persistence;

namespace MyWatchMarketplace.CustomerOrders.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCustomerOrdersInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CustomerOrdersDbConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=CustomerOrdersDb;Username=postgres;Password=Pa55w.rd";

        services.AddDbContext<CustomerOrdersDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(CustomerOrdersDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<ICustomerOrdersDbContext>(provider =>
            provider.GetRequiredService<CustomerOrdersDbContext>());

        services.AddScoped<CustomerOrdersDbContextInitialiser>();

        // Register inter-service clients
        services.AddHttpClient<MyWatchMarketplace.Contracts.Clients.IMarketplaceClient, MyWatchMarketplace.Contracts.Clients.MarketplaceClient>(client =>
        {
            var url = configuration["Services:MarketplaceUrl"] ?? "http://localhost:5101";
            client.BaseAddress = new Uri(url);
        });

        services.AddHttpClient<MyWatchMarketplace.Contracts.Clients.ISellerHubClient, MyWatchMarketplace.Contracts.Clients.SellerHubClient>(client =>
        {
            var url = configuration["Services:SellerHubUrl"] ?? "http://localhost:5104";
            client.BaseAddress = new Uri(url);
        });

        return services;
    }
}

