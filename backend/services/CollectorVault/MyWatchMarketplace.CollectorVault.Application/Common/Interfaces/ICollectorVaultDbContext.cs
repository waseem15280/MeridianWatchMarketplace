using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.CollectorVault.Domain.Entities;

namespace MyWatchMarketplace.CollectorVault.Application.Common.Interfaces;

public interface ICollectorVaultDbContext
{
    DbSet<VaultWatch> VaultWatches { get; }

    DbSet<ValuationRecord> ValuationRecords { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

