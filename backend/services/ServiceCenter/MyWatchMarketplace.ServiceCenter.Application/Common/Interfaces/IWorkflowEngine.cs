using MyWatchMarketplace.ServiceCenter.Application.DTOs;
using MyWatchMarketplace.ServiceCenter.Domain.Entities;

namespace MyWatchMarketplace.ServiceCenter.Application.Common.Interfaces;

public interface IWorkflowEngine
{
    WorkflowDefinitionDto GetDefinition();
    (bool IsValid, string? ErrorMessage) ValidateTransition(ServiceRequest request, TransitionRequestDto transition);
    void ApplyTransition(ServiceRequest request, TransitionRequestDto transition);
}

