using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.EmailService.Application.Common.Interfaces;
using MyWatchMarketplace.EmailService.Application.Common.Models;
using MyWatchMarketplace.EmailService.Infrastructure.Email;
using MyWatchMarketplace.EmailService.Infrastructure.Security;
using MyWatchMarketplace.EmailService.Infrastructure.Templates;
using MyWatchMarketplace.UserManagement.Infrastructure;

namespace MyWatchMarketplace.EmailService.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddEmailInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Bind EmailSettings from configuration
        services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));

        // Shared UserManagement DbContext (no new database!)
        services.AddUserManagementInfrastructureServices(configuration);

        // Email & Security services
        services.AddSingleton<InMemoryEmailStore>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<IEmailTemplateService, HtmlEmailTemplateService>();
        services.AddScoped<IPasswordResetTokenService, PasswordResetTokenService>();
        services.AddScoped<IPasswordHashProvider, PasswordHashProvider>();

        return services;
    }
}

