using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Mybudget.Models
{
    [Table("Budget")]
    public class Budget
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Column("LimitAmount")]
        public decimal MontatnLimite { get; set; }
        [Column("Month")]
        [Required]
        public int Mois { get; set; }
        [Column("Year")]
        [Required]
        public int Annee { get; set; }
        [ForeignKey("Utilisateur")]
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
