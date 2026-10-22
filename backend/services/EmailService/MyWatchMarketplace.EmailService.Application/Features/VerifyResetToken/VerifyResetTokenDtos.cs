namespace MyWatchMarketplace.EmailService.Application.Features.VerifyResetToken;

public record VerifyResetTokenRequest(int UserId, string Token);

public record VerifyResetTokenResponse(
    bool IsValid,
    string Message,
    string? Username = null
);

