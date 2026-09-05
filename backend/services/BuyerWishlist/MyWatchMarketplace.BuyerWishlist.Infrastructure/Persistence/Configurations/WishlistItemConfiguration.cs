using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.BuyerWishlist.Domain.Entities;

namespace MyWatchMarketplace.BuyerWishlist.Infrastructure.Persistence.Configurations;

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.ToTable("WishlistItems");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).ValueGeneratedOnAdd();

        builder.Property(w => w.BuyerId).HasMaxLength(64).IsRequired();
        builder.Property(w => w.ListingId).HasMaxLength(64).IsRequired();
        builder.Property(w => w.WatchBrand).HasMaxLength(100);
        builder.Property(w => w.WatchModel).HasMaxLength(150);
        builder.Property(w => w.PriceWhenAdded).HasPrecision(18, 2);
        builder.Property(w => w.Notes).HasMaxLength(1000);
        builder.Property(w => w.Priority).HasConversion<int>().IsRequired();

        builder.Property(w => w.CreatedBy).HasMaxLength(100);
        builder.Property(w => w.LastModifiedBy).HasMaxLength(100);

        builder.HasIndex(w => new { w.BuyerId, w.ListingId }).IsUnique();
        builder.HasIndex(w => w.ListingId);
    }
}

