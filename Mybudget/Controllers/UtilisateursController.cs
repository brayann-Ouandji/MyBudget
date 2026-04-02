using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mybudget.Data;
using Mybudget.Dtos;
using Mybudget.Filters;
using MyBudget.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mybudget.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireLogin]
    public class UtilisateursController : ControllerBase
    {
        private readonly MybudgetContext _context;

        public UtilisateursController(MybudgetContext context)
        {
            _context = context;
        }

        // GET: api/Utilisateurs/5
        [HttpGet("me")]
        public async Task<ActionResult<Utilisateur>> Me()
        {
            int userId = HttpContext.Session.GetInt32("UserId")!.Value;

            var utilisateur = await _context.Utilisateur.FindAsync(userId);
            if (utilisateur == null) return NotFound();

            return utilisateur;
        }

        // PUT: api/Utilisateurs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPatch("me")]  
        public async Task<IActionResult> UpdateMe([FromBody] UpdateUserDto dto)
        {
            int userId = HttpContext.Session.GetInt32("UserId")!.Value;
            var utilisateur = await _context.Utilisateur.FindAsync(userId);
            if (utilisateur == null) return NotFound();

            if (dto.Nom != null) utilisateur.Nom = dto.Nom;
            if (dto.Prenom != null) utilisateur.Prenom = dto.Prenom;
            if (dto.Email != null) utilisateur.Email = dto.Email;
            if (dto.MotDePasse != null)
                utilisateur.MotDePasse = new PasswordHasher<Utilisateur>()
                                            .HashPassword(utilisateur, dto.MotDePasse);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Utilisateurs/5
        [HttpDelete("me")]
        public async Task<IActionResult> DeleteMe()
        {
            int userId = HttpContext.Session.GetInt32("UserId")!.Value;

            var utilisateur = await _context.Utilisateur.FindAsync(userId);
            if (utilisateur == null) return NotFound();

            _context.Utilisateur.Remove(utilisateur);
            await _context.SaveChangesAsync();

            HttpContext.Session.Clear(); // déconnexion
            return NoContent();
        }

        private bool UtilisateurExists(int id)
        {
            return _context.Utilisateur.Any(e => e.Id == id);
        }
    }
}
