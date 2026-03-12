using ChatAPI111.Data;
using ChatAPI111.Model.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatAPI111.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {


        private readonly AppDbContext _db;
        public MessagesController(AppDbContext db) => _db = db;

        // GET /api/messages/room/1?page=1&size=50
        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetRoomMessages(int roomId, int page = 1, int size = 50)
        {
            var messages = await _db.Messages
                .Where(m => m.RoomId == roomId)
                .Include(m => m.Sender)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * size)
                .Take(size)
                .Select(m => new MessageDTO
                {
                    Id = m.Id,
                    Content = m.Content,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.Username,
                    AvatarColor = m.Sender.AvatarColor,
                    RoomId = m.RoomId,
                    SentAt = m.SentAt,
                    IsEdited = m.IsEdited
                })
                .ToListAsync();

            // Return in chronological order
            messages.Reverse();
            return Ok(messages);
        }
    }
}
