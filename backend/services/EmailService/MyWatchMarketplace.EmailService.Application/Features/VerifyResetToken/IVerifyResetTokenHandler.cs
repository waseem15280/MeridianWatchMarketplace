namespace MyWatchMarketplace.EmailService.Application.Features.VerifyResetToken;

public interface IVerifyResetTokenHandler
{
    Task<VerifyResetTokenResponse> HandleAsync(VerifyResetTokenRequest request, CancellationToken cancellationToken = default);
}

