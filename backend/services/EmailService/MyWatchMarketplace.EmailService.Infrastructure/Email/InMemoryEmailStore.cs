using System.Collections.Concurrent;
using MyWatchMarketplace.EmailService.Application.Common.Models;

namespace MyWatchMarketplace.EmailService.Infrastructure.Email;

public class InMemoryEmailStore
{
    private readonly ConcurrentQueue<EmailMessageRecord> _emails = new();
    private const int MaxItems = 50;

    public void Add(EmailMessage message, bool success, string? error = null)
    {
        _emails.Enqueue(new EmailMessageRecord(
            To: message.To,
            Subject: message.Subject,
            BodyHtml: message.BodyHtml,
            BodyText: message.BodyText,
            Type: message.Type.ToString(),
            Success: success,
            ErrorMessage: error,
            SentAt: DateTimeOffset.UtcNow
        ));

        while (_emails.Count > MaxItems && _emails.TryDequeue(out _))
        {
        }
    }

    public IReadOnlyList<EmailMessageRecord> GetRecentEmails() => _emails.Reverse().ToList();
}

public record EmailMessageRecord(
    string To,
    string Subject,
    string BodyHtml,
    string? BodyText,
    string Type,
    bool Success,
    string? ErrorMessage,
    DateTimeOffset SentAt
);

