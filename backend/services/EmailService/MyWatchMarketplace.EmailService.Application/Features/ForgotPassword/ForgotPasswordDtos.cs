namespace MyWatchMarketplace.EmailService.Application.Features.ForgotPassword;

public record ForgotPasswordRequest(string EmailOrUsername);

public record ForgotPasswordResponse(
    bool Success,
    string Message,
    string? ResetUrl = null,
    int ExpirationMinutes = 60
);

