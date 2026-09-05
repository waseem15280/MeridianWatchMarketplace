using System.Reflection;
using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.BuyerWishlist.Application.Common.Interfaces;
using MyWatchMarketplace.BuyerWishlist.Domain.Entities;

namespace MyWatchMarketplace.BuyerWishlist.Infrastructure.Persistence;

public class BuyerWishlistDbContext : DbContext, IBuyerWishlistDbContext
{
    public BuyerWishlistDbContext(DbContextOptions<BuyerWishlistDbContext> options)
        : base(options)
    {
    }

    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

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

