using System.Collections.Concurrent;
using MyWatchMarketplace.SellerHub.Application.DTOs;

namespace MyWatchMarketplace.SellerHub.Api.Services;

public static class ChatStore
{
    private static readonly ConcurrentBag<ChatMessageDto> _messages = new();
    private static readonly ConcurrentDictionary<string, MobileNotificationDto> _notifications = new();
    private static readonly ConcurrentDictionary<string, bool> _readMessageIds = new();
    private static readonly ConcurrentDictionary<string, bool> _deletedMessageIds = new();

    public static void AddMessage(ChatMessageDto message)
    {
        _messages.Add(message);

        if (string.Equals(message.Sender, "buyer", StringComparison.OrdinalIgnoreCase))
        {
            var notif = new MobileNotificationDto(
                Id: "notif-" + Guid.NewGuid().ToString("N")[..8],
                ConversationId: message.ConversationId,
                ListingId: message.ListingId,
                WatchModel: message.WatchModel ?? "Luxury Watch",
                WatchBrand: message.WatchBrand ?? "THC",
                WatchImage: message.ImageUrl ?? "",
                Price: message.Price ?? 0m,
                BuyerName: message.BuyerName,
                MessageText: message.Text,
                Timestamp: DateTimeOffset.UtcNow,
                IsRead: false
            );
            _notifications.TryAdd(notif.Id, notif);
        }
    }

    public static List<ChatMessageDto> GetMessages(string? conversationId, string? listingId, string? buyerId)
    {
        var query = _messages.Where(m => !_deletedMessageIds.ContainsKey(m.Id));

        if (!string.IsNullOrWhiteSpace(conversationId))
        {
            query = query.Where(m => m.ConversationId == conversationId);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(listingId))
                query = query.Where(m => m.ListingId == listingId);
            if (!string.IsNullOrWhiteSpace(buyerId))
                query = query.Where(m => m.BuyerId == buyerId);
        }

        return query.OrderBy(m => m.CreatedAt).ToList();
    }

    public static List<ChatConversationDto> GetConversationsForSeller(string sellerId)
    {
        var sellerMessages = _messages
            .Where(m => m.SellerId == sellerId && !_deletedMessageIds.ContainsKey(m.Id))
            .ToList();
        var groups = sellerMessages.GroupBy(m => m.ConversationId);

        var list = new List<ChatConversationDto>();
        foreach (var g in groups)
        {
            var latest = g.OrderByDescending(m => m.CreatedAt).First();
            var unreadSeller = g.Count(m => m.Sender == "buyer" && !m.IsRead && !_readMessageIds.ContainsKey(m.Id));
            var unreadBuyer = g.Count(m => m.Sender == "seller" && !m.IsRead && !_readMessageIds.ContainsKey(m.Id));

            list.Add(new ChatConversationDto(
                Id: g.Key,
                ListingId: latest.ListingId,
                WatchModel: latest.WatchModel ?? "Luxury Watch",
                WatchBrand: latest.WatchBrand ?? "Timepiece",
                WatchImage: latest.ImageUrl ?? "",
                Price: latest.Price ?? 0m,
                BuyerId: latest.BuyerId,
                BuyerName: latest.BuyerName,
                SellerId: latest.SellerId,
                SellerName: latest.SellerName,
                LastMessage: latest.Text,
                LastMessageAt: latest.CreatedAt,
                UnreadCountSeller: unreadSeller,
                UnreadCountBuyer: unreadBuyer
            ));
        }

        return list.OrderByDescending(c => c.LastMessageAt).ToList();
    }

    public static List<MobileNotificationDto> GetNotificationsForSeller(string sellerId)
    {
        // Find all notifications corresponding to conversations owned by this seller
        var sellerConvIds = _messages.Where(m => m.SellerId == sellerId).Select(m => m.ConversationId).ToHashSet();
        return _notifications.Values
            .Where(n => sellerConvIds.Contains(n.ConversationId))
            .OrderByDescending(n => n.Timestamp)
            .ToList();
    }

    public static void MarkNotificationRead(string notificationId)
    {
        if (_notifications.TryGetValue(notificationId, out var notif))
        {
            _notifications[notificationId] = notif with { IsRead = true };
        }
    }

    public static void MarkConversationRead(string conversationId, string? reader = "seller")
    {
        var targetSender = string.Equals(reader, "buyer", StringComparison.OrdinalIgnoreCase)
            ? "seller"
            : "buyer";

        foreach (var msg in _messages.Where(m => m.ConversationId == conversationId && m.Sender == targetSender))
        {
            _readMessageIds[msg.Id] = true;
        }
    }

    public static void SyncMessages(IEnumerable<ChatMessageDto> messages)
    {
        var existingIds = _messages.Select(m => m.Id).ToHashSet();
        foreach (var msg in messages)
        {
            if (existingIds.Add(msg.Id))
            {
                _messages.Add(msg);
            }
        }
    }

    public static void DeleteConversations(IEnumerable<string> conversationIds)
    {
        var idSet = conversationIds.ToHashSet();
        foreach (var msg in _messages.Where(m => idSet.Contains(m.ConversationId)))
        {
            _deletedMessageIds[msg.Id] = true;
        }
        foreach (var kvp in _notifications.Where(n => idSet.Contains(n.Value.ConversationId)).ToList())
        {
            _notifications.TryRemove(kvp.Key, out _);
        }
    }
}
