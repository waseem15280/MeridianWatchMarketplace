using System.Security.Cryptography;
using System.Text;

namespace MyWatchMarketplace.UserManagement.Infrastructure.Security;

public static class PasswordHasher
{
    public static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes("mywatch_salt_" + password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        var computed = HashPassword(password);
        return string.Equals(computed, storedHash, StringComparison.OrdinalIgnoreCase);
    }
}
