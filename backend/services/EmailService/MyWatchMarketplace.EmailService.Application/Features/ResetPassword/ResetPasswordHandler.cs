using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyWatchMarketplace.EmailService.Application.Common.Interfaces;
using MyWatchMarketplace.EmailService.Application.Common.Models;
using MyWatchMarketplace.EmailService.Domain.Enums;
using MyWatchMarketplace.UserManagement.Application.Common.Interfaces;

namespace MyWatchMarketplace.EmailService.Application.Features.ResetPassword;

public class ResetPasswordHandler : IResetPasswordHandler
{
    private readonly IUserManagementDbContext _userDbContext;
    private readonly IPasswordResetTokenService _tokenService;
    private readonly IPasswordHashProvider _hashProvider;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _templateService;
    private readonly ILogger<ResetPasswordHandler> _logger;

    public ResetPasswordHandler(
        IUserManagementDbContext userDbContext,
        IPasswordResetTokenService tokenService,
        IPasswordHashProvider hashProvider,
        IEmailSender emailSender,
        IEmailTemplateService templateService,
        ILogger<ResetPasswordHandler> logger)
    {
        _userDbContext = userDbContext;
        _tokenService = tokenService;
        _hashProvider = hashProvider;
        _emailSender = emailSender;
        _templateService = templateService;
        _logger = logger;
    }

    public async Task<ResetPasswordResponse> HandleAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (request.UserId <= 0)
        {
            return new ResetPasswordResponse(false, "Invalid user ID.");
        }

        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return new ResetPasswordResponse(false, "Reset token is required.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return new ResetPasswordResponse(false, "New password must be at least 6 characters long.");
        }

        var user = await _userDbContext.Logins
            .Include(l => l.Accounts)
            .FirstOrDefaultAsync(l => l.Id == request.UserId, cancellationToken);

        if (user is null)
        {
            return new ResetPasswordResponse(false, "User not found.");
        }

        if (!user.IsActive)
        {
            return new ResetPasswordResponse(false, "User account is inactive.");
        }

        var isValid = _tokenService.ValidateToken(user.Id, user.PasswordHash, request.Token, out var failureReason);
        if (!isValid)
        {
            return new ResetPasswordResponse(false, failureReason ?? "Invalid or expired reset token.");
        }

        // Update password hash
        user.PasswordHash = _hashProvider.HashPassword(request.NewPassword);
        await _userDbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password reset successfully for user {UserId} ({Username})", user.Id, user.Username);

        // Send confirmation email
        try
        {
            var recipientName = user.Accounts.FirstOrDefault()?.Name ?? user.Username;
            var emailHtml = _templateService.GeneratePasswordChangedConfirmationEmail(recipientName);

            var confirmationMessage = new EmailMessage(
                To: user.Email,
                Subject: "Your Meridian Password Has Been Changed",
                BodyHtml: emailHtml,
                BodyText: $"Hello {recipientName},\n\nYour password for Meridian Watch Marketplace was successfully updated. If you did not make this change, please contact support immediately.",
                Type: EmailType.PasswordReset
            );

            await _emailSender.SendEmailAsync(confirmationMessage, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send password-changed confirmation email to {Email}", user.Email);
        }

        return new ResetPasswordResponse(true, "Password has been successfully reset. You can now log in with your new password.");
    }
}

