using System.Text.Json.Serialization;

namespace MyWatchMarketplace.UserManagement.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserRole
{
    Buyer,
    Seller,
    Collector,
    Admin
}
