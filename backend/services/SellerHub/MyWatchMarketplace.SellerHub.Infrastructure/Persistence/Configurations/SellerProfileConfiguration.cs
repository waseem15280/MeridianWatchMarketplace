using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.SellerHub.Domain.Entities;

namespace MyWatchMarketplace.SellerHub.Infrastructure.Persistence.Configurations;

public class SellerProfileConfiguration : IEntityTypeConfiguration<SellerProfile>
{
    public void Configure(EntityTypeBuilder<SellerProfile> builder)
    {
        builder.ToTable("SellerProfiles");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(64);

        builder.Property(s => s.Name).HasMaxLength(100).IsRequired();
        builder.Property(s => s.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(s => s.Email).IsUnique();

        builder.Property(s => s.Avatar).HasMaxLength(500);
        builder.Property(s => s.Location).HasMaxLength(100);
        builder.Property(s => s.MemberSince).HasMaxLength(50);
        builder.Property(s => s.Bio).HasMaxLength(1000);
        builder.Property(s => s.Rating).HasPrecision(3, 2);
        builder.Property(s => s.ResponseRate).HasMaxLength(20);
        builder.Property(s => s.AvgShipTime).HasMaxLength(50);
        builder.Property(s => s.Phone).HasMaxLength(30);

        builder.Property(s => s.CreatedBy).HasMaxLength(100);
        builder.Property(s => s.LastModifiedBy).HasMaxLength(100);
    }
}

