using System.ComponentModel.DataAnnotations;

namespace ChatAPI111.Model
{
    public class UserDetails
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string AvatarColor { get; set; } = "#6366f1";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastSeen { get; set; } = DateTime.UtcNow;
        public bool IsOnline { get; set; } = false;

        // Navigation
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
