using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.UserManagement.Application.DTOs;
using MyWatchMarketplace.UserManagement.Domain.Entities;
using MyWatchMarketplace.UserManagement.Domain.Enums;
using MyWatchMarketplace.UserManagement.Infrastructure;
using MyWatchMarketplace.UserManagement.Infrastructure.Security;
using MyWatchMarketplace.UserManagement.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddUserManagementInfrastructureServices(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var initialiser = scope.ServiceProvider
        .GetRequiredService<UserManagementDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();

        app.Logger.LogInformation(
            "UserManagement database initialized successfully.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialise UserManagement database. Ensure PostgreSQL Docker is running.");
    }
}

app.UseHttpsRedirection();
var userApi = app.MapGroup("/api/users");

// Health check
userApi.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "UserManagement" }))
       .WithName("UserManagementHealth");

// 1. POST /api/users/login
userApi.MapPost("/login", async (LoginRequest request, UserManagementDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.BadRequest(new { message = "Username/Email and password are required." });
    }

    var login = await db.Logins
        .Include(l => l.Accounts)
        .FirstOrDefaultAsync(l =>
            l.Username.ToLower() == request.UsernameOrEmail.ToLower() ||
            l.Email.ToLower() == request.UsernameOrEmail.ToLower());

    if (login is null || !PasswordHasher.VerifyPassword(request.Password, login.PasswordHash))
    {
        return Results.Unauthorized();
    }

    if (!login.IsActive)
    {
        return Results.BadRequest(new { message = "User login has been deactivated." });
    }

    login.LastLoginAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    var accountDtos = login.Accounts.Select(ToAccountDto).ToList();
    var activeAccount = login.Accounts.FirstOrDefault(a => a.IsDefault) ?? login.Accounts.FirstOrDefault();
    var activeAccountId = activeAccount?.Id ?? 0;

    var response = new LoginResponse(
        Token: "mock-jwt-" + Guid.NewGuid().ToString("N"),
        Login: ToLoginDto(login),
        Accounts: accountDtos,
        ActiveAccountId: activeAccountId
    );

    return Results.Ok(response);
});

// 1b. POST /api/users/validate - Explicit endpoint to validate username and password
userApi.MapPost("/validate", async (LoginRequest request, UserManagementDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.BadRequest(new { message = "Username/Email and password are required." });
    }

    var login = await db.Logins
        .Include(l => l.Accounts)
        .FirstOrDefaultAsync(l =>
            l.Username.ToLower() == request.UsernameOrEmail.ToLower() ||
            l.Email.ToLower() == request.UsernameOrEmail.ToLower());

    if (login is null || !PasswordHasher.VerifyPassword(request.Password, login.PasswordHash))
    {
        return Results.Json(new { message = "Invalid username or password." }, statusCode: StatusCodes.Status401Unauthorized);
    }

    if (!login.IsActive)
    {
        return Results.BadRequest(new { message = "User login has been deactivated." });
    }

    login.LastLoginAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    var accountDtos = login.Accounts.Select(ToAccountDto).ToList();
    var activeAccount = login.Accounts.FirstOrDefault(a => a.IsDefault) ?? login.Accounts.FirstOrDefault();
    var activeAccountId = activeAccount?.Id ?? 0;

    var response = new LoginResponse(
        Token: "mock-jwt-" + Guid.NewGuid().ToString("N"),
        Login: ToLoginDto(login),
        Accounts: accountDtos,
        ActiveAccountId: activeAccountId
    );

    return Results.Ok(response);
});

