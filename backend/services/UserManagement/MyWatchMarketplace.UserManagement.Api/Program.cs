using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.UserManagement.Application.DTOs;
using MyWatchMarketplace.UserManagement.Domain.Entities;
using MyWatchMarketplace.UserManagement.Domain.Enums;
using MyWatchMarketplace.UserManagement.Infrastructure;
using MyWatchMarketplace.UserManagement.Infrastructure.Persistence;
using MyWatchMarketplace.UserManagement.Infrastructure.Security;

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

    using var scope = app.Services.CreateScope();
    var initialiser = scope.ServiceProvider.GetRequiredService<UserManagementDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialise UserAccountDb on startup. Ensure PostgreSQL is running.");
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
    var activeAccountId = activeAccount?.Id ?? string.Empty;

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

    var exists = await db.Logins.AnyAsync(l =>
        l.Username.ToLower() == request.Username.ToLower() ||
        l.Email.ToLower() == request.Email.ToLower());

    if (exists)
    {
        return Results.Conflict(new { message = "A user with this username or email already exists." });
    }

    var newLoginId = "login-" + Guid.NewGuid().ToString("N")[..8];
    var newAccountId = "account-" + Guid.NewGuid().ToString("N")[..8];

    var login = new UserLogin
    {
        Id = newLoginId,
        Username = request.Username.Trim(),
        Email = request.Email.Trim(),
        PasswordHash = PasswordHasher.HashPassword(request.Password),
        IsActive = true,
        LastLoginAt = DateTimeOffset.UtcNow
    };

    var account = new UserAccount
    {
        Id = newAccountId,
        UserLoginId = newLoginId,
        Name = request.AccountName.Trim(),
        Email = request.Email.Trim(),
        Role = request.Role,
        Avatar = $"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        Location = request.Location ?? "Global",
        MemberSince = DateTime.UtcNow.Year.ToString(),
        VerifiedDealer = request.Role == UserRole.Seller,
        Bio = request.Bio ?? $"Member profile for {request.AccountName}",
        Rating = 5.0,
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

// 3. GET /api/users/logins - List all logins and their accounts (for demo switcher)
userApi.MapGet("/logins", async (UserManagementDbContext db) =>
{
    var logins = await db.Logins.AsNoTracking()
        .Include(l => l.Accounts)
        .OrderBy(l => l.Username)
        .ToListAsync();

    var result = logins.Select(l => new
    {
        Id = l.Id,
        Username = l.Username,
        Email = l.Email,
        Created = l.Created,
        LastLoginAt = l.LastLoginAt,
        Accounts = l.Accounts.Select(ToAccountDto).ToList()
    });

    return Results.Ok(result);
});

// 4. GET /api/users/logins/{loginId}/accounts
userApi.MapGet("/logins/{loginId}/accounts", async (string loginId, UserManagementDbContext db) =>
{
    var accounts = await db.Accounts.AsNoTracking()
        .Where(a => a.UserLoginId == loginId)
        .OrderByDescending(a => a.IsDefault)
        .ThenBy(a => a.Name)
        .ToListAsync();

    return Results.Ok(accounts.Select(ToAccountDto));
});

// 5. GET /api/users/accounts - Query all accounts with optional role and loginId filter
userApi.MapGet("/accounts", async (string? role, string? loginId, UserManagementDbContext db) =>
{
    var query = db.Accounts.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(loginId))
    {
        query = query.Where(a => a.UserLoginId == loginId);
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

// 6. GET /api/users/accounts/{id}
userApi.MapGet("/accounts/{id}", async (string id, UserManagementDbContext db) =>
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
        Id = "account-" + Guid.NewGuid().ToString("N")[..8],
        UserLoginId = request.UserLoginId,
        Name = request.Name.Trim(),
        Email = request.Email.Trim(),
        Role = request.Role,
        Avatar = request.Avatar ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        Location = request.Location ?? "Global",
        MemberSince = DateTime.UtcNow.Year.ToString(),
        VerifiedDealer = request.Role == UserRole.Seller,
        Bio = request.Bio ?? $"Role account ({request.Role}) for {request.Name}",
        Rating = 5.0,
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

// 8. PUT /api/users/accounts/{id}
userApi.MapPut("/accounts/{id}", async (string id, UpdateUserAccountRequest request, UserManagementDbContext db) =>
{
    var account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
    if (account is null) return Results.NotFound(new { message = $"UserAccount {id} not found." });

    if (!string.IsNullOrWhiteSpace(request.Name)) account.Name = request.Name.Trim();
    if (!string.IsNullOrWhiteSpace(request.Email)) account.Email = request.Email.Trim();
    if (request.Bio is not null) account.Bio = request.Bio.Trim();
    if (request.Location is not null) account.Location = request.Location.Trim();
    if (request.Avatar is not null) account.Avatar = request.Avatar.Trim();
    if (request.Phone is not null) account.Phone = request.Phone.Trim();
    if (request.VerifiedDealer.HasValue) account.VerifiedDealer = request.VerifiedDealer.Value;

    await db.SaveChangesAsync();
    return Results.Ok(ToAccountDto(account));
});

// 9. POST /api/users/accounts/{id}/set-default
userApi.MapPost("/accounts/{id}/set-default", async (string id, UserManagementDbContext db) =>
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

// 10. DELETE /api/users/accounts/{id}
userApi.MapDelete("/accounts/{id}", async (string id, UserManagementDbContext db) =>
{
    var account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
    if (account is null) return Results.NotFound();

    var siblingCount = await db.Accounts.CountAsync(a => a.UserLoginId == account.UserLoginId);
    if (siblingCount <= 1)
    {
        return Results.BadRequest(new { message = "Cannot delete the sole user account for this login. Each login must retain at least one account." });
    }

    db.Accounts.Remove(account);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

static UserAccountDto ToAccountDto(UserAccount a) => new(
    a.Id,
    a.UserLoginId,
    a.Name,
    a.Email,
    a.Role.ToString().ToLowerInvariant(),
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
    a.IsDefault
);

static UserLoginDto ToLoginDto(UserLogin l) => new(
    l.Id,
    l.Username,
    l.Email,
    l.Created,
    l.LastLoginAt
);

app.Run();
