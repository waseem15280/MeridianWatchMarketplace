using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.CustomerOrders.Domain.Entities;

namespace MyWatchMarketplace.CustomerOrders.Infrastructure.Persistence.Configurations;

public class BuyerOfferConfiguration : IEntityTypeConfiguration<BuyerOffer>
{
    public void Configure(EntityTypeBuilder<BuyerOffer> builder)
    {
        builder.ToTable("BuyerOffers");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasMaxLength(64);

        builder.Property(o => o.BuyerId).HasMaxLength(64).IsRequired();
        builder.Property(o => o.BuyerName).HasMaxLength(100).IsRequired();
        builder.Property(o => o.SellerId).HasMaxLength(64).IsRequired();
        builder.Property(o => o.ListingId).HasMaxLength(64).IsRequired();

        builder.Property(o => o.WatchModel).HasMaxLength(150).IsRequired();
        builder.Property(o => o.WatchBrand).HasMaxLength(100).IsRequired();
        builder.Property(o => o.WatchImage).HasMaxLength(500);

        builder.Property(o => o.OfferAmount).HasPrecision(18, 2).IsRequired();
        builder.Property(o => o.OriginalListingPrice).HasPrecision(18, 2).IsRequired();
        builder.Property(o => o.CounterAmount).HasPrecision(18, 2);

        builder.Property(o => o.Message).HasMaxLength(1000);
        builder.Property(o => o.Status).HasMaxLength(50).IsRequired().HasDefaultValue("pending");

        builder.Property(o => o.CreatedBy).HasMaxLength(100);
        builder.Property(o => o.LastModifiedBy).HasMaxLength(100);

        builder.HasIndex(o => o.BuyerId);
        builder.HasIndex(o => o.SellerId);
        builder.HasIndex(o => o.ListingId);
        builder.HasIndex(o => o.Status);
    }
}

