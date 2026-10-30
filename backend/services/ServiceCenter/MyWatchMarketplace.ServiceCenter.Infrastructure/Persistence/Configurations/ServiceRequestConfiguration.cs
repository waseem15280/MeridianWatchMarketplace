using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyWatchMarketplace.ServiceCenter.Domain.Entities;

namespace MyWatchMarketplace.ServiceCenter.Infrastructure.Persistence.Configurations;

public class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
{
    public void Configure(EntityTypeBuilder<ServiceRequest> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.UserId)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(s => s.CustomerName)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(s => s.CustomerEmail)
            .HasMaxLength(128);

        builder.Property(s => s.CustomerPhone)
            .HasMaxLength(32);

        builder.Property(s => s.WatchBrand)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(s => s.WatchModel)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(s => s.MovementType)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(s => s.IssueDescription)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(s => s.CurrentState)
            .HasConversion<string>()
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(s => s.EstimatedPrice)
            .HasPrecision(18, 2);

        builder.Property(s => s.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(s => s.CourierCompany)
            .HasMaxLength(128);

        builder.Property(s => s.TrackingNumber)
            .HasMaxLength(128);

        builder.Property(s => s.ReturnCourierCompany)
            .HasMaxLength(128);

        builder.Property(s => s.ReturnTrackingNumber)
            .HasMaxLength(128);

        builder.Property(s => s.ServiceNotes)
            .HasMaxLength(4000);

        builder.HasMany(s => s.AuditLogs)
            .WithOne(a => a.ServiceRequest)
            .HasForeignKey(a => a.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.CurrentState);
    }
}

public class ServiceRequestAuditLogConfiguration : IEntityTypeConfiguration<ServiceRequestAuditLog>
{
    public void Configure(EntityTypeBuilder<ServiceRequestAuditLog> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.FromState)
            .HasConversion<string>()
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(a => a.ToState)
            .HasConversion<string>()
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(a => a.Action)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(a => a.TriggeredByUserId)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(a => a.TriggeredByName)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(a => a.TriggeredByRole)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(a => a.Notes)
            .HasMaxLength(1000);
    }
}

