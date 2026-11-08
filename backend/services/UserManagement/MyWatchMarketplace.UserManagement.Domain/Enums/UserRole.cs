using System.Text.Json;
using System.Text.Json.Serialization;

namespace MyWatchMarketplace.UserManagement.Domain.Enums;

[JsonConverter(typeof(UserRoleJsonConverter))]
public enum UserRole
{
    Guest,
    Buyer,
    Seller,
    Collector,
    Admin,
    ServiceExecutive
}

public class UserRoleJsonConverter : JsonConverter<UserRole>
{
    public override UserRole Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (TryParseRole(str, out var role))
            {
                return role;
            }
        }
        else if (reader.TokenType == JsonTokenType.Number)
        {
            var intVal = reader.GetInt32();
            if (Enum.IsDefined(typeof(UserRole), intVal))
            {
                return (UserRole)intVal;
            }
        }

        return UserRole.Buyer;
    }

    public override void Write(Utf8JsonWriter writer, UserRole value, JsonSerializerOptions options)
    {
        var roleName = value switch
        {
            UserRole.ServiceExecutive => "service_executive",
            _ => value.ToString().ToLowerInvariant()
        };
        writer.WriteStringValue(roleName);
    }

    public static bool TryParseRole(string? str, out UserRole role)
    {
        role = UserRole.Buyer;
        if (string.IsNullOrWhiteSpace(str)) return false;
        var normalized = str.Trim().Replace("_", "").Replace("-", "").ToLowerInvariant();
        if (normalized == "guest")
        {
            role = UserRole.Guest;
            return true;
        }
        if (normalized == "serviceexecutive")
        {
            role = UserRole.ServiceExecutive;
            return true;
        }
        return Enum.TryParse<UserRole>(normalized, true, out role);
    }
}

public static class RolePermissionHelper
{
    public static List<string> GetPermissions(UserRole role) => role switch
    {
        UserRole.Guest => new List<string> { "marketplace_access" },
        UserRole.Buyer => new List<string> { "marketplace_access", "wishlist_access", "orders_access", "offers_access" },
        UserRole.Collector => new List<string> { "marketplace_access", "wishlist_access", "orders_access", "offers_access", "my_vault_access", "service_center_access" },
        UserRole.Seller => new List<string> { "marketplace_access", "orders_access", "offers_access", "service_center_access", "seller_hub_access" },
        UserRole.Admin => new List<string>
        {
            "marketplace_access", "wishlist_access", "orders_access", "offers_access", "my_vault_access",
            "seller_hub_access", "service_center_access", "manage_service_center", "manage_users",
            "manage_orders", "manage_vault", "manage_seller_hub", "manage_roles"
        },
        UserRole.ServiceExecutive => new List<string> { "manage_service_center" },
        _ => new List<string>()
    };
}
