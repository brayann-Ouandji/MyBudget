using Microsoft.OpenApi.Models;

namespace Mybudget.Dtos
{
    public class UpdateCategoryDto
    {
        public string? Nom { get; set; }
        public string? Couleur { get; set; }
        public OperationType? TypeOperation { get; set; }
    }
}
