using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        
        [Required]
        public string Pnr { get; set; } = string.Empty;
        
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }
        
        [Required]
        public int TrainId { get; set; }
        public Train? Train { get; set; }
        
        public int? SeatId { get; set; }
        public Seat? Seat { get; set; }
        
        public string PassengerName { get; set; } = string.Empty;
        public int PassengerAge { get; set; }
        public string Status { get; set; } = "CONFIRMED"; // CONFIRMED, CANCELLED
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;
    }
}
