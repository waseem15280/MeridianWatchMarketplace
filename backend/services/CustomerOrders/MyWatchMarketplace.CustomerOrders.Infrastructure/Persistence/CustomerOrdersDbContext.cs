using System.Reflection;
using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.CustomerOrders.Application.Common.Interfaces;
using MyWatchMarketplace.CustomerOrders.Domain.Entities;

namespace MyWatchMarketplace.CustomerOrders.Infrastructure.Persistence;

public class CustomerOrdersDbContext : DbContext, ICustomerOrdersDbContext
{
    public CustomerOrdersDbContext(DbContextOptions<CustomerOrdersDbContext> options)
        : base(options)
    {
    }

    public DbSet<CustomerOrder> CustomerOrders => Set<CustomerOrder>();

    public DbSet<BuyerOffer> BuyerOffers => Set<BuyerOffer>();

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

