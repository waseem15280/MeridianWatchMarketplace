var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5000", "http://localhost:5000");

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must be configured with at least 32 characters.");
}

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

// Add YARP Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? ["http://localhost:3000"];
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("FrontendOnly");
app.UseAuthentication();

app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    var isPublic =
        path.Equals("/", StringComparison.OrdinalIgnoreCase) ||
        path.Equals("/health", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/users/login", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/users/validate", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/users/register", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/emails/forgot-password", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/emails/verify-reset-token", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/emails/reset-password", StringComparison.OrdinalIgnoreCase);

    if (!isPublic && !(context.User.Identity?.IsAuthenticated ?? false))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return;
    }

    await next();
});

app.MapGet("/", () => Results.Ok(new { status = "Healthy", gateway = "MyWatchMarketplace.ApiGateway" }))
   .RequireCors("FrontendOnly");

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", gateway = "MyWatchMarketplace.ApiGateway" }))
   .RequireCors("FrontendOnly");

app.MapReverseProxy();

app.Run();

