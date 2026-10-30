namespace MyWatchMarketplace.EmailService.Application.Common.Models;

public class EmailSettings
{
    public const string SectionName = "EmailSettings";

    public string SmtpHost { get; set; } = "localhost";
    public int SmtpPort { get; set; } = 587;
    public string SenderName { get; set; } = "The Heritage Club (THC)";
    public string SenderEmail { get; set; } = "no-reply@thcwatches.com";
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
    public string FrontendBaseUrl { get; set; } = "http://localhost:3000";
    public int TokenExpirationMinutes { get; set; } = 60;
    public bool UseMockInDevelopment { get; set; } = true;
}

