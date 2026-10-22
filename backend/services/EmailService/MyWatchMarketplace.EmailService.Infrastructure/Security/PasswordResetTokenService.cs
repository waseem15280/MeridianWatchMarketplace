using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using MyWatchMarketplace.EmailService.Application.Common.Interfaces;

namespace MyWatchMarketplace.EmailService.Infrastructure.Security;

public class PasswordResetTokenService : IPasswordResetTokenService
{
    private readonly string _secretKey;

    public PasswordResetTokenService(IConfiguration configuration)
    {
        _secretKey = configuration["Security:ResetTokenSecret"]
            ?? configuration["Jwt:Key"]
            ?? "meridian_luxury_timepiece_super_secure_reset_key_2026";
    }

    public string GenerateToken(int userId, string passwordHash, DateTimeOffset expiresAt)
    {
        var expiresEpoch = expiresAt.ToUnixTimeSeconds();
        var payload = $"{userId}:{expiresEpoch}";

        var keyBytes = DeriveKey(_secretKey, passwordHash);
        using var hmac = new HMACSHA256(keyBytes);
        var sig = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var sigHex = Convert.ToHexString(sig).ToLowerInvariant();

        var tokenRaw = $"{userId}.{expiresEpoch}.{sigHex}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(tokenRaw))
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    public bool ValidateToken(int userId, string passwordHash, string token, out string? failureReason)
    {
        failureReason = null;

        if (string.IsNullOrWhiteSpace(token))
        {
            failureReason = "Token is empty.";
            return false;
        }

        try
        {
            var padded = token.Replace("-", "+").Replace("_", "/");
            switch (padded.Length % 4)
            {
                case 2: padded += "=="; break;
                case 3: padded += "="; break;
            }

            var tokenRaw = Encoding.UTF8.GetString(Convert.FromBase64String(padded));
            var parts = tokenRaw.Split('.');
            if (parts.Length != 3)
            {
                failureReason = "Malformed reset token format.";
                return false;
            }

            if (!int.TryParse(parts[0], out var tokenUserId) || tokenUserId != userId)
            {
                failureReason = "Token does not belong to this user.";
                return false;
            }

            if (!long.TryParse(parts[1], out var tokenExpiresEpoch))
            {
                failureReason = "Invalid expiration timestamp in token.";
                return false;
            }

            var expiresAt = DateTimeOffset.FromUnixTimeSeconds(tokenExpiresEpoch);
            if (DateTimeOffset.UtcNow > expiresAt)
            {
                failureReason = "The password reset link has expired. Please request a new one.";
                return false;
            }

            var payload = $"{userId}:{tokenExpiresEpoch}";
            var keyBytes = DeriveKey(_secretKey, passwordHash);
            using var hmac = new HMACSHA256(keyBytes);
            var computedSig = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            var computedSigHex = Convert.ToHexString(computedSig).ToLowerInvariant();

            var providedSigBytes = Encoding.UTF8.GetBytes(parts[2].ToLowerInvariant());
            var computedSigBytes = Encoding.UTF8.GetBytes(computedSigHex);

            if (!CryptographicOperations.FixedTimeEquals(providedSigBytes, computedSigBytes))
            {
                failureReason = "Invalid or already-used reset token.";
                return false;
            }

            return true;
        }
        catch (Exception)
        {
            failureReason = "Invalid reset token.";
            return false;
        }
    }

    private static byte[] DeriveKey(string secretKey, string passwordHash)
    {
        using var sha = SHA256.Create();
        return sha.ComputeHash(Encoding.UTF8.GetBytes($"{secretKey}:{passwordHash}"));
    }
}