// 2. POST /api/users/register
userApi.MapPost("/register", async (RegisterRequest request, UserManagementDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Username) ||
        string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Password) ||
        string.IsNullOrWhiteSpace(request.AccountName))
    {
        return Results.BadRequest(new { message = "All required fields must be supplied." });
    }

    if (request.Role != UserRole.Buyer && request.Role != UserRole.Collector && request.Role != UserRole.Seller)
    {
        return Results.BadRequest(new { message = "Public registration is limited to Buyer, Collector, and Seller roles only." });
    }

    var exists = await db.Logins.AnyAsync(l =>
        l.Username.ToLower() == request.Username.ToLower() ||
        l.Email.ToLower() == request.Email.ToLower());

    if (exists)
    {
        return Results.Conflict(new { message = "A user with this username or email already exists." });
    }

    var login = new UserLogin
    {
        Username = request.Username.Trim(),
        Email = request.Email.Trim(),
        PasswordHash = PasswordHasher.HashPassword(request.Password),
        IsActive = true,
        LastLoginAt = DateTimeOffset.UtcNow
    };

    var account = new UserAccount
    {
        Name = request.AccountName.Trim(),
        Email = request.Email.Trim(),
        Role = request.Role,
        Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        Location = request.Location ?? "Global",
        MemberSince = DateTime.UtcNow.Year.ToString(),
        VerifiedDealer = request.Role == UserRole.Seller,
        Bio = request.Bio ?? $"Member profile for {request.AccountName}",
        Rating = 0.0,
        ReviewCount = 0,
        TotalSalesCount = 0,
        ResponseRate = "100%",
        AvgShipTime = "Within 24 hours",
        IsDefault = true
    };

    login.Accounts.Add(account);
    db.Logins.Add(login);
    await db.SaveChangesAsync();

    var response = new LoginResponse(
        Token: "mock-jwt-" + Guid.NewGuid().ToString("N"),
        Login: ToLoginDto(login),
        Accounts: new List<UserAccountDto> { ToAccountDto(account) },
        ActiveAccountId: account.Id
    );

    return Results.Created($"/api/users/accounts/{account.Id}", response);
});

// 2b. POST /api/users/admin/create-user - Admin user creation with multiple role personas
userApi.MapPost("/admin/create-user", async (AdminCreateUserRequest request, UserManagementDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Username) ||
        string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Password) ||
        string.IsNullOrWhiteSpace(request.DisplayName))
    {
        return Results.BadRequest(new { message = "Username, Email, Password, and Display Name are required." });
    }

    if (request.Password.Length < 6)
    {
        return Results.BadRequest(new { message = "Password must be at least 6 characters long." });
    }

    if (request.Roles is null || request.Roles.Count == 0)
    {
        return Results.BadRequest(new { message = "At least one role persona must be assigned." });
    }

    var exists = await db.Logins.AnyAsync(l =>
        l.Username.ToLower() == request.Username.ToLower() ||
        l.Email.ToLower() == request.Email.ToLower());

    if (exists)
    {
        return Results.Conflict(new { message = "A user with this username or email already exists." });
    }

    var login = new UserLogin
    {
        Username = request.Username.Trim(),
        Email = request.Email.Trim(),
        PasswordHash = PasswordHasher.HashPassword(request.Password),
        IsActive = true,
        LastLoginAt = null
    };

    var distinctRoles = request.Roles.Distinct().ToList();
    var createdAccounts = new List<UserAccount>();

    for (int i = 0; i < distinctRoles.Count; i++)
    {
        var role = distinctRoles[i];
        var isFirst = (i == 0);
        var roleTitle = role switch
        {
            UserRole.ServiceExecutive => "Service Executive",
            _ => role.ToString()
        };

        var account = new UserAccount
        {
            Name = request.DisplayName.Trim(),
            Email = request.Email.Trim(),
            Role = role,
            Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
            Location = request.Location ?? "Global",
            MemberSince = DateTime.UtcNow.Year.ToString(),
            VerifiedDealer = (role == UserRole.Seller),
            Bio = request.Bio ?? $"THC Horologist Profile ({roleTitle}) for {request.DisplayName.Trim()}",
            Rating = 5.0,
            ReviewCount = 0,
            TotalSalesCount = 0,
            ResponseRate = "100%",
            AvgShipTime = "Within 24 hours",
            IsDefault = isFirst
        };

        login.Accounts.Add(account);
        createdAccounts.Add(account);
    }

    db.Logins.Add(login);
    await db.SaveChangesAsync();

    var accountDtos = createdAccounts.Select(ToAccountDto).ToList();
    var defaultAcc = createdAccounts.FirstOrDefault(a => a.IsDefault) ?? createdAccounts.First();

    var response = new LoginResponse(
        Token: "mock-jwt-" + Guid.NewGuid().ToString("N"),
        Login: ToLoginDto(login),
        Accounts: accountDtos,
        ActiveAccountId: defaultAcc.Id
    );

    return Results.Created($"/api/users/logins/{login.Id}", response);
});

