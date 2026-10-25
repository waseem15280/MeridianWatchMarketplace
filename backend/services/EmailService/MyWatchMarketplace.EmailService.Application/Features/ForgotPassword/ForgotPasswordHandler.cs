using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyWatchMarketplace.EmailService.Application.Common.Interfaces;
using MyWatchMarketplace.EmailService.Application.Common.Models;
using MyWatchMarketplace.EmailService.Domain.Enums;
using MyWatchMarketplace.UserManagement.Application.Common.Interfaces;

namespace MyWatchMarketplace.EmailService.Application.Features.ForgotPassword;

public class ForgotPasswordHandler : IForgotPasswordHandler
{
    private readonly IUserManagementDbContext _userDbContext;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _templateService;
    private readonly IPasswordResetTokenService _tokenService;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<ForgotPasswordHandler> _logger;

    public ForgotPasswordHandler(
        IUserManagementDbContext userDbContext,
        IEmailSender emailSender,
        IEmailTemplateService templateService,
        IPasswordResetTokenService tokenService,
        IOptions<EmailSettings> emailSettings,
        ILogger<ForgotPasswordHandler> logger)
    {
        _userDbContext = userDbContext;
        _emailSender = emailSender;
        _templateService = templateService;
        _tokenService = tokenService;
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    public async Task<ForgotPasswordResponse> HandleAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.EmailOrUsername))
        {
            return new ForgotPasswordResponse(false, "Please provide your email address or username.");
        }

        var query = request.EmailOrUsername.Trim().ToLowerInvariant();

        var user = await _userDbContext.Logins
            .Include(l => l.Accounts)
            .FirstOrDefaultAsync(l => l.Username.ToLower() == query || l.Email.ToLower() == query, cancellationToken);

        if (user is null)
        {
            _logger.LogInformation("Password reset requested for non-existent user/email: {Input}", request.EmailOrUsername);
            // Return success message to prevent user enumeration attacks
            return new ForgotPasswordResponse(
                true,
                "If an account is associated with that email or username, a password reset link has been dispatched."
            );
        }

        if (!user.IsActive)
        {
            return new ForgotPasswordResponse(false, "This user account has been deactivated.");
        }

        var expirationMinutes = _emailSettings.TokenExpirationMinutes > 0 ? _emailSettings.TokenExpirationMinutes : 60;
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(expirationMinutes);

        var token = _tokenService.GenerateToken(user.Id, user.PasswordHash, expiresAt);
        var encodedToken = Uri.EscapeDataString(token);
        var resetUrl = $"{_emailSettings.FrontendBaseUrl.TrimEnd('/')}?resetToken={encodedToken}&userId={user.Id}";

        var recipientName = user.Accounts.FirstOrDefault()?.Name ?? user.Username;
        var emailHtml = _templateService.GeneratePasswordResetEmail(recipientName, resetUrl, expirationMinutes);

        var emailMessage = new EmailMessage(
            To: user.Email,
            Subject: "Reset Your Meridian Watch Marketplace Password",
            BodyHtml: emailHtml,
            BodyText: $"Hello {recipientName},\n\nYou requested to reset your password. Use the following link within {expirationMinutes} minutes:\n{resetUrl}\n\nIf you did not request this, please ignore this email.",
            Type: EmailType.PasswordReset
        );

        var sendResult = await _emailSender.SendEmailAsync(emailMessage, cancellationToken);

        _logger.LogInformation("Password reset email sent to {Email}. Success: {Success}", user.Email, sendResult.Success);

        return new ForgotPasswordResponse(
            true,
            "If an account is associated with that email or username, a password reset link has been dispatched.",
            ResetUrl: _emailSettings.UseMockInDevelopment ? resetUrl : null,
            ExpirationMinutes: expirationMinutes
        );
    }
}

