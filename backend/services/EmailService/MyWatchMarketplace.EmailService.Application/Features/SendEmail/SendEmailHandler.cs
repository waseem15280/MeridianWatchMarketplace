using MyWatchMarketplace.EmailService.Application.Common.Interfaces;
using MyWatchMarketplace.EmailService.Application.Common.Models;

namespace MyWatchMarketplace.EmailService.Application.Features.SendEmail;

public class SendEmailHandler : ISendEmailHandler
{
    private readonly IEmailSender _emailSender;

    public SendEmailHandler(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    public async Task<SendEmailResponse> HandleAsync(SendEmailRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.Subject))
        {
            return new SendEmailResponse(false, null, "Recipient email and subject are required.");
        }

        var message = new EmailMessage(
            To: request.To.Trim(),
            Subject: request.Subject.Trim(),
            BodyHtml: request.BodyHtml,
            BodyText: request.BodyText,
            Type: request.Type
        );

        var result = await _emailSender.SendEmailAsync(message, cancellationToken);
        return new SendEmailResponse(result.Success, result.MessageId, result.ErrorMessage);
    }
}

