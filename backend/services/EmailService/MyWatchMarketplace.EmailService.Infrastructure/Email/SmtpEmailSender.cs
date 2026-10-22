using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyWatchMarketplace.EmailService.Application.Common.Interfaces;
using MyWatchMarketplace.EmailService.Application.Common.Models;

namespace MyWatchMarketplace.EmailService.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailSettings _settings;
    private readonly InMemoryEmailStore _emailStore;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(
        IOptions<EmailSettings> options,
        InMemoryEmailStore emailStore,
        ILogger<SmtpEmailSender> logger)
    {
        _settings = options.Value;
        _emailStore = emailStore;
        _logger = logger;
    }

    public async Task<EmailResult> SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var sentAt = DateTimeOffset.UtcNow;
        var messageId = Guid.NewGuid().ToString("N");

        // If mock development is enabled or SMTP credentials are not configured, simulate delivery safely
        if (_settings.UseMockInDevelopment || string.IsNullOrWhiteSpace(_settings.Password) || string.IsNullOrWhiteSpace(_settings.SmtpHost))
        {
            _logger.LogInformation("================================================================================");
            _logger.LogInformation(" [SIMULATED EMAIL DELIVERY]");
            _logger.LogInformation(" To:      {To}", message.To);
            _logger.LogInformation(" Subject: {Subject}", message.Subject);
            _logger.LogInformation(" Type:    {Type}", message.Type);
            _logger.LogInformation(" Body:    {Body}", message.BodyText ?? "(HTML Content)");
            _logger.LogInformation("================================================================================");

            _emailStore.Add(message, true);
            return new EmailResult(true, messageId, null, sentAt);
        }

        try
        {
            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = _settings.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_settings.Username, _settings.Password)
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(_settings.SenderEmail, _settings.SenderName),
                Subject = message.Subject,
                Body = message.BodyHtml,
                IsBodyHtml = true
            };

            mailMessage.To.Add(message.To);

            await client.SendMailAsync(mailMessage, cancellationToken);

            _logger.LogInformation("Successfully sent email via SMTP to {To}. MessageId: {MessageId}", message.To, messageId);
            _emailStore.Add(message, true);
            return new EmailResult(true, messageId, null, sentAt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via SMTP to {To}: {ErrorMessage}", message.To, ex.Message);
            _emailStore.Add(message, false, ex.Message);
            return new EmailResult(false, messageId, ex.Message, sentAt);
        }
    }
}

