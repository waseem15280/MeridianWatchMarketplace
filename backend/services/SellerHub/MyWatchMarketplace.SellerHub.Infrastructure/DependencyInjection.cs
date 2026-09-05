using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.SellerHub.Application.Common.Interfaces;
using MyWatchMarketplace.SellerHub.Infrastructure.Persistence;

namespace MyWatchMarketplace.SellerHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSellerHubInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SellerHubDbConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=SellerHubDb;Username=postgres;Password=Pa55w.rd";

        services.AddDbContext<SellerHubDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(SellerHubDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<ISellerHubDbContext>(provider =>
            provider.GetRequiredService<SellerHubDbContext>());

        services.AddScoped<SellerHubDbContextInitialiser>();

        return services;
    }
}

