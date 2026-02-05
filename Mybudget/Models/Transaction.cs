using MyBudget.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyBudget.Models
{
    [Table("Transaction")]
    public class Transaction
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Column("Montant")]
        public decimal Montant { get; set; }
        [Column("OperationDate")]
        [Required]
        public DateTime DateOperation { get; set; }
        [Column("Description")]
        public string? Description { get; set; }
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public required Utilisateur utilisateur { get; set; }
        [ForeignKey("Categorie")]
        public int CategoryId { get; set; }
        //Propriété de navigation
        [ForeignKey(nameof(CategoryId))]
        public required Categorie Categorie { get; set; }
    }
}

