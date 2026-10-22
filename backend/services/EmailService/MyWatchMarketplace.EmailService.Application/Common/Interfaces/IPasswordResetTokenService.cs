namespace MyWatchMarketplace.EmailService.Application.Common.Interfaces;

public interface IPasswordResetTokenService
{
    string GenerateToken(int userId, string passwordHash, DateTimeOffset expiresAt);
    bool ValidateToken(int userId, string passwordHash, string token, out string? failureReason);
}

