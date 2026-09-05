using System.Reflection;
using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.SharedKernel.Common;
using MyWatchMarketplace.SellerHub.Application.Common.Interfaces;
using MyWatchMarketplace.SellerHub.Domain.Entities;

namespace MyWatchMarketplace.SellerHub.Infrastructure.Persistence;

public class SellerHubDbContext : DbContext, ISellerHubDbContext
{
    public SellerHubDbContext(DbContextOptions<SellerHubDbContext> options)
        : base(options)
    {
    }

    public DbSet<SellerProfile> SellerProfiles => Set<SellerProfile>();

    public DbSet<SellerReview> SellerReviews => Set<SellerReview>();

    public DbSet<SellerOfferNegotiation> SellerOffers => Set<SellerOfferNegotiation>();

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