// 3. GET /api/users/logins - List all logins and their accounts (for demo switcher & user management dashboard)
userApi.MapGet("/logins", async (UserManagementDbContext db) =>
{
    var logins = await db.Logins.AsNoTracking()
        .Include(l => l.Accounts)
        .OrderBy(l => l.Username)
        .ToListAsync();

    return Results.Ok(logins.Select(ToLoginDto));
});

// 4. GET /api/users/logins/{loginId:int}/accounts
userApi.MapGet("/logins/{loginId:int}/accounts", async (int loginId, UserManagementDbContext db) =>
{
    var accounts = await db.Accounts.AsNoTracking()
        .Where(a => a.UserLoginId == loginId)
        .OrderByDescending(a => a.IsDefault)
        .ThenBy(a => a.Name)
        .ToListAsync();

    return Results.Ok(accounts.Select(ToAccountDto));
});

// 5. GET /api/users/accounts - Query all accounts with optional role and loginId filter
userApi.MapGet("/accounts", async (string? role, int? loginId, UserManagementDbContext db) =>
{
    var query = db.Accounts.AsNoTracking().AsQueryable();

    if (loginId.HasValue)
    {
        query = query.Where(a => a.UserLoginId == loginId.Value);
    }

    if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var parsedRole))
    {
        query = query.Where(a => a.Role == parsedRole);
    }

    var accounts = await query
        .OrderByDescending(a => a.IsDefault)
        .ThenBy(a => a.Name)
        .ToListAsync();

    return Results.Ok(accounts.Select(ToAccountDto));
});

// 6. GET /api/users/accounts/{id:int}
userApi.MapGet("/accounts/{id:int}", async (int id, UserManagementDbContext db) =>
{
    var account = await db.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
    if (account is null) return Results.NotFound(new { message = $"UserAccount {id} not found." });

    return Results.Ok(ToAccountDto(account));
});

// 7. POST /api/users/accounts - Create another account/persona for a login (single role per account)
userApi.MapPost("/accounts", async (CreateUserAccountRequest request, UserManagementDbContext db) =>
{
    var login = await db.Logins.Include(l => l.Accounts).FirstOrDefaultAsync(l => l.Id == request.UserLoginId);
    if (login is null)
    {
        return Results.NotFound(new { message = $"UserLogin with Id {request.UserLoginId} not found." });
    }

    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email))
    {
        return Results.BadRequest(new { message = "Name and Email are required." });
    }

    var isDefault = request.IsDefault ?? (login.Accounts.Count == 0);

    if (isDefault)
    {
        foreach (var existingAccount in login.Accounts)
        {
            existingAccount.IsDefault = false;
        }
    }

    var account = new UserAccount
    {
        UserLoginId = request.UserLoginId,
        Name = request.Name.Trim(),
        Email = request.Email.Trim(),
        Role = request.Role,
        Avatar = request.Avatar ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        Location = request.Location ?? "Global",
        MemberSince = DateTime.UtcNow.Year.ToString(),
        VerifiedDealer = request.Role == UserRole.Seller,
        Bio = request.Bio ?? $"Role account ({request.Role}) for {request.Name}",
        Rating = 0.0,
        ReviewCount = 0,
        TotalSalesCount = 0,
        ResponseRate = "100%",
        AvgShipTime = "Within 24 hours",
        Phone = request.Phone,
        IsDefault = isDefault
    };

    db.Accounts.Add(account);
    await db.SaveChangesAsync();

    return Results.Created($"/api/users/accounts/{account.Id}", ToAccountDto(account));
});

