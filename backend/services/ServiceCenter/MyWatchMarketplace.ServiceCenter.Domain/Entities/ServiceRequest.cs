using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.ServiceCenter.Domain.Enums;

namespace MyWatchMarketplace.ServiceCenter.Domain.Entities;

public class ServiceRequest : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }

    public string WatchBrand { get; set; } = string.Empty;
    public string WatchModel { get; set; } = string.Empty;
    public string MovementType { get; set; } = string.Empty;
    public bool IsWorking { get; set; } = true;
    public bool GlassChangeRequired { get; set; } = false;
    public string IssueDescription { get; set; } = string.Empty;

    public ServiceWorkflowState CurrentState { get; set; } = ServiceWorkflowState.ServiceRequestCreated;

    public decimal? EstimatedPrice { get; set; }
    public string? RejectionReason { get; set; }

    public string? CourierCompany { get; set; }
    public string? TrackingNumber { get; set; }

    public string? ReturnCourierCompany { get; set; }
    public string? ReturnTrackingNumber { get; set; }

    public string? ServiceNotes { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<ServiceRequestAuditLog> AuditLogs { get; set; } = new List<ServiceRequestAuditLog>();
}

