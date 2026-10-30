using System.Xml.Linq;
using MyWatchMarketplace.ServiceCenter.Application.Common.Interfaces;
using MyWatchMarketplace.ServiceCenter.Application.DTOs;
using MyWatchMarketplace.ServiceCenter.Domain.Entities;
using MyWatchMarketplace.ServiceCenter.Domain.Enums;

namespace MyWatchMarketplace.ServiceCenter.Application.Services;

public class XmlWorkflowEngine : IWorkflowEngine
{
    private readonly WorkflowDefinitionDto _definition;

    public XmlWorkflowEngine(string? xmlFilePath = null)
    {
        _definition = LoadWorkflowFromXml(xmlFilePath);
    }

    public WorkflowDefinitionDto GetDefinition() => _definition;

    public (bool IsValid, string? ErrorMessage) ValidateTransition(ServiceRequest request, TransitionRequestDto transition)
    {
        var currentStateStr = request.CurrentState.ToString();
        var targetStateStr = transition.TargetState;

        // Check matching transition from current state to target state
        var matchingTransition = _definition.Transitions.FirstOrDefault(t =>
            string.Equals(t.From, currentStateStr, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(t.To, targetStateStr, StringComparison.OrdinalIgnoreCase));

        if (matchingTransition == null)
        {
            return (false, $"Invalid state transition from '{currentStateStr}' to '{targetStateStr}'.");
        }

        // Normalize roles for comparison
        var normalizedUserRole = NormalizeRole(transition.UserRole);
        var isAuthorizedRole = matchingTransition.AllowedRoles.Any(r =>
            string.Equals(NormalizeRole(r), normalizedUserRole, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(normalizedUserRole, "admin", StringComparison.OrdinalIgnoreCase));

        if (!isAuthorizedRole)
        {
            return (false, $"Role '{transition.UserRole}' is not authorized to transition state to '{targetStateStr}'. Required: {string.Join(", ", matchingTransition.AllowedRoles)}.");
        }

        // Check ownership if required
        if (string.Equals(matchingTransition.AllowedFor, "owner", StringComparison.OrdinalIgnoreCase))
        {
            var isOwner = string.Equals(request.UserId, transition.UserId, StringComparison.OrdinalIgnoreCase);
            var isAdmin = string.Equals(normalizedUserRole, "admin", StringComparison.OrdinalIgnoreCase);
            if (!isOwner && !isAdmin)
            {
                return (false, "Only the owner (customer) of this service request can perform this dispatch transition.");
            }
        }

        // Validate required fields
        foreach (var field in matchingTransition.RequiredFields)
        {
            switch (field.ToLowerInvariant())
            {
                case "estimatedprice":
                    if (!transition.EstimatedPrice.HasValue || transition.EstimatedPrice.Value <= 0)
                    {
                        return (false, "An estimated price quote greater than 0 is required to accept this service request.");
                    }
                    break;

                case "rejectionreason":
                    if (string.IsNullOrWhiteSpace(transition.RejectionReason))
                    {
                        return (false, "A reason is required when rejecting a service request.");
                    }
                    break;

                case "couriercompany":
                    if (string.IsNullOrWhiteSpace(transition.CourierCompany))
                    {
                        return (false, "Courier company name is required.");
                    }
                    break;

                case "trackingnumber":
                    if (string.IsNullOrWhiteSpace(transition.TrackingNumber))
                    {
                        return (false, "Courier tracking number is required.");
                    }
                    break;

                case "returncouriercompany":
                    if (string.IsNullOrWhiteSpace(transition.ReturnCourierCompany))
                    {
                        return (false, "Return courier company name is required.");
                    }
                    break;

                case "returntrackingnumber":
                    if (string.IsNullOrWhiteSpace(transition.ReturnTrackingNumber))
                    {
                        return (false, "Return tracking number is required.");
                    }
                    break;
            }
        }

        return (true, null);
    }

    public void ApplyTransition(ServiceRequest request, TransitionRequestDto transition)
    {
        var fromState = request.CurrentState;
        if (!Enum.TryParse<ServiceWorkflowState>(transition.TargetState, true, out var toState))
        {
            throw new InvalidOperationException($"Target state '{transition.TargetState}' is not a recognized workflow state.");
        }

        request.CurrentState = toState;
        request.UpdatedAt = DateTimeOffset.UtcNow;

        if (transition.EstimatedPrice.HasValue)
        {
            request.EstimatedPrice = transition.EstimatedPrice.Value;
        }

        if (!string.IsNullOrWhiteSpace(transition.RejectionReason))
        {
            request.RejectionReason = transition.RejectionReason;
        }

        if (!string.IsNullOrWhiteSpace(transition.CourierCompany))
        {
            request.CourierCompany = transition.CourierCompany;
        }

        if (!string.IsNullOrWhiteSpace(transition.TrackingNumber))
        {
            request.TrackingNumber = transition.TrackingNumber;
        }

        if (!string.IsNullOrWhiteSpace(transition.ReturnCourierCompany))
        {
            request.ReturnCourierCompany = transition.ReturnCourierCompany;
        }

        if (!string.IsNullOrWhiteSpace(transition.ReturnTrackingNumber))
        {
            request.ReturnTrackingNumber = transition.ReturnTrackingNumber;
        }

        if (!string.IsNullOrWhiteSpace(transition.Notes))
        {
            request.ServiceNotes = string.IsNullOrWhiteSpace(request.ServiceNotes)
                ? $"[{DateTimeOffset.UtcNow:g}] {transition.Notes}"
                : $"{request.ServiceNotes}\n[{DateTimeOffset.UtcNow:g}] {transition.Notes}";
        }

        // Add audit log
        var audit = new ServiceRequestAuditLog
        {
            ServiceRequestId = request.Id,
            FromState = fromState,
            ToState = toState,
            Action = transition.Action,
            TriggeredByUserId = transition.UserId,
            TriggeredByName = transition.UserName,
            TriggeredByRole = transition.UserRole,
            Notes = transition.Notes ?? transition.RejectionReason,
            Timestamp = DateTimeOffset.UtcNow
        };

        request.AuditLogs.Add(audit);
    }

    private static string NormalizeRole(string role)
    {
        return role.Trim().Replace("-", "_").ToLowerInvariant();
    }

    private static WorkflowDefinitionDto LoadWorkflowFromXml(string? filePath)
    {
        XDocument doc;
        if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath))
        {
            doc = XDocument.Load(filePath);
        }
        else
        {
            doc = XDocument.Parse(GetDefaultWorkflowXml());
        }

        var root = doc.Root ?? throw new InvalidOperationException("XML has no root element.");
        var workflowId = root.Attribute("id")?.Value ?? "watch-repair-workflow";
        var workflowName = root.Attribute("name")?.Value ?? "Watch Repair Service Workflow";
        var initialState = root.Attribute("initial")?.Value ?? "ServiceRequestCreated";

        var states = new List<WorkflowStateDefinitionDto>();
        var statesElem = root.Element("States");
        if (statesElem != null)
        {
            foreach (var s in statesElem.Elements("State"))
            {
                states.Add(new WorkflowStateDefinitionDto(
                    s.Attribute("id")?.Value ?? string.Empty,
                    s.Attribute("name")?.Value ?? string.Empty,
                    s.Attribute("description")?.Value ?? string.Empty,
                    bool.TryParse(s.Attribute("isFinal")?.Value, out var isFinal) && isFinal
                ));
            }
        }

        var transitions = new List<WorkflowTransitionDefinitionDto>();
        var transitionsElem = root.Element("Transitions");
        if (transitionsElem != null)
        {
            foreach (var t in transitionsElem.Elements("Transition"))
            {
                var allowedRolesStr = t.Attribute("allowedRoles")?.Value ?? string.Empty;
                var roles = allowedRolesStr.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(r => r.Trim())
                    .ToList();

                var reqFieldsStr = t.Attribute("requiredFields")?.Value ?? string.Empty;
                var fields = reqFieldsStr.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(f => f.Trim())
                    .ToList();

                transitions.Add(new WorkflowTransitionDefinitionDto(
                    t.Attribute("id")?.Value ?? string.Empty,
                    t.Attribute("from")?.Value ?? string.Empty,
                    t.Attribute("to")?.Value ?? string.Empty,
                    t.Attribute("action")?.Value ?? string.Empty,
                    roles,
                    t.Attribute("allowedFor")?.Value,
                    fields,
                    t.Element("Description")?.Value ?? string.Empty
                ));
            }
        }

        return new WorkflowDefinitionDto(workflowId, workflowName, initialState, states, transitions);
    }

