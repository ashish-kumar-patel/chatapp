using ChatAPI111.Data;
using ChatAPI111.Model;
using ChatAPI111.Model.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatAPI111.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {


        private readonly AppDbContext _db;
        public RoomsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetRooms()
        {
            var rooms = await _db.Rooms
                .Select(r => new RoomDTO
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    MessageCount = r.Messages.Count
                })
                .ToListAsync();

            return Ok(rooms);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoom(CreateRoomDTO dto)
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null) return Unauthorized();

            if (await _db.Rooms.AnyAsync(r => r.Name == dto.Name))
                return BadRequest(new { message = "Room name already exists." });

            var room = new Room
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedBy = int.Parse(userIdClaim)
            };

            _db.Rooms.Add(room);
            await _db.SaveChangesAsync();

            return Ok(new RoomDTO { Id = room.Id, Name = room.Name, Description = room.Description });
        }
    }
}
