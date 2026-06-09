using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class MealOrder
    {
        public int Id { get; set; }
        
        [Required]
        public string Pnr { get; set; } = string.Empty;
        
        [Required]
        public int MealId { get; set; }
        public Meal? Meal { get; set; }
        
        public int Quantity { get; set; } = 1;
        public string Status { get; set; } = "PREPARING";
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    }
}
