using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.ServiceCenter.Domain.Entities;

namespace MyWatchMarketplace.ServiceCenter.Application.Common.Interfaces;

public interface IServiceCenterDbContext
{
    DbSet<ServiceRequest> ServiceRequests { get; }
    DbSet<ServiceRequestAuditLog> ServiceRequestAuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

