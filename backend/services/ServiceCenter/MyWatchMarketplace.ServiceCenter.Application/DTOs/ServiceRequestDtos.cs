using MyWatchMarketplace.ServiceCenter.Domain.Enums;

namespace MyWatchMarketplace.ServiceCenter.Application.DTOs;

public record ServiceRequestDto(
    int Id,
    string UserId,
    string CustomerName,
    string? CustomerEmail,
    string? CustomerPhone,
    string WatchBrand,
    string WatchModel,
    string MovementType,
    bool IsWorking,
    bool GlassChangeRequired,
    string IssueDescription,
    ServiceWorkflowState CurrentState,
    decimal? EstimatedPrice,
    string? RejectionReason,
    string? CourierCompany,
    string? TrackingNumber,
    string? ReturnCourierCompany,
    string? ReturnTrackingNumber,
    string? ServiceNotes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    List<ServiceRequestAuditLogDto> AuditLogs
);

public record ServiceRequestAuditLogDto(
    int Id,
    int ServiceRequestId,
    ServiceWorkflowState FromState,
    ServiceWorkflowState ToState,
    string Action,
    string TriggeredByUserId,
    string TriggeredByName,
    string TriggeredByRole,
    string? Notes,
    DateTimeOffset Timestamp
);

public record CreateServiceRequestDto(
    string UserId,
    string CustomerName,
    string? CustomerEmail,
    string? CustomerPhone,
    string WatchBrand,
    string WatchModel,
    string MovementType,
    bool IsWorking,
    bool GlassChangeRequired,
    string IssueDescription
);

public record TransitionRequestDto(
    string TargetState,
    string Action,
    string UserId,
    string UserName,
    string UserRole,
    decimal? EstimatedPrice,
    string? RejectionReason,
    string? CourierCompany,
    string? TrackingNumber,
    string? ReturnCourierCompany,
    string? ReturnTrackingNumber,
    string? Notes
);

public record WorkflowStateDefinitionDto(
    string Id,
    string Name,
    string Description,
    bool IsFinal
);

public record WorkflowTransitionDefinitionDto(
    string Id,
    string From,
    string To,
    string Action,
    List<string> AllowedRoles,
    string? AllowedFor,
    List<string> RequiredFields,
    string Description
);

public record WorkflowDefinitionDto(
    string Id,
    string Name,
    string InitialState,
    List<WorkflowStateDefinitionDto> States,
    List<WorkflowTransitionDefinitionDto> Transitions
);

