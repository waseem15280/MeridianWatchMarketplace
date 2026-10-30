using System.Text.Json;
using System.Text.Json.Serialization;

namespace MyWatchMarketplace.UserManagement.Domain.Enums;

[JsonConverter(typeof(UserRoleJsonConverter))]
public enum UserRole
{
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
        if (normalized == "serviceexecutive")
        {
            role = UserRole.ServiceExecutive;
            return true;
        }
        return Enum.TryParse<UserRole>(normalized, true, out role);
    }
}
