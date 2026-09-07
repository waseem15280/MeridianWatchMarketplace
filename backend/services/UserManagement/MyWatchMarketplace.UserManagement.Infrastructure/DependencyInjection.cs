using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.UserManagement.Application.Common.Interfaces;
using MyWatchMarketplace.UserManagement.Infrastructure.Persistence;

namespace MyWatchMarketplace.UserManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddUserManagementInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("UserAccountDbConnection")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=UserAccountDb;Username=postgres;Password=Pa55w.rd";

        services.AddDbContext<UserManagementDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(UserManagementDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<IUserManagementDbContext>(provider =>
            provider.GetRequiredService<UserManagementDbContext>());

        services.AddScoped<UserManagementDbContextInitialiser>();

        return services;
    }
}
