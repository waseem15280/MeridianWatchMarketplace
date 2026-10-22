using Microsoft.Extensions.DependencyInjection;
using MyWatchMarketplace.EmailService.Application.Features.ForgotPassword;
using MyWatchMarketplace.EmailService.Application.Features.ResetPassword;
using MyWatchMarketplace.EmailService.Application.Features.SendEmail;
using MyWatchMarketplace.EmailService.Application.Features.VerifyResetToken;

namespace MyWatchMarketplace.EmailService.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddEmailApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IForgotPasswordHandler, ForgotPasswordHandler>();
        services.AddScoped<IVerifyResetTokenHandler, VerifyResetTokenHandler>();
        services.AddScoped<IResetPasswordHandler, ResetPasswordHandler>();
        services.AddScoped<ISendEmailHandler, SendEmailHandler>();

        return services;
    }
}

