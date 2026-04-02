namespace Mybudget.Dtos
{
    public class UpdateBudgetDto
    {
        public decimal? MontantLimite { get; set; }
        public int? Mois { get; set; }
        public int? Annee { get; set; }
        public int? CategorieId { get; set; }
    }
}
