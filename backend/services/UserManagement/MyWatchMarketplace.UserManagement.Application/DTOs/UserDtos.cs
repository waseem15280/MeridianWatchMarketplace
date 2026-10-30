using MyWatchMarketplace.UserManagement.Domain.Enums;

namespace MyWatchMarketplace.UserManagement.Application.DTOs;

public record UserLoginDto(
    int Id,
    string Username,
    string Email,
    bool IsActive,
    DateTimeOffset Created,
    DateTimeOffset? LastLoginAt,
    List<UserAccountDto>? Accounts = null
);

public record UserAccountDto(
    int Id,
    int UserLoginId,
    string Name,
    string Email,
    string Role,
    string Avatar,
    string Location,
    string MemberSince,
    bool VerifiedDealer,
    string Bio,
    double Rating,
    int ReviewCount,
    int TotalSalesCount,
    string ResponseRate,
    string AvgShipTime,
    string? Phone,
    bool IsDefault
);

public record LoginRequest(
    string UsernameOrEmail,
    string Password
);

public record LoginResponse(
    string Token,
    UserLoginDto Login,
    List<UserAccountDto> Accounts,
    int ActiveAccountId
);

public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string AccountName,
    UserRole Role,
    string? Location,
    string? Bio
);

public record CreateUserAccountRequest(
    int UserLoginId,
    string Name,
    string Email,
    UserRole Role,
    string? Avatar,
    string? Location,
    string? Bio,
    string? Phone,
    bool? IsDefault
);

public record UpdateUserAccountRequest(
    string? Name,
    string? Email,
    UserRole? Role,
    string? Bio,
    string? Location,
    string? Avatar,
    string? Phone,
    bool? VerifiedDealer
);

public record UpdateUserStatusRequest(
    bool IsActive
);

public record AdminResetPasswordRequest(
    string NewPassword
);

public record UpdateUserLoginRequest(
    string? Username,
    string? Email,
    bool? IsActive
);

public record ChangePasswordRequest(
    string? UsernameOrEmail,
    int? LoginId,
    string CurrentPassword,
    string NewPassword
);

public record ChangePasswordResponse(
    bool Success,
    string Message
);
