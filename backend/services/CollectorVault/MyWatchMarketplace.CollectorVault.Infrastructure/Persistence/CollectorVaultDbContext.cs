using System.Reflection;
using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.CollectorVault.Application.Common.Interfaces;
using MyWatchMarketplace.CollectorVault.Domain.Entities;

namespace MyWatchMarketplace.CollectorVault.Infrastructure.Persistence;

public class CollectorVaultDbContext : DbContext, ICollectorVaultDbContext
{
    public CollectorVaultDbContext(DbContextOptions<CollectorVaultDbContext> options)
        : base(options)
    {
    }

    public DbSet<VaultWatch> VaultWatches => Set<VaultWatch>();

    public DbSet<ValuationRecord> ValuationRecords => Set<ValuationRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditableEntities();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateAuditableEntities();
        return base.SaveChanges();
    }

    private void UpdateAuditableEntities()
    {
        var utcNow = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.Created = utcNow;
                entry.Entity.LastModified = utcNow;
                entry.Entity.CreatedBy ??= "system";
                entry.Entity.LastModifiedBy ??= "system";
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastModified = utcNow;
                entry.Entity.LastModifiedBy ??= "system";
            }
        }
    }
}