// 8. PUT /api/users/accounts/{id:int}
userApi.MapPut("/accounts/{id:int}", async (int id, UpdateUserAccountRequest request, UserManagementDbContext db) =>
{
    var account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
    if (account is null) return Results.NotFound(new { message = $"UserAccount {id} not found." });

    if (!string.IsNullOrWhiteSpace(request.Name)) account.Name = request.Name.Trim();
    if (!string.IsNullOrWhiteSpace(request.Email)) account.Email = request.Email.Trim();
    if (request.Role.HasValue) account.Role = request.Role.Value;
    if (request.Bio is not null) account.Bio = request.Bio.Trim();
    if (request.Location is not null) account.Location = request.Location.Trim();
    if (request.Avatar is not null) account.Avatar = request.Avatar.Trim();
    if (request.Phone is not null) account.Phone = request.Phone.Trim();
    if (request.VerifiedDealer.HasValue) account.VerifiedDealer = request.VerifiedDealer.Value;

    await db.SaveChangesAsync();
    return Results.Ok(ToAccountDto(account));
});

// 9. POST /api/users/accounts/{id:int}/set-default
userApi.MapPost("/accounts/{id:int}/set-default", async (int id, UserManagementDbContext db) =>
{
    var target = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
    if (target is null) return Results.NotFound();

    var siblingAccounts = await db.Accounts.Where(a => a.UserLoginId == target.UserLoginId).ToListAsync();
    foreach (var acc in siblingAccounts)
    {
        acc.IsDefault = (acc.Id == id);
    }

    await db.SaveChangesAsync();
    return Results.Ok(ToAccountDto(target));
});

