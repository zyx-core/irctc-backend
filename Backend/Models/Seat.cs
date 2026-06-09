using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class Seat
    {
        public int Id { get; set; }

        [Required]
        public int TrainId { get; set; }
        
        [JsonIgnore]
        public Train? Train { get; set; }

        [Required]
        public string SeatNumber { get; set; } = string.Empty;

        public bool IsBooked { get; set; } = false;
    }
}
