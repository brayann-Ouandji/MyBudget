using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mybudget.Data;
using Mybudget.Dtos;
using Mybudget.Filters;
using MyBudget.Models;

namespace Mybudget.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequireLogin]
    public class TransactionsController : ControllerBase
    {
        private readonly MybudgetContext _context;

        public TransactionsController(MybudgetContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return HttpContext.Session.GetInt32("UserId")!.Value;
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            var userId = GetUserId();

            return await _context.Transaction
                .Where(t => t.UserId == userId)
                .Include(t => t.Categorie) // jointure pour avoir le nom de la catégorie
                .OrderByDescending(t => t.DateOperation)
                .ToListAsync();
        }

        // GET: api/transactions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransactionById(int id)
        {
            var userId = GetUserId();

            var transaction = await _context.Transaction
                .Include(t => t.Categorie)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
                return NotFound();

            return transaction;
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction(Transaction transaction)
        {
            var userId = GetUserId();

            transaction.UserId = userId;

            _context.Transaction.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, transaction);
        }

        // PUT: api/transactions/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchTransaction(int id, [FromBody] UpdateTransactionDto dto)
        {
            var userId = GetUserId();

            var existing = await _context.Transaction
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (existing == null)
                return NotFound();

            // On modifie UNIQUEMENT les champs fournis
            if (dto.Montant != null) existing.Montant = dto.Montant.Value;
            if (dto.DateOperation != null) existing.DateOperation = dto.DateOperation.Value;
            if (dto.Description != null) existing.Description = dto.Description;
            if (dto.CategorieId != null) existing.CategoryId = dto.CategorieId.Value;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/transactions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = GetUserId();

            var transaction = await _context.Transaction
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
                return NotFound();

            _context.Transaction.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransactionExists(int id)
        {
            var userId = GetUserId();
            return _context.Transaction.Any(e => e.Id == id && e.UserId == userId);
        }
    }
}