namespace ChatAPI111.Model.DTOs
{
    public class RoomDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int MessageCount { get; set; }
    }


    public class CreateRoomDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
