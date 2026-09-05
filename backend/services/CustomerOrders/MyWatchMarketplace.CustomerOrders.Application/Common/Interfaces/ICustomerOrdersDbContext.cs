using Microsoft.EntityFrameworkCore;
using MyWatchMarketplace.CustomerOrders.Domain.Entities;

namespace MyWatchMarketplace.CustomerOrders.Application.Common.Interfaces;

public interface ICustomerOrdersDbContext
{
    DbSet<CustomerOrder> CustomerOrders { get; }

    DbSet<BuyerOffer> BuyerOffers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

