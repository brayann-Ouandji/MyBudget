using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyBudget.Models
{
    public enum OperationType
    {
        Depense = 0,
        Revenu = 1
    }
    [Table("Category")]
    public class Categorie
    {
        [Key]
        public int id { get; set; }
        [Required]
        [Column("Name")]
        public string? Nom { get; set; }
        [Column("Color")]
        public string? Couleur { get; set; }
        [Column("OperationType")]
        [Required]
        public OperationType TypeOperation { get; set; }
        [ForeignKey("Utilisateur")]
        public int UserId { get; set; }
        public required Utilisateur utilisateur { get; set; }
        public virtual ICollection<Transaction>? Transactions { get; set; }

    }
}
