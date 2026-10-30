using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.ServiceCenter.Application.Common.Interfaces;
using MyWatchMarketplace.ServiceCenter.Application.DTOs;
using MyWatchMarketplace.ServiceCenter.Application.Services;
using MyWatchMarketplace.ServiceCenter.Domain.Entities;
using MyWatchMarketplace.ServiceCenter.Domain.Enums;
using MyWatchMarketplace.ServiceCenter.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("ServiceCenterDbConnection")
    ?? "Host=localhost;Port=5432;Database=ServiceCenterDb;Username=postgres;Password=Pa55w.rd";

builder.Services.AddDbContext<ServiceCenterDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IServiceCenterDbContext>(provider =>
    provider.GetRequiredService<ServiceCenterDbContext>());

builder.Services.AddScoped<ServiceCenterDbContextInitialiser>();

// XML Workflow Engine
var xmlPath = Path.Combine(AppContext.BaseDirectory, "WorkflowDefinitions", "ServiceWorkflow.xml");
builder.Services.AddSingleton<IWorkflowEngine>(new XmlWorkflowEngine(xmlPath));

// CORS
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

// Database initialisation
using (var scope = app.Services.CreateScope())
{
    var initialiser = scope.ServiceProvider.GetRequiredService<ServiceCenterDbContextInitialiser>();
    try
    {
        await initialiser.InitialiseAsync();
        app.Logger.LogInformation("ServiceCenter database initialized successfully.");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Could not initialise ServiceCenter database.");
    }
}

var api = app.MapGroup("/api/service-center");

// Health check
api.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "ServiceCenter" }))
   .WithName("ServiceCenterHealth");

// Get workflow definition
api.MapGet("/workflow/definition", (IWorkflowEngine engine) =>
{
    return Results.Ok(engine.GetDefinition());
});

// List service requests
api.MapGet("/", async (string? userId, string? role, ServiceCenterDbContext db) =>
{
    var query = db.ServiceRequests
        .Include(s => s.AuditLogs.OrderByDescending(a => a.Timestamp))
        .AsNoTracking();

    var normalizedRole = (role ?? string.Empty).Trim().Replace("-", "_").ToLowerInvariant();
    var isExecutiveOrAdmin = normalizedRole == "service_executive" || normalizedRole == "admin";

    if (!isExecutiveOrAdmin)
    {
        // End user sees only their own requests
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Results.Ok(new List<ServiceRequestDto>());
        }

        query = query.Where(s => s.UserId == userId);
    }

    var requests = await query
        .OrderByDescending(s => s.UpdatedAt)
        .ToListAsync();

    var dtos = requests.Select(MapToDto).ToList();
    return Results.Ok(dtos);
});

// Get request by id
api.MapGet("/{id:int}", async (int id, ServiceCenterDbContext db) =>
{
    var request = await db.ServiceRequests
        .Include(s => s.AuditLogs.OrderByDescending(a => a.Timestamp))
        .AsNoTracking()
        .FirstOrDefaultAsync(s => s.Id == id);

    if (request == null) return Results.NotFound();

    return Results.Ok(MapToDto(request));
});

// Create new service request (End User)
api.MapPost("/", async (CreateServiceRequestDto dto, ServiceCenterDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dto.UserId) ||
        string.IsNullOrWhiteSpace(dto.WatchBrand) ||
        string.IsNullOrWhiteSpace(dto.WatchModel))
    {
        return Results.BadRequest(new { message = "UserId, WatchBrand, and WatchModel are required." });
    }

    var request = new ServiceRequest
    {
        UserId = dto.UserId,
        CustomerName = dto.CustomerName,
        CustomerEmail = dto.CustomerEmail,
        CustomerPhone = dto.CustomerPhone,
        WatchBrand = dto.WatchBrand,
        WatchModel = dto.WatchModel,
        MovementType = dto.MovementType,
        IsWorking = dto.IsWorking,
        GlassChangeRequired = dto.GlassChangeRequired,
        IssueDescription = dto.IssueDescription,
        CurrentState = ServiceWorkflowState.ServiceRequestCreated,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow
    };

    var initialAudit = new ServiceRequestAuditLog
    {
        FromState = ServiceWorkflowState.ServiceRequestCreated,
        ToState = ServiceWorkflowState.ServiceRequestCreated,
        Action = "Service Request Created",
        TriggeredByUserId = dto.UserId,
        TriggeredByName = dto.CustomerName,
        TriggeredByRole = "customer",
        Notes = "Initial watch repair request submitted.",
        Timestamp = DateTimeOffset.UtcNow
    };

    request.AuditLogs.Add(initialAudit);

    db.ServiceRequests.Add(request);
    await db.SaveChangesAsync();

    return Results.Created($"/api/service-center/{request.Id}", MapToDto(request));
});

// Transition request state (Workflow State Machine)
api.MapPost("/{id:int}/transition", async (int id, TransitionRequestDto dto, ServiceCenterDbContext db, IWorkflowEngine engine) =>
{
    var request = await db.ServiceRequests
        .Include(s => s.AuditLogs)
        .FirstOrDefaultAsync(s => s.Id == id);

    if (request == null) return Results.NotFound();

    var (isValid, errorMessage) = engine.ValidateTransition(request, dto);
    if (!isValid)
    {
        return Results.BadRequest(new { message = errorMessage });
    }

    engine.ApplyTransition(request, dto);
    await db.SaveChangesAsync();

    return Results.Ok(MapToDto(request));
});

app.Run();

static ServiceRequestDto MapToDto(ServiceRequest r)
{
    return new ServiceRequestDto(
        r.Id,
        r.UserId,
        r.CustomerName,
        r.CustomerEmail,
        r.CustomerPhone,
        r.WatchBrand,
        r.WatchModel,
        r.MovementType,
        r.IsWorking,
        r.GlassChangeRequired,
        r.IssueDescription,
        r.CurrentState,
        r.EstimatedPrice,
        r.RejectionReason,
        r.CourierCompany,
        r.TrackingNumber,
        r.ReturnCourierCompany,
        r.ReturnTrackingNumber,
        r.ServiceNotes,
        r.CreatedAt,
        r.UpdatedAt,
        r.AuditLogs.Select(a => new ServiceRequestAuditLogDto(
            a.Id,
            a.ServiceRequestId,
            a.FromState,
            a.ToState,
            a.Action,
            a.TriggeredByUserId,
            a.TriggeredByName,
            a.TriggeredByRole,
            a.Notes,
            a.Timestamp
        )).OrderByDescending(a => a.Timestamp).ToList()
    );
}

