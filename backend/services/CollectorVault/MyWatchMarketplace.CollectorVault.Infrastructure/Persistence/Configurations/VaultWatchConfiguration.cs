using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.CollectorVault.Domain.Entities;

namespace MyWatchMarketplace.CollectorVault.Infrastructure.Persistence.Configurations;

public class VaultWatchConfiguration : IEntityTypeConfiguration<VaultWatch>
{
    public void Configure(EntityTypeBuilder<VaultWatch> builder)
    {
        builder.ToTable("VaultWatches");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasMaxLength(64);

        builder.Property(w => w.UserId).HasMaxLength(64).IsRequired();
        builder.Property(w => w.Brand).HasMaxLength(100).IsRequired();
        builder.Property(w => w.Model).HasMaxLength(150).IsRequired();
        builder.Property(w => w.ReferenceNumber).HasMaxLength(100).IsRequired();
        builder.Property(w => w.SerialNumber).HasMaxLength(100);
        builder.Property(w => w.CaseMaterial).HasMaxLength(100).IsRequired();
        builder.Property(w => w.Movement).HasMaxLength(50).IsRequired();
        builder.Property(w => w.DialColor).HasMaxLength(50).IsRequired();
        builder.Property(w => w.Condition).HasMaxLength(50).IsRequired();
        builder.Property(w => w.PurchasePrice).HasPrecision(18, 2);
        builder.Property(w => w.PurchaseDate).HasMaxLength(50);
        builder.Property(w => w.EstimatedMarketValue).HasPrecision(18, 2).IsRequired();
        builder.Property(w => w.Images).HasColumnType("text[]");
        builder.Property(w => w.Notes).HasMaxLength(2000);
        builder.Property(w => w.ListingId).HasMaxLength(64);

        builder.Property(w => w.CreatedBy).HasMaxLength(100);
        builder.Property(w => w.LastModifiedBy).HasMaxLength(100);

        builder.HasIndex(w => w.UserId);
        builder.HasIndex(w => w.Brand);
    }
}

