using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.SellerHub.Domain.Entities;

namespace MyWatchMarketplace.SellerHub.Infrastructure.Persistence.Configurations;

public class SellerReviewConfiguration : IEntityTypeConfiguration<SellerReview>
{
    public void Configure(EntityTypeBuilder<SellerReview> builder)
    {
        builder.ToTable("SellerReviews");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasMaxLength(64);

        builder.Property(r => r.SellerId).HasMaxLength(64).IsRequired();
        builder.Property(r => r.BuyerId).HasMaxLength(64).IsRequired();
        builder.Property(r => r.BuyerName).HasMaxLength(100).IsRequired();
        builder.Property(r => r.BuyerAvatar).HasMaxLength(500);
        builder.Property(r => r.Rating).IsRequired();
        builder.Property(r => r.Comment).HasMaxLength(2000).IsRequired();
        builder.Property(r => r.WatchModel).HasMaxLength(150).IsRequired();
        builder.Property(r => r.WatchReference).HasMaxLength(100);
        builder.Property(r => r.Date).HasMaxLength(50);
        builder.Property(r => r.SellerReply).HasMaxLength(1000);

        builder.Property(r => r.CreatedBy).HasMaxLength(100);
        builder.Property(r => r.LastModifiedBy).HasMaxLength(100);

        builder.OwnsOne(r => r.SubRatings, sub =>
        {
            sub.Property(s => s.Accuracy).HasColumnName("SubRatings_Accuracy");
            sub.Property(s => s.Communication).HasColumnName("SubRatings_Communication");
            sub.Property(s => s.Shipping).HasColumnName("SubRatings_Shipping");
            sub.Property(s => s.Authenticity).HasColumnName("SubRatings_Authenticity");
        });

        builder.HasIndex(r => r.SellerId);
        builder.HasIndex(r => r.BuyerId);
    }
}