    private static string GetDefaultWorkflowXml() =>
@"<?xml version=""1.0"" encoding=""utf-8""?>
<Workflow id=""watch-repair-workflow"" name=""Watch Repair Service Workflow"" initial=""ServiceRequestCreated"">
  <States>
    <State id=""ServiceRequestCreated"" name=""Service Request Created"" description=""Request initiated by Customer with watch diagnostic specs"" />
    <State id=""ServiceRequestAccepted"" name=""Service Request Accepted"" description=""Service Executive approved service with tentative price quote"" />
    <State id=""ServiceRequestRejected"" name=""Service Request Rejected"" description=""Service Executive declined service"" isFinal=""true"" />
    <State id=""InTransit"" name=""In Transit"" description=""Customer dispatched watch with carrier tracking number"" />
    <State id=""UnderRepair"" name=""Under Repair"" description=""Atelier master watchmaker actively servicing timepiece"" />
    <State id=""InTesting"" name=""In Testing"" description=""Undergoing precision regulation, amplitude, and water resistance testing"" />
    <State id=""TransitBack"" name=""Transit Back"" description=""Servicing complete; watch dispatched back to customer"" isFinal=""true"" />
  </States>

  <Transitions>
    <!-- 1. Accept or Reject: Service Executive / Admin only -->
    <Transition id=""tr_accept"" from=""ServiceRequestCreated"" to=""ServiceRequestAccepted"" action=""Accept Request"" allowedRoles=""service_executive,admin"" requiredFields=""estimatedPrice"">
      <Description>Service Executive reviews diagnostic details, enters estimated cost, and accepts.</Description>
    </Transition>
    <Transition id=""tr_reject"" from=""ServiceRequestCreated"" to=""ServiceRequestRejected"" action=""Reject Request"" allowedRoles=""service_executive,admin"" requiredFields=""rejectionReason"">
      <Description>Service Executive declines service with explanation.</Description>
    </Transition>

