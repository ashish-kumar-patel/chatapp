using ChatAPI111.Data;
using ChatAPI111.Model;
using ChatAPI111.Model.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChatAPI111.Services
{
    public class AuthService
    {

        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        // Random avatar colors for new users
        private static readonly string[] AvatarColors = {
        "#ef4444", "#f97316", "#eab308", "#22c55e",
        "#06b6d4", "#6366f1", "#a855f7", "#ec4899"
    };

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<AuthResponseDTO?> RegisterAsync(RegisterDTO dto)
        {
            // Check if user exists
            if (await _db.UsersData.AnyAsync(u => u.Email == dto.Email || u.Username == dto.Username))
                return null;

            var rnd = new Random();
            var user = new UserDetails
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                AvatarColor = AvatarColors[rnd.Next(AvatarColors.Length)]
            };

            _db.UsersData.Add(user);
            await _db.SaveChangesAsync();

            return BuildAuthResponse(user);
        }

        public async Task<AuthResponseDTO?> LoginAsync(LoginDTO dto)
        {
            var user = await _db.UsersData.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;

            return BuildAuthResponse(user);
        }

        private AuthResponseDTO BuildAuthResponse(UserDetails user)
        {
            var token = GenerateJwt(user);
            return new AuthResponseDTO
            {
                Token = token,
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                AvatarColor = user.AvatarColor
            };
        }

        private string GenerateJwt(UserDetails user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim("userId", user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email)
        };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
