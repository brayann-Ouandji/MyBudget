namespace Mybudget.Dtos
{
    public class UpdateTransactionDto
    {
        public decimal? Montant { get; set; }     
        public DateTime? DateOperation { get; set; } 
        public string? Description { get; set; }     
        public int? CategorieId { get; set; }
    }
}
