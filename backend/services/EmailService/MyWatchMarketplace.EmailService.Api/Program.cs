using Microsoft.AspNetCore.Mvc;
using MyWatchMarketplace.EmailService.Application;
using MyWatchMarketplace.EmailService.Application.Features.ForgotPassword;
using MyWatchMarketplace.EmailService.Application.Features.ResetPassword;
using MyWatchMarketplace.EmailService.Application.Features.SendEmail;
using MyWatchMarketplace.EmailService.Application.Features.VerifyResetToken;
using MyWatchMarketplace.EmailService.Infrastructure;
using MyWatchMarketplace.EmailService.Infrastructure.Email;

var builder = WebApplication.CreateBuilder(args);

// Requirement 6: Keep email config in separate appsettings config file
var emailConfigBaseDir = Path.Combine(AppContext.BaseDirectory, "emailsettings.json");
var emailConfigContentRoot = Path.Combine(builder.Environment.ContentRootPath, "emailsettings.json");

if (File.Exists(emailConfigBaseDir))
{
    builder.Configuration.AddJsonFile(emailConfigBaseDir, optional: false, reloadOnChange: true);
}
else if (File.Exists(emailConfigContentRoot))
{
    builder.Configuration.AddJsonFile(emailConfigContentRoot, optional: false, reloadOnChange: true);
}
else
{
    builder.Configuration.AddJsonFile("emailsettings.json", optional: true, reloadOnChange: true);
}

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Clean Architecture & Vertical Slices registrations
builder.Services.AddEmailInfrastructureServices(builder.Configuration);
builder.Services.AddEmailApplicationServices();

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var emailApi = app.MapGroup("/api/emails");

// 1. Health check
emailApi.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "EmailService" }))
        .WithName("EmailServiceHealth");

// 2. Forgot Password - Generates reset link and sends email
emailApi.MapPost("/forgot-password", async (
    [FromBody] ForgotPasswordRequest request,
    IForgotPasswordHandler handler,
    CancellationToken ct) =>
{
    var response = await handler.HandleAsync(request, ct);
    return Results.Ok(response);
})
.WithName("ForgotPassword");

// 3. Verify Reset Token - Checks validity before showing form
emailApi.MapPost("/verify-reset-token", async (
    [FromBody] VerifyResetTokenRequest request,
    IVerifyResetTokenHandler handler,
    CancellationToken ct) =>
{
    var response = await handler.HandleAsync(request, ct);
    if (!response.IsValid)
    {
        return Results.BadRequest(response);
    }
    return Results.Ok(response);
})
.WithName("VerifyResetToken");

// 4. Reset Password - Updates password in UserManagement database
emailApi.MapPost("/reset-password", async (
    [FromBody] ResetPasswordRequest request,
    IResetPasswordHandler handler,
    CancellationToken ct) =>
{
    var response = await handler.HandleAsync(request, ct);
    if (!response.Success)
    {
        return Results.BadRequest(response);
    }
    return Results.Ok(response);
})
.WithName("ResetPassword");

// 5. Send Email - Generic email dispatch
emailApi.MapPost("/send", async (
    [FromBody] SendEmailRequest request,
    ISendEmailHandler handler,
    CancellationToken ct) =>
{
    var response = await handler.HandleAsync(request, ct);
    if (!response.Success)
    {
        return Results.BadRequest(response);
    }
    return Results.Ok(response);
})
.WithName("SendEmail");

// 6. Recent Emails - In-memory store for diagnostics & test inspections
emailApi.MapGet("/recent", (InMemoryEmailStore store) =>
{
    var recent = store.GetRecentEmails();
    return Results.Ok(recent);
})
.WithName("GetRecentEmails");

app.Run();