    <!-- 2. Ship to Center: Customer (Request Owner) only -->
    <Transition id=""tr_dispatch"" from=""ServiceRequestAccepted"" to=""InTransit"" action=""Dispatch Watch"" allowedRoles=""buyer,collector,seller,customer"" allowedFor=""owner"" requiredFields=""courierCompany,trackingNumber"">
      <Description>Customer ships watch and provides carrier and tracking info.</Description>
    </Transition>

    <!-- 3. Begin Repair: Service Executive / Admin only -->
    <Transition id=""tr_repair"" from=""InTransit"" to=""UnderRepair"" action=""Begin Repair"" allowedRoles=""service_executive,admin"">
      <Description>Package received at facility; watchmaker begins repair operations.</Description>
    </Transition>

    <!-- 4. Quality Testing: Service Executive / Admin only -->
    <Transition id=""tr_test"" from=""UnderRepair"" to=""InTesting"" action=""Move to Testing"" allowedRoles=""service_executive,admin"">
      <Description>Repair complete; watch moved to testing station for calibration.</Description>
    </Transition>

    <!-- 5. Return Dispatch: Service Executive / Admin only -->
    <Transition id=""tr_return"" from=""InTesting"" to=""TransitBack"" action=""Dispatch Return"" allowedRoles=""service_executive,admin"" requiredFields=""returnCourierCompany,returnTrackingNumber"">
      <Description>Inspection passed; watch shipped back to customer with tracking number.</Description>
    </Transition>
  </Transitions>
</Workflow>";
}

