namespace MyWatchMarketplace.EmailService.Application.Features.ForgotPassword;

public interface IForgotPasswordHandler
{
    Task<ForgotPasswordResponse> HandleAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
}

