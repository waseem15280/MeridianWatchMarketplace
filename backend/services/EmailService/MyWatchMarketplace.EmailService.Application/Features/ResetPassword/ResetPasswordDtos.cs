namespace MyWatchMarketplace.EmailService.Application.Features.ResetPassword;

public record ResetPasswordRequest(
    int UserId,
    string Token,
    string NewPassword
);

public record ResetPasswordResponse(
    bool Success,
    string Message
);

