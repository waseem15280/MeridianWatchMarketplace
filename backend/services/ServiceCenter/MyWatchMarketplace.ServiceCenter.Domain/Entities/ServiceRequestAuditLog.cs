using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.ServiceCenter.Domain.Enums;

namespace MyWatchMarketplace.ServiceCenter.Domain.Entities;

public class ServiceRequestAuditLog : BaseEntity
{
    public int ServiceRequestId { get; set; }
    public ServiceRequest ServiceRequest { get; set; } = null!;

    public ServiceWorkflowState FromState { get; set; }
    public ServiceWorkflowState ToState { get; set; }
    public string Action { get; set; } = string.Empty;

    public string TriggeredByUserId { get; set; } = string.Empty;
    public string TriggeredByName { get; set; } = string.Empty;
    public string TriggeredByRole { get; set; } = string.Empty;

    public string? Notes { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}

