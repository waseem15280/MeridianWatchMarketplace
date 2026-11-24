using Microsoft.AspNetCore.SignalR;
using MyWatchMarketplace.SellerHub.Application.DTOs;

namespace MyWatchMarketplace.SellerHub.Api.Hubs;

public class ChatHub : Hub
{
    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task RegisterSeller(string sellerId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"seller-{sellerId}");
    }

    public async Task SendMessage(ChatMessageDto message)
    {
        // Broadcast to conversation group (buyer & seller active in this chat)
        await Clients.Group(message.ConversationId).SendAsync("ReceiveMessage", message);

        // If sent by buyer, alert seller's mobile device
        if (string.Equals(message.Sender, "buyer", StringComparison.OrdinalIgnoreCase))
        {
            var notif = new MobileNotificationDto(
                Id: "notif-" + Guid.NewGuid().ToString("N")[..8],
                ConversationId: message.ConversationId,
                ListingId: message.ListingId,
                WatchModel: message.WatchModel ?? "Luxury Watch",
                WatchBrand: message.WatchBrand ?? "THC Timepiece",
                WatchImage: message.ImageUrl ?? "",
                Price: message.Price ?? 0m,
                BuyerName: message.BuyerName,
                MessageText: message.Text,
                Timestamp: DateTimeOffset.UtcNow,
                IsRead: false
            );
            await Clients.Group($"seller-{message.SellerId}").SendAsync("NewInquiryAlert", notif);
        }
    }
}
