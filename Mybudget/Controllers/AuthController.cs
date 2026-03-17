using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mybudget.Data;
using Mybudget.Dtos;
using MyBudget.Models;
using System.Security.Claims;
namespace Mybudget.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MybudgetContext _context;
        private readonly PasswordHasher<Utilisateur>  _hash;
        
        public AuthController(MybudgetContext context)
        {
            _context = context;
            _hash = new PasswordHasher<Utilisateur>();
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.MotDePasse))
                return BadRequest(new { error = "Email et Mot de passe requis" });

            bool exists = await _context.Utilisateur.AnyAsync(u => u.Email == dto.Email);
            if (exists)
                return Conflict(new { error = "L'email existe deja" });

            var user = new Utilisateur(
                Email: dto.Email,
                Prenom: dto.Prenom,
                Nom: dto.Nom
            );
            user.MotDePasse = _hash.HashPassword(user, dto.MotDePasse);
            user.DateInscription = DateTime.UtcNow;
            _context.Utilisateur.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Enregistrement réussi" });
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.MotDePasse))
                return BadRequest(new { error = "Email et Mot de passe requis" });
            var user = await _context.Utilisateur.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized(new { error = "L'utilisateur n'existe pas" });

            var res = _hash.VerifyHashedPassword(user, hashedPassword: user.MotDePasse, dto.MotDePasse);
            if (res == PasswordVerificationResult.Failed)
                return Unauthorized(new { error = "Mot de passe invalide" });

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("UserEmail", user.Email);

            return Ok(new { message = "login OK", user = user.Email });
        }
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { message = "logout OK" });
        }
        [HttpGet("me")]
        public IActionResult Me()
        {
            int? userId = HttpContext.Session.GetInt32("UserId");
            string? email = HttpContext.Session.GetString("UserEmail");

            if (userId == null) return StatusCode(403, new { message = "Authentication required" });

            return Ok(new { userId, email });
        }
    }
}

