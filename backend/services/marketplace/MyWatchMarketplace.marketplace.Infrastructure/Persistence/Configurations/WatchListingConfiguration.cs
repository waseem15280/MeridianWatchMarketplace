using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.marketplace.Domain.Entities;

namespace MyWatchMarketplace.marketplace.Infrastructure.Persistence.Configurations;

public class WatchListingConfiguration : IEntityTypeConfiguration<WatchListing>
{
    public void Configure(EntityTypeBuilder<WatchListing> builder)
    {
        builder.ToTable("WatchListings");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id)
            .HasMaxLength(64);

        builder.Property(w => w.SellerId)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(w => w.SellerName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(w => w.SellerLocation)
            .HasMaxLength(100);

        builder.Property(w => w.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(w => w.Model)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(w => w.ReferenceNumber)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(w => w.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(w => w.OriginalPrice)
            .HasPrecision(18, 2);

        builder.Property(w => w.Currency)
            .HasMaxLength(10)
            .IsRequired()
            .HasDefaultValue("USD");

        builder.Property(w => w.Condition)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(w => w.Movement)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(w => w.CaseMaterial)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(w => w.DialColor)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(w => w.BraceletMaterial)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(w => w.WaterResistance)
            .HasMaxLength(50);

        builder.Property(w => w.Caliber)
            .HasMaxLength(100);

        builder.Property(w => w.PowerReserve)
            .HasMaxLength(50);

        builder.Property(w => w.WarrantyUntil)
            .HasMaxLength(50);

        builder.Property(w => w.Images)
            .HasColumnType("text[]");

        builder.Property(w => w.Description)
            .HasMaxLength(4000);

        builder.Property(w => w.ProvenanceNotes)
            .HasMaxLength(2000);

        builder.Property(w => w.Status)
            .HasMaxLength(50)
            .IsRequired()
            .HasDefaultValue("active");

        builder.Property(w => w.FromPersonalCollectionId)
            .HasMaxLength(64);

        builder.Property(w => w.CreatedBy)
            .HasMaxLength(100);

        builder.Property(w => w.LastModifiedBy)
            .HasMaxLength(100);

        // Indexes for high-frequency queries
        builder.HasIndex(w => w.SellerId);
        builder.HasIndex(w => w.Brand);
        builder.HasIndex(w => w.Status);
        builder.HasIndex(w => w.CreatedAt);
    }
}

