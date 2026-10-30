using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyWatchMarketplace.ServiceCenter.Domain.Entities;
using MyWatchMarketplace.ServiceCenter.Domain.Enums;

namespace MyWatchMarketplace.ServiceCenter.Infrastructure.Persistence;

public class ServiceCenterDbContextInitialiser
{
    private readonly ILogger<ServiceCenterDbContextInitialiser> _logger;
    private readonly ServiceCenterDbContext _context;

    public ServiceCenterDbContextInitialiser(
        ILogger<ServiceCenterDbContextInitialiser> logger,
        ServiceCenterDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            if (_context.Database.IsNpgsql())
            {
                await _context.Database.EnsureCreatedAsync();
            }

            await SeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the ServiceCenter database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        if (await _context.ServiceRequests.AnyAsync())
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;

        var seedRequests = new List<ServiceRequest>
        {
            // 1. ServiceRequestCreated (Submitted by Alexander - User 1)
            new()
            {
                UserId = "1",
                CustomerName = "Alexander Vance",
                CustomerEmail = "alexander.vance@horology.com",
                CustomerPhone = "+1 212 555 0199",
                WatchBrand = "Patek Philippe",
                WatchModel = "Calatrava 5196G White Gold",
                MovementType = "Manual Winding",
                IsWorking = false,
                GlassChangeRequired = true,
                IssueDescription = "Watch stopped ticking after minor impact. Front sapphire crystal has hairline fracture near 2 o'clock.",
                CurrentState = ServiceWorkflowState.ServiceRequestCreated,
                CreatedAt = now.AddDays(-2),
                UpdatedAt = now.AddDays(-2),
                AuditLogs = new List<ServiceRequestAuditLog>
                {
                    new()
                    {
                        FromState = ServiceWorkflowState.ServiceRequestCreated,
                        ToState = ServiceWorkflowState.ServiceRequestCreated,
                        Action = "Service Request Created",
                        TriggeredByUserId = "1",
                        TriggeredByName = "Alexander Vance",
                        TriggeredByRole = "buyer",
                        Notes = "Initial request submitted with sapphire glass replacement inquiry.",
                        Timestamp = now.AddDays(-2)
                    }
                }
            },

            // 2. ServiceRequestAccepted (Submitted by Julian - User 2)
            new()
            {
                UserId = "2",
                CustomerName = "Julian Sterling",
                CustomerEmail = "j.sterling@collector.io",
                CustomerPhone = "+44 20 7946 0912",
                WatchBrand = "Audemars Piguet",
                WatchModel = "Royal Oak 'Jumbo' Extra-Thin 15202ST",
                MovementType = "Automatic",
                IsWorking = true,
                GlassChangeRequired = false,
                IssueDescription = "Movement running fast (+28s/day). Needs complete ultrasonic cleaning, gasket refresh, and regulation.",
                CurrentState = ServiceWorkflowState.ServiceRequestAccepted,
                EstimatedPrice = 45000,
                ServiceNotes = "Standard Calibre 2121 complete overhaul and demagnetization required.",
                CreatedAt = now.AddDays(-4),
                UpdatedAt = now.AddDays(-3),
                AuditLogs = new List<ServiceRequestAuditLog>
                {
                    new()
                    {
                        FromState = ServiceWorkflowState.ServiceRequestCreated,
                        ToState = ServiceWorkflowState.ServiceRequestCreated,
                        Action = "Service Request Created",
                        TriggeredByUserId = "2",
                        TriggeredByName = "Julian Sterling",
                        TriggeredByRole = "collector",
                        Timestamp = now.AddDays(-4)
                    },
                    new()
                    {
                        FromState = ServiceWorkflowState.ServiceRequestCreated,
                        ToState = ServiceWorkflowState.ServiceRequestAccepted,
                        Action = "Accept Request",
                        TriggeredByUserId = "11",
                        TriggeredByName = "Jean-Marc Piguet (Service Lead)",
                        TriggeredByRole = "service_executive",
                        Notes = "Approved diagnostic inspection. Estimated cost quoted at ₹45,000.",
                        Timestamp = now.AddDays(-3)
                    }
                }
            },

            // 3. InTransit (Submitted by Alexander - User 1)
            new()
            {
                UserId = "1",
                CustomerName = "Alexander Vance",
                CustomerEmail = "alexander.vance@horology.com",
                CustomerPhone = "+1 212 555 0199",
                WatchBrand = "Rolex",
                WatchModel = "Submariner Date 126610LN",
                MovementType = "Automatic",
                IsWorking = true,
                GlassChangeRequired = false,
                IssueDescription = "Periodic bezel stiffness and periodic amplitude drop on Calibre 3235.",
                CurrentState = ServiceWorkflowState.InTransit,
                EstimatedPrice = 32000,
                CourierCompany = "Blue Dart Express",
                TrackingNumber = "BD-882910394IN",
                ServiceNotes = "Customer dispatched via insured express parcel.",
                CreatedAt = now.AddDays(-6),
                UpdatedAt = now.AddDays(-1),
                AuditLogs = new List<ServiceRequestAuditLog>
                {
                    new()
                    {
                        FromState = ServiceWorkflowState.ServiceRequestCreated,
                        ToState = ServiceWorkflowState.ServiceRequestAccepted,
                        Action = "Accept Request",
                        TriggeredByUserId = "11",
                        TriggeredByName = "Jean-Marc Piguet (Service Lead)",
                        TriggeredByRole = "service_executive",
                        Notes = "Overhaul and click-spring replacement approved at ₹32,000.",
                        Timestamp = now.AddDays(-4)
                    },
                    new()
                    {
                        FromState = ServiceWorkflowState.ServiceRequestAccepted,
                        ToState = ServiceWorkflowState.InTransit,
                        Action = "Dispatch Watch",
                        TriggeredByUserId = "1",
                        TriggeredByName = "Alexander Vance",
                        TriggeredByRole = "buyer",
                        Notes = "Shipped via Blue Dart Express, tracking #BD-882910394IN",
                        Timestamp = now.AddDays(-1)
                    }
                }
            },

            // 4. UnderRepair (Submitted by Geneva Horology - User 4)
            new()
            {
                UserId = "4",
                CustomerName = "Geneva Horology Gallery",
                CustomerEmail = "contact@genevahorology.ch",
                CustomerPhone = "+41 22 731 0022",
                WatchBrand = "Omega",
                WatchModel = "Speedmaster Professional 'Moonwatch' Sapphire",
                MovementType = "Manual Winding",
                IsWorking = false,
                GlassChangeRequired = false,
                IssueDescription = "Chronograph reset pusher unresponsive; Calibre 1861 balance assembly replacement required.",
                CurrentState = ServiceWorkflowState.UnderRepair,
                EstimatedPrice = 38500,
                CourierCompany = "DHL International",
                TrackingNumber = "DHL-554499118",
                ServiceNotes = "Disassembly complete. Escapement cleaned; waiting on authentic Omega 1861 reset hammer.",
                CreatedAt = now.AddDays(-9),
                UpdatedAt = now.AddDays(-2),
                AuditLogs = new List<ServiceRequestAuditLog>
                {
                    new()
                    {
                        FromState = ServiceWorkflowState.InTransit,
                        ToState = ServiceWorkflowState.UnderRepair,
                        Action = "Begin Repair",
                        TriggeredByUserId = "11",
                        TriggeredByName = "Jean-Marc Piguet (Service Lead)",
                        TriggeredByRole = "service_executive",
                        Notes = "Package received in good order. Transferred to master watchmaker bench #3.",
                        Timestamp = now.AddDays(-2)
                    }
                }
            },

            // 5. InTesting (Submitted by Alexander - User 1)
            new()
            {
                UserId = "1",
                CustomerName = "Alexander Vance",
                CustomerEmail = "alexander.vance@horology.com",
                CustomerPhone = "+1 212 555 0199",
                WatchBrand = "Cartier",
                WatchModel = "Santos de Cartier Medium Steel",
                MovementType = "Automatic",
                IsWorking = true,
                GlassChangeRequired = true,
                IssueDescription = "Glass scratched, routine 5-year overhaul of Calibre 1847 MC.",
                CurrentState = ServiceWorkflowState.InTesting,
                EstimatedPrice = 28000,
                CourierCompany = "FedEx Express",
                TrackingNumber = "FDX-771122334",
                ServiceNotes = "Sapphire crystal replaced with genuine Cartier optic. Calibre 1847 MC re-lubricated. Currently in 5-position chronometer timing machine.",
                CreatedAt = now.AddDays(-14),
                UpdatedAt = now.AddHours(-12),
                AuditLogs = new List<ServiceRequestAuditLog>
                {
                    new()
                    {
                        FromState = ServiceWorkflowState.UnderRepair,
                        ToState = ServiceWorkflowState.InTesting,
                        Action = "Move to Testing",
                        TriggeredByUserId = "11",
                        TriggeredByName = "Jean-Marc Piguet (Service Lead)",
                        TriggeredByRole = "service_executive",
                        Notes = "Reassembly passed. 48-hour power reserve and 100m ISO 22810 pressure test initiated.",
                        Timestamp = now.AddHours(-12)
                    }
                }
            },

            // 6. TransitBack (Submitted by Julian - User 2)
            new()
            {
                UserId = "2",
                CustomerName = "Julian Sterling",
                CustomerEmail = "j.sterling@collector.io",
                CustomerPhone = "+44 20 7946 0912",
                WatchBrand = "Vacheron Constantin",
                WatchModel = "Overseas Chronograph Blue Dial",
                MovementType = "Automatic",
                IsWorking = true,
                GlassChangeRequired = false,
                IssueDescription = "Comprehensive factory service, column-wheel chronograph calibration, case satin refinishing.",
                CurrentState = ServiceWorkflowState.TransitBack,
                EstimatedPrice = 62000,
                CourierCompany = "Blue Dart Express",
                TrackingNumber = "BD-11223344IN",
                ReturnCourierCompany = "Blue Dart Secure Armored",
                ReturnTrackingNumber = "BD-RET-99002211IN",
                ServiceNotes = "All Geneva seal performance requirements exceeded (+1.8s/day average). Dispatched in protective THC service pod.",
                CreatedAt = now.AddDays(-20),
                UpdatedAt = now.AddHours(-4),
                AuditLogs = new List<ServiceRequestAuditLog>
                {
                    new()
                    {
                        FromState = ServiceWorkflowState.InTesting,
                        ToState = ServiceWorkflowState.TransitBack,
                        Action = "Dispatch Return",
                        TriggeredByUserId = "11",
                        TriggeredByName = "Jean-Marc Piguet (Service Lead)",
                        TriggeredByRole = "service_executive",
                        Notes = "Testing passed with honors. Dispatched back to customer via Blue Dart Secure.",
                        Timestamp = now.AddHours(-4)
                    }
                }
            }
        };

        _context.ServiceRequests.AddRange(seedRequests);
        await _context.SaveChangesAsync();

        _logger.LogInformation("ServiceCenter database successfully seeded with initial workflow records.");
    }
}

