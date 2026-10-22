namespace MyWatchMarketplace.EmailService.Application.Features.ResetPassword;

public interface IResetPasswordHandler
{
    Task<ResetPasswordResponse> HandleAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
}

