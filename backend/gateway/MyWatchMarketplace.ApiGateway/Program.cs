var builder = WebApplication.CreateBuilder(args);

// Add YARP Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

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

app.MapGet("/", () => Results.Ok(new { status = "Healthy", gateway = "MyWatchMarketplace.ApiGateway" }))
   .RequireCors("AllowAll");

app.MapGet("/health", () => Results.Ok(new { status = "Healthy", gateway = "MyWatchMarketplace.ApiGateway" }))
   .RequireCors("AllowAll");

app.MapReverseProxy();

app.Run();

