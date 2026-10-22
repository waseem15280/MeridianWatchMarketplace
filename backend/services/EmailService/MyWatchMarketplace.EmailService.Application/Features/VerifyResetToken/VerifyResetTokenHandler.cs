using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.EmailService.Application.Common.Interfaces;
using MyWatchMarketplace.UserManagement.Application.Common.Interfaces;

namespace MyWatchMarketplace.EmailService.Application.Features.VerifyResetToken;

public class VerifyResetTokenHandler : IVerifyResetTokenHandler
{
    private readonly IUserManagementDbContext _userDbContext;
    private readonly IPasswordResetTokenService _tokenService;

    public VerifyResetTokenHandler(
        IUserManagementDbContext userDbContext,
        IPasswordResetTokenService tokenService)
    {
        _userDbContext = userDbContext;
        _tokenService = tokenService;
    }

    public async Task<VerifyResetTokenResponse> HandleAsync(VerifyResetTokenRequest request, CancellationToken cancellationToken = default)
    {
        if (request.UserId <= 0 || string.IsNullOrWhiteSpace(request.Token))
        {
            return new VerifyResetTokenResponse(false, "Invalid token parameters.");
        }

        var user = await _userDbContext.Logins
            .FirstOrDefaultAsync(l => l.Id == request.UserId, cancellationToken);

        if (user is null)
        {
            return new VerifyResetTokenResponse(false, "User not found.");
        }

        if (!user.IsActive)
        {
            return new VerifyResetTokenResponse(false, "User account is inactive.");
        }

        var isValid = _tokenService.ValidateToken(user.Id, user.PasswordHash, request.Token, out var failureReason);
        if (!isValid)
        {
            return new VerifyResetTokenResponse(false, failureReason ?? "Token is invalid or has expired.");
        }

        return new VerifyResetTokenResponse(true, "Token is valid.", user.Username);
    }
}

