using ChatAPI111.Model;
using Microsoft.EntityFrameworkCore;

namespace ChatAPI111.Data
{
    public class AppDbContext:DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<UserDetails> UsersData => Set<UserDetails>();
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<Message> Messages => Set<Message>();



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User
            modelBuilder.Entity<UserDetails>(e => {
                e.HasIndex(u => u.Username).IsUnique();
                e.HasIndex(u => u.Email).IsUnique();
            });

            // Message relationships
            modelBuilder.Entity<Message>(e => {
                e.HasOne(m => m.Sender)
                 .WithMany(u => u.Messages)
                 .HasForeignKey(m => m.SenderId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(m => m.Room)
                 .WithMany(r => r.Messages)
                 .HasForeignKey(m => m.RoomId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed Rooms
            modelBuilder.Entity<Room>().HasData(
                new Room { Id = 1, Name = "General", Description = "General chat for everyone" },
                new Room { Id = 2, Name = "Technology", Description = "Tech discussions" },
                new Room { Id = 3, Name = "Random", Description = "Random conversations" }
            );
        }

    }
}
