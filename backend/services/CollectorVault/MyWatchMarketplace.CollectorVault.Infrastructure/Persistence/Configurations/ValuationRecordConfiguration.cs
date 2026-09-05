using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.CollectorVault.Domain.Entities;

namespace MyWatchMarketplace.CollectorVault.Infrastructure.Persistence.Configurations;

public class ValuationRecordConfiguration : IEntityTypeConfiguration<ValuationRecord>
{
    public void Configure(EntityTypeBuilder<ValuationRecord> builder)
    {
        builder.ToTable("ValuationRecords");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).ValueGeneratedOnAdd();

        builder.Property(v => v.VaultWatchId).HasMaxLength(64).IsRequired();
        builder.Property(v => v.EstimatedValue).HasPrecision(18, 2).IsRequired();
        builder.Property(v => v.Source).HasMaxLength(100).IsRequired();

        builder.Property(v => v.CreatedBy).HasMaxLength(100);
        builder.Property(v => v.LastModifiedBy).HasMaxLength(100);

        builder.HasIndex(v => v.VaultWatchId);
    }
}

