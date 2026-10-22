using MyWatchMarketplace.EmailService.Application.Common.Interfaces;
using MyWatchMarketplace.UserManagement.Infrastructure.Security;

namespace MyWatchMarketplace.EmailService.Infrastructure.Security;

public class PasswordHashProvider : IPasswordHashProvider
{
    public string HashPassword(string password)
    {
        return PasswordHasher.HashPassword(password);
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        return PasswordHasher.VerifyPassword(password, storedHash);
    }
}

