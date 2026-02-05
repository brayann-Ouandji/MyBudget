using Mybudget.Controllers;
using Mybudget.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyBudget.Models
{
    [Table("User")]
    public class Utilisateur
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Column("Name")]
        public string? Nom { get; set; }
        [Column("Surname")]
        public string? Prénom { get; set; }
        [Required]
        [EmailAddress]
        [Column("Email")]
        public string? Email { get; set; }
        [Column("Password")]
        [Required]
        public string? MotDePasse { get; set; }
        [Column("InscriptionDate")]
        public DateTime DateInscription { get; set; }
        public virtual ICollection<Transaction>? Transactions { get; set; }
        public virtual ICollection<Categorie>? Categories { get; set; }
        public virtual ICollection<Budget>? Budgets { get; set; }

    }
}
