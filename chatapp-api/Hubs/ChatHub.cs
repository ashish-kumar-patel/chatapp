using ChatAPI111.Data;
using ChatAPI111.Model;
using ChatAPI111.Model.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatAPI111.Hubs
{
    [Authorize]
    public class ChatHub:Hub
    {
        private readonly AppDbContext _db;
        // Static dictionary to track connectionId → userId mapping
        private static readonly Dictionary<string, int> _connections = new();
        private static readonly Dictionary<string, string> _userRooms = new();

        public ChatHub(AppDbContext db)
        {
            _db = db;
        }

        // Called automatically when client connects
        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            if (userId == 0) return;

            _connections[Context.ConnectionId] = userId;

            // Mark user as online in DB
            var user = await _db.UsersData.FindAsync(userId);
            if (user != null)
            {
                user.IsOnline = true;
                user.LastSeen = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            // Notify all clients that this user is online
            await Clients.All.SendAsync("UserOnline", new
            {
                UserId = userId,
                Username = user?.Username
            });

            await base.OnConnectedAsync();
        }

        // Called automatically when client disconnects
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();
            _connections.Remove(Context.ConnectionId);

            // Check if user has other active connections
            bool hasOtherConnections = _connections.Values.Contains(userId);

            if (!hasOtherConnections)
            {
                var user = await _db.UsersData.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = false;
                    user.LastSeen = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                await Clients.All.SendAsync("UserOffline", new
                {
                    UserId = userId,
                    Username = user?.Username
                });
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Join a chat room (SignalR Group)
        public async Task JoinRoom(int roomId)
        {
            var roomName = $"room_{roomId}";

            // Leave previous room if any
            if (_userRooms.TryGetValue(Context.ConnectionId, out var prevRoom))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, prevRoom);
                await Clients.Group(prevRoom).SendAsync("UserLeftRoom", new
                {
                    UserId = GetUserId(),
                    RoomId = roomId
                });
            }

            // Join new room
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            _userRooms[Context.ConnectionId] = roomName;

            // Notify room members
            await Clients.Group(roomName).SendAsync("UserJoinedRoom", new
            {
                UserId = GetUserId(),
                RoomId = roomId
            });
        }

        // Leave a room
        public async Task LeaveRoom(int roomId)
        {
            var roomName = $"room_{roomId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            _userRooms.Remove(Context.ConnectionId);
        }

        // Send message to room
        public async Task SendMessage(SendMessageDTO dto)
        {
            var userId = GetUserId();
            if (userId == 0) return;

            var user = await _db.UsersData.FindAsync(userId);
            if (user == null) return;

            // Save to database
            var message = new Message
            {
                Content = dto.Content,
                SenderId = userId,
                RoomId = dto.RoomId,
                SentAt = DateTime.UtcNow
            };

            _db.Messages.Add(message);
            await _db.SaveChangesAsync();

            // Build response DTO
            var messageDto = new MessageDTO
            {
                Id = message.Id,
                Content = message.Content,
                SenderId = userId,
                SenderName = user.Username,
                AvatarColor = user.AvatarColor,
                RoomId = dto.RoomId,
                SentAt = message.SentAt,
                IsEdited = false
            };

            // Broadcast to all users in the room
            var roomName = $"room_{dto.RoomId}";
            await Clients.Group(roomName).SendAsync("ReceiveMessage", messageDto);
        }

        // Typing indicator
        public async Task Typing(int roomId, bool isTyping)
        {
            var userId = GetUserId();
            var user = await _db.UsersData.FindAsync(userId);
            if (user == null) return;

            var roomName = $"room_{roomId}";
            // Send to all OTHERS in the room (not the sender)
            await Clients.OthersInGroup(roomName).SendAsync("UserTyping", new
            {
                UserId = userId,
                Username = user.Username,
                IsTyping = isTyping,
                RoomId = roomId
            });
        }

        // Get online users
        public async Task GetOnlineUsers()
        {
            var onlineUserIds = _connections.Values.Distinct().ToList();
            var users = await _db.UsersData
                .Where(u => onlineUserIds.Contains(u.Id))
                .Select(u => new { u.Id, u.Username, u.AvatarColor })
                .ToListAsync();

            await Clients.Caller.SendAsync("OnlineUsers", users);
        }

        // Helper to extract userId from JWT claims
        private int GetUserId()
        {
            var claim = Context.User?.FindFirst("userId");
            return claim != null ? int.Parse(claim.Value) : 0;
        }


    }
}
