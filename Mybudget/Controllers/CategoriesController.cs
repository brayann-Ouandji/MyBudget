using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mybudget.Data;
using Mybudget.Dtos;
using Mybudget.Filters;
using Mybudget.Models;
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
    public class CategoriesController : ControllerBase
    {
        private readonly MybudgetContext _context;

        public CategoriesController(MybudgetContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userId = HttpContext.Session.GetInt32("UserId");

            if (userId == null)
                throw new UnauthorizedAccessException("Utilisateur non connecté.");

            return userId.Value;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categorie>>> GetCategories()
        {
            var userId = GetUserId();

            var categories = await _context.Categorie
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Categorie>> GetCategorieById(int id)
        {
            var userId = GetUserId();

            var categorie = await _context.Categorie
                .FirstOrDefaultAsync(c => c.id == id && c.UserId == userId);

            if (categorie == null)
            {
                return NotFound();
            }

            return Ok(categorie);
        }

        // PUT: api/Categories/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PutCategorie(int id, UpdateCategoryDto categorie)
        {
            var userId = GetUserId();


            var existingCategorie = await _context.Categorie
                .FirstOrDefaultAsync(c => c.id == id && c.UserId == userId);

            if (existingCategorie == null)
            {
                return NotFound();
            }

            // On met à jour seulement les champs autorisés
            if(categorie.Nom != null) existingCategorie.Nom = categorie.Nom;
            // ajoute ici les autres champs modifiables si besoin
            if (categorie.TypeOperation != null) existingCategorie.TypeOperation = (OperationType)categorie.TypeOperation;
            if (categorie.Couleur != null) existingCategorie.Couleur = categorie.Couleur;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Categorie>> PostCategorie(Categorie categorie)
        {
            var userId = GetUserId();

            // On force l'appartenance à l'utilisateur connecté
            categorie.UserId = userId;

            _context.Categorie.Add(categorie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategorieById), new { id = categorie.id }, categorie);
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategorie(int id)
        {
            var userId = GetUserId();

            var categorie = await _context.Categorie
                .FirstOrDefaultAsync(c => c.id == id && c.UserId == userId);

            if (categorie == null)
            {
                return NotFound();
            }

            _context.Categorie.Remove(categorie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategorieExists(int id)
        {
            var userId = GetUserId();

            return _context.Categorie.Any(e => e.id == id && e.UserId == userId);
        }
    }
}