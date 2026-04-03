using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mybudget.Data;
using Mybudget.Dtos;
using Mybudget.Filters;
using Mybudget.Models;

namespace Mybudget.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireLogin]
    public class BudgetsController : ControllerBase
    {
        private readonly MybudgetContext _context;

        public BudgetsController(MybudgetContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return HttpContext.Session.GetInt32("UserId")!.Value;
        }

        // GET: api/budgets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudget()
        {
            var userId = GetUserId();

            return await _context.Budget
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        // GET: api/budgets/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Budget>> GetBudget(int id)
        {
            var userId = GetUserId();

            var budget = await _context.Budget
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (budget == null)
                return NotFound();

            return budget;
        }

        // POST: api/budgets
        [HttpPost]
        public async Task<ActionResult<Budget>> PostBudget([FromBody] Budget budget)
        {
            var userId = GetUserId();

            budget.UserId = userId;

            _context.Budget.Add(budget);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budget);
        }

        // PATCH: api/budgets/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> PutBudget( int id, [FromBody] UpdateBudgetDto budget)
        {
            var userId = GetUserId();


            var existing = await _context.Budget
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (existing == null)
                return NotFound();

            if (budget.MontantLimite != null) existing.MontantLimite = (decimal)budget.MontantLimite;
            if (budget.Mois != null) existing.Mois = (int)budget.Mois;
            if (budget.Annee != null) existing.Annee = (int)budget.Annee;
            if (budget.CategorieId != null) existing.CategoryId = (int)budget.CategorieId.Value;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/budgets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var userId = GetUserId();

            var budget = await _context.Budget
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (budget == null)
                return NotFound();

            _context.Budget.Remove(budget);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BudgetExists(int id)
        {
            var userId = GetUserId();
            return _context.Budget.Any(e => e.Id == id && e.UserId == userId);
        }
    }
}