// 10. DELETE /api/users/accounts/{id:int}
userApi.MapDelete("/accounts/{id:int}", async (int id, UserManagementDbContext db) =>
{
    var account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
    if (account is null) return Results.NotFound();

    var siblingCount = await db.Accounts.CountAsync(a => a.UserLoginId == account.UserLoginId);
    if (siblingCount <= 1)
    {
        return Results.BadRequest(new { message = "Cannot delete the sole user persona for this login. Each login must retain at least one persona. To delete the user entirely, use Delete User." });
    }

    db.Accounts.Remove(account);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// 11. POST /api/users/change-password (User self-service)
userApi.MapPost("/change-password", async (ChangePasswordRequest request, UserManagementDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
    {
        return Results.BadRequest(new { success = false, message = "Current password and new password are required." });
    }

    if (request.NewPassword.Length < 6)
    {
        return Results.BadRequest(new { success = false, message = "New password must be at least 6 characters long." });
    }

    var login = await db.Logins.FirstOrDefaultAsync(l =>
        (request.LoginId.HasValue && l.Id == request.LoginId.Value) ||
        (!string.IsNullOrWhiteSpace(request.UsernameOrEmail) && (
            l.Username.ToLower() == request.UsernameOrEmail.ToLower() ||
            l.Email.ToLower() == request.UsernameOrEmail.ToLower()
        ))
    );

    if (login is null)
    {
        return Results.NotFound(new { success = false, message = "User not found." });
    }

    if (!PasswordHasher.VerifyPassword(request.CurrentPassword, login.PasswordHash))
    {
        return Results.BadRequest(new { success = false, message = "Current password is incorrect." });
    }

    login.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
    await db.SaveChangesAsync();

    return Results.Ok(new { success = true, message = "Password changed successfully." });
})
.WithName("ChangePassword");

// 12. PUT /api/users/logins/{id:int}/status (Admin/Service Executive toggle active/inactive)
userApi.MapPut("/logins/{id:int}/status", async (int id, UpdateUserStatusRequest request, UserManagementDbContext db) =>
{
    var login = await db.Logins.Include(l => l.Accounts).FirstOrDefaultAsync(l => l.Id == id);
    if (login is null) return Results.NotFound(new { message = $"User {id} not found." });

    login.IsActive = request.IsActive;
    await db.SaveChangesAsync();

    return Results.Ok(ToLoginDto(login));
});

// 13. PUT /api/users/logins/{id:int}/password (Admin/Service Executive direct password change)
userApi.MapPut("/logins/{id:int}/password", async (int id, AdminResetPasswordRequest request, UserManagementDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
    {
        return Results.BadRequest(new { message = "New password must be at least 6 characters long." });
    }

    var login = await db.Logins.FirstOrDefaultAsync(l => l.Id == id);
    if (login is null) return Results.NotFound(new { message = $"User {id} not found." });

    login.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
    await db.SaveChangesAsync();

    return Results.Ok(new { success = true, message = "User password updated successfully." });
});

// 14. PUT /api/users/logins/{id:int} (Admin/Service Executive edit user login info)
userApi.MapPut("/logins/{id:int}", async (int id, UpdateUserLoginRequest request, UserManagementDbContext db) =>
{
    var login = await db.Logins.Include(l => l.Accounts).FirstOrDefaultAsync(l => l.Id == id);
    if (login is null) return Results.NotFound(new { message = $"User {id} not found." });

    if (!string.IsNullOrWhiteSpace(request.Username))
    {
        var trimmedUsername = request.Username.Trim();
        var usernameConflict = await db.Logins.AnyAsync(l => l.Id != id && l.Username.ToLower() == trimmedUsername.ToLower());
        if (usernameConflict)
        {
            return Results.Conflict(new { message = $"Username '{trimmedUsername}' is already taken." });
        }
        login.Username = trimmedUsername;
    }

    if (!string.IsNullOrWhiteSpace(request.Email))
    {
        var trimmedEmail = request.Email.Trim();
        var emailConflict = await db.Logins.AnyAsync(l => l.Id != id && l.Email.ToLower() == trimmedEmail.ToLower());
        if (emailConflict)
        {
            return Results.Conflict(new { message = $"Email '{trimmedEmail}' is already in use." });
        }
        login.Email = trimmedEmail;
    }

    if (request.IsActive.HasValue)
    {
        login.IsActive = request.IsActive.Value;
    }

    await db.SaveChangesAsync();
    return Results.Ok(ToLoginDto(login));
});

// 15. DELETE /api/users/logins/{id:int} (Admin/Service Executive delete user and all personas entirely)
userApi.MapDelete("/logins/{id:int}", async (int id, UserManagementDbContext db) =>
{
    var login = await db.Logins.Include(l => l.Accounts).FirstOrDefaultAsync(l => l.Id == id);
    if (login is null) return Results.NotFound(new { message = $"User {id} not found." });

    db.Accounts.RemoveRange(login.Accounts);
    db.Logins.Remove(login);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// ================= SELLER ONBOARDING & VERIFICATION STORE =================
var sellerRequests = new List<SellerOnboardingRequestDto>
{
    new(
        Id: 1,
        Type: "new_user",
        UserLoginId: null,
        Username: "geneva_horology",
        Email: "contact@genevahorology.ch",
        DisplayName: "Geneva Horology Gallery",
        Location: "Geneva, Switzerland",
        Bio: "Specialized in vintage Patek Philippe and Audemars Piguet certified timepieces since 1998.",
        Status: "pending",
        SubmittedAt: DateTimeOffset.UtcNow.AddHours(-18),
        UserNotified: false
    ),
    new(
        Id: 2,
        Type: "new_persona",
        UserLoginId: 2,
        Username: "alex_vance",
        Email: "alex@meridian.com",
        DisplayName: "Vance Chrono Atelier",
        Location: "London, UK",
        Bio: "Curated collection of 1960s-1970s sports chronographs and tool watches.",
        Status: "pending",
        SubmittedAt: DateTimeOffset.UtcNow.AddHours(-6),
        UserNotified: false
    )
};

var sellerNotifications = new List<SellerDecisionNotificationDto>();
var sellerRequestIdCounter = 3;
var sellerNotificationIdCounter = 1;

// 16. GET /api/users/seller-onboarding/requests
userApi.MapGet("/seller-onboarding/requests", (string? status) =>
{
    var result = string.IsNullOrWhiteSpace(status) || status.ToLower() == "all"
        ? sellerRequests
        : sellerRequests.Where(r => r.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();

    return Results.Ok(result.OrderByDescending(r => r.SubmittedAt));
});

// 17. POST /api/users/seller-onboarding/requests
userApi.MapPost("/seller-onboarding/requests", (CreateSellerOnboardingRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.DisplayName))
    {
        return Results.BadRequest(new { message = "Username, Email, and Display Name are required." });
    }

    var newId = Interlocked.Increment(ref sellerRequestIdCounter);
    var newRequest = new SellerOnboardingRequestDto(
        Id: newId,
        Type: request.Type,
        UserLoginId: request.UserLoginId,
        Username: request.Username.Trim(),
        Email: request.Email.Trim(),
        DisplayName: request.DisplayName.Trim(),
        Location: request.Location?.Trim(),
        Bio: request.Bio?.Trim(),
        Status: "pending",
        SubmittedAt: DateTimeOffset.UtcNow,
        UserNotified: false
    );

    sellerRequests.Add(newRequest);
    return Results.Created($"/api/users/seller-onboarding/requests/{newId}", newRequest);
});

// 18. POST /api/users/seller-onboarding/requests/{id:int}/approve
userApi.MapPost("/seller-onboarding/requests/{id:int}/approve", async (int id, ApproveSellerRequest request, UserManagementDbContext db) =>
{
    var target = sellerRequests.FirstOrDefault(r => r.Id == id);
    if (target is null) return Results.NotFound(new { message = "Seller request not found." });

    if (target.Status != "pending")
    {
        return Results.BadRequest(new { message = $"Request is already {target.Status}." });
    }

    // Provision seller account persona in database
    UserLogin? login = null;
    if (target.UserLoginId.HasValue)
    {
        login = await db.Logins.Include(l => l.Accounts).FirstOrDefaultAsync(l => l.Id == target.UserLoginId.Value);
    }
    else
    {
        login = await db.Logins.Include(l => l.Accounts).FirstOrDefaultAsync(l =>
            l.Username.ToLower() == target.Username.ToLower() ||
            l.Email.ToLower() == target.Email.ToLower());
    }

    if (login is not null)
    {
        var existingSeller = login.Accounts.FirstOrDefault(a => a.Role == UserRole.Seller);
        if (existingSeller is null)
        {
            var newAccount = new UserAccount
            {
                UserLoginId = login.Id,
                Name = target.DisplayName,
                Email = target.Email,
                Role = UserRole.Seller,
                Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                Location = target.Location ?? "Geneva, Switzerland",
                MemberSince = DateTime.UtcNow.Year.ToString(),
                VerifiedDealer = true,
                Bio = target.Bio ?? $"Certified THC Luxury Timepiece Dealer: {target.DisplayName}",
                Rating = 5.0,
                ReviewCount = 0,
                TotalSalesCount = 0,
                ResponseRate = "100%",
                AvgShipTime = "Within 24 hours",
                IsDefault = login.Accounts.Count == 0
            };
            login.Accounts.Add(newAccount);
            await db.SaveChangesAsync();
        }
    }

    var updatedRequest = target with
    {
        Status = "approved",
        ReviewedAt = DateTimeOffset.UtcNow,
        ReviewedBy = request.AdminUsername ?? "admin",
        UserNotified = false
    };

    var index = sellerRequests.IndexOf(target);
    sellerRequests[index] = updatedRequest;

    // Create decision notification for user's next login
    var notifId = Interlocked.Increment(ref sellerNotificationIdCounter);
    var notification = new SellerDecisionNotificationDto(
        Id: notifId,
        RequestId: target.Id,
        UserLoginId: target.UserLoginId ?? login?.Id,
        Username: target.Username,
        Email: target.Email,
        Status: "approved",
        DisplayName: target.DisplayName,
        Message: "Congratulations! Your THC Verified Seller application has been reviewed and officially approved by THC Administration. Your Seller persona is now active, granting you full access to Seller Hub and timepiece listing capabilities.",
        RejectionReason: null,
        Timestamp: DateTimeOffset.UtcNow,
        Acknowledged: false
    );
    sellerNotifications.Add(notification);

    return Results.Ok(new { success = true, request = updatedRequest, notification });
});

// 19. POST /api/users/seller-onboarding/requests/{id:int}/reject
userApi.MapPost("/seller-onboarding/requests/{id:int}/reject", (int id, RejectSellerRequest request) =>
{
    var target = sellerRequests.FirstOrDefault(r => r.Id == id);
    if (target is null) return Results.NotFound(new { message = "Seller request not found." });

    if (target.Status != "pending")
    {
        return Results.BadRequest(new { message = $"Request is already {target.Status}." });
    }

    var reason = string.IsNullOrWhiteSpace(request.Reason)
        ? "Application does not meet current verification standards."
        : request.Reason.Trim();

    var updatedRequest = target with
    {
        Status = "rejected",
        ReviewedAt = DateTimeOffset.UtcNow,
        ReviewedBy = request.AdminUsername ?? "admin",
        RejectionReason = reason,
        UserNotified = false
    };

    var index = sellerRequests.IndexOf(target);
    sellerRequests[index] = updatedRequest;

    // Create decision notification for user's next login
    var notifId = Interlocked.Increment(ref sellerNotificationIdCounter);
    var notification = new SellerDecisionNotificationDto(
        Id: notifId,
        RequestId: target.Id,
        UserLoginId: target.UserLoginId,
        Username: target.Username,
        Email: target.Email,
        Status: "rejected",
        DisplayName: target.DisplayName,
        Message: "Thank you for your interest in becoming a verified seller. After administrative review, we regret to inform you that your seller application could not be approved at this time.",
        RejectionReason: reason,
        Timestamp: DateTimeOffset.UtcNow,
        Acknowledged: false
    );
    sellerNotifications.Add(notification);

    return Results.Ok(new { success = true, request = updatedRequest, notification });
});

// 20. GET /api/users/seller-onboarding/notifications/{usernameOrEmail}
userApi.MapGet("/seller-onboarding/notifications/{usernameOrEmail}", (string usernameOrEmail) =>
{
    var target = sellerNotifications
        .Where(n => !n.Acknowledged && (
            n.Username.Equals(usernameOrEmail, StringComparison.OrdinalIgnoreCase) ||
            n.Email.Equals(usernameOrEmail, StringComparison.OrdinalIgnoreCase)
        ))
        .OrderByDescending(n => n.Timestamp)
        .FirstOrDefault();

    if (target is null) return Results.NoContent();
    return Results.Ok(target);
});

// 21. POST /api/users/seller-onboarding/notifications/{id:int}/dismiss
userApi.MapPost("/seller-onboarding/notifications/{id:int}/dismiss", (int id) =>
{
    var target = sellerNotifications.FirstOrDefault(n => n.Id == id);
    if (target is null) return Results.NotFound();

    var index = sellerNotifications.IndexOf(target);
    sellerNotifications[index] = target with { Acknowledged = true };

    return Results.Ok(new { success = true });
});

static UserAccountDto ToAccountDto(UserAccount a) => new(
    a.Id,
    a.UserLoginId,
    a.Name,
    a.Email,
    a.Role == UserRole.ServiceExecutive ? "service_executive" : a.Role.ToString().ToLowerInvariant(),
    a.Avatar,
    a.Location,
    a.MemberSince,
    a.VerifiedDealer,
    a.Bio,
    a.Rating,
    a.ReviewCount,
    a.TotalSalesCount,
    a.ResponseRate,
    a.AvgShipTime,
    a.Phone,
    a.IsDefault,
    RolePermissionHelper.GetPermissions(a.Role)
);

static UserLoginDto ToLoginDto(UserLogin l) => new(
    l.Id,
    l.Username,
    l.Email,
    l.IsActive,
    l.Created,
    l.LastLoginAt,
    l.Accounts?.Select(ToAccountDto).ToList()
);

app.Run();
