using System.Text.Json.Serialization;

namespace MyWatchMarketplace.ServiceCenter.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ServiceWorkflowState
{
    ServiceRequestCreated,
    ServiceRequestAccepted,
    ServiceRequestRejected,
    InTransit,
    UnderRepair,
    InTesting,
    TransitBack
}

