using System.Reflection;
using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.ServiceCenter.Application.Common.Interfaces;
using MyWatchMarketplace.ServiceCenter.Domain.Entities;

namespace MyWatchMarketplace.ServiceCenter.Infrastructure.Persistence;

public class ServiceCenterDbContext : DbContext, IServiceCenterDbContext
{
    public ServiceCenterDbContext(DbContextOptions<ServiceCenterDbContext> options)
        : base(options)
    {
    }

    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<ServiceRequestAuditLog> ServiceRequestAuditLogs => Set<ServiceRequestAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}

