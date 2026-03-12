namespace ChatAPI111.Model.DTOs
{
    public class MessageDTO
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string AvatarColor { get; set; } = string.Empty;
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsEdited { get; set; }

    }

    public class SendMessageDTO
    {
        public string Content { get; set; } = string.Empty;
        public int RoomId { get; set; }
    }
}
