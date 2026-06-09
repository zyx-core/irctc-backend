using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Meal
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Type { get; set; } = "VEG"; // VEG, NON-VEG
    }
}
