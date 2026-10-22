namespace MyWatchMarketplace.EmailService.Application.Common.Interfaces;

public interface IPasswordHashProvider
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string storedHash);
}

