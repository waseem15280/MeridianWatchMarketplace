using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.UserManagement.Application.Common.Interfaces;
using MyWatchMarketplace.UserManagement.Domain.Entities;

namespace MyWatchMarketplace.UserManagement.Infrastructure.Persistence;

public class UserManagementDbContext : DbContext, IUserManagementDbContext
{
    public UserManagementDbContext(DbContextOptions<UserManagementDbContext> options)
        : base(options)
    {
    }

    public DbSet<UserLogin> Logins => Set<UserLogin>();

    public DbSet<UserAccount> Accounts => Set<UserAccount>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserLogin>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();

            entity.HasMany(e => e.Accounts)
                  .WithOne(e => e.UserLogin)
                  .HasForeignKey(e => e.UserLoginId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Role)
                  .HasConversion<string>()
                  .HasMaxLength(50);

            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Email).HasMaxLength(200);
        });
    }
}
