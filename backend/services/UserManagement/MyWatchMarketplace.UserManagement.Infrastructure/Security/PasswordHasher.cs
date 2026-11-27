using System.Security.Cryptography;
using System.Text;

namespace MyWatchMarketplace.UserManagement.Infrastructure.Security;

public static class PasswordHasher
{
    private const int Iterations = 100_000;

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
        return $"pbkdf2${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        if (storedHash.StartsWith("pbkdf2$", StringComparison.Ordinal))
        {
            var parts = storedHash.Split('$');
            if (parts.Length != 4 ||
                !int.TryParse(parts[1], out var iterations) ||
                iterations < 100_000)
            {
                return false;
            }

            try
            {
                var salt = Convert.FromBase64String(parts[2]);
                var expected = Convert.FromBase64String(parts[3]);
                var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
                return CryptographicOperations.FixedTimeEquals(actual, expected);
            }
            catch (FormatException)
            {
                return false;
            }
        }

        // Verify earlier unsalted and fixed-salt SHA-256 hashes during migration.
        return VerifyLegacyHash(password, storedHash, string.Empty) ||
               VerifyLegacyHash(password, storedHash, "mywatch_salt_");
    }

    public static bool NeedsUpgrade(string storedHash) =>
        !storedHash.StartsWith("pbkdf2$", StringComparison.Ordinal);

    private static bool VerifyLegacyHash(string password, string storedHash, string saltPrefix)
    {
        try
        {
            var expected = Convert.FromHexString(storedHash);
            using var sha256 = SHA256.Create();
            var actual = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltPrefix + password));
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
