namespace ChatAPI111.Model
{
    public class Message
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int SenderId { get; set; }
        public int RoomId { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsEdited { get; set; } = false;

        // Navigation
        public UserDetails Sender { get; set; } = null!;
        public Room Room { get; set; } = null!;
    }
}
