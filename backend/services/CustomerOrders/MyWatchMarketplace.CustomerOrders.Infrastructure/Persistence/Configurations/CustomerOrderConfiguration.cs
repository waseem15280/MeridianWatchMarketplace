using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.CustomerOrders.Domain.Entities;

namespace MyWatchMarketplace.CustomerOrders.Infrastructure.Persistence.Configurations;

public class CustomerOrderConfiguration : IEntityTypeConfiguration<CustomerOrder>
{
    public void Configure(EntityTypeBuilder<CustomerOrder> builder)
    {
        builder.ToTable("CustomerOrders");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasMaxLength(64);

        builder.Property(o => o.ListingId).HasMaxLength(64).IsRequired();
        builder.Property(o => o.BuyerId).HasMaxLength(64).IsRequired();
        builder.Property(o => o.BuyerName).HasMaxLength(100).IsRequired();
        builder.Property(o => o.SellerId).HasMaxLength(64).IsRequired();
        builder.Property(o => o.SellerName).HasMaxLength(100).IsRequired();

        builder.Property(o => o.WatchModel).HasMaxLength(150).IsRequired();
        builder.Property(o => o.WatchBrand).HasMaxLength(100).IsRequired();
        builder.Property(o => o.WatchReference).HasMaxLength(100).IsRequired();
        builder.Property(o => o.WatchImage).HasMaxLength(500);

        builder.Property(o => o.Price).HasPrecision(18, 2).IsRequired();
        builder.Property(o => o.ShippingFee).HasPrecision(18, 2).IsRequired();
        builder.Property(o => o.TotalAmount).HasPrecision(18, 2).IsRequired();

        builder.Property(o => o.ShippingAddress).HasMaxLength(500);
        builder.Property(o => o.PaymentMethod).HasMaxLength(50);
        builder.Property(o => o.PaymentStatus).HasMaxLength(50);
        builder.Property(o => o.Status).HasMaxLength(50).IsRequired().HasDefaultValue("pending");
        builder.Property(o => o.TrackingNumber).HasMaxLength(100);

        builder.Property(o => o.CreatedBy).HasMaxLength(100);
        builder.Property(o => o.LastModifiedBy).HasMaxLength(100);

        builder.HasIndex(o => o.BuyerId);
        builder.HasIndex(o => o.SellerId);
        builder.HasIndex(o => o.ListingId);
        builder.HasIndex(o => o.Status);
    }
}

