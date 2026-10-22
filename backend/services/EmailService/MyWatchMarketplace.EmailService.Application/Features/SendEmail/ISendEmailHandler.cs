namespace MyWatchMarketplace.EmailService.Application.Features.SendEmail;

public interface ISendEmailHandler
{
    Task<SendEmailResponse> HandleAsync(SendEmailRequest request, CancellationToken cancellationToken = default);
}

