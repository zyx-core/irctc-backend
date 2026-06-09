using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public TicketController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public class BookTicketDto
        {
            public int UserId { get; set; }
            public int TrainId { get; set; }
            public string PassengerName { get; set; } = string.Empty;
            public int PassengerAge { get; set; }
            public string? PaymentId { get; set; }
        }

        [HttpPost("book")]
        public async Task<IActionResult> Book([FromBody] BookTicketDto request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound(new { message = "User not found" });

            var train = await _context.Trains.FindAsync(request.TrainId);
            if (train == null) return NotFound(new { message = "Train not found" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Find an available seat with pessimistic locking
                var availableSeat = await _context.Seats
                    .FromSqlInterpolated($"SELECT * FROM Seats WHERE TrainId = {request.TrainId} AND IsBooked = FALSE LIMIT 1 FOR UPDATE")
                    .FirstOrDefaultAsync();

                if (availableSeat == null)
                {
                    return BadRequest(new { message = "Train is fully booked." });
                }

                // Dummy pricing logic: 500 fixed rate
                if (string.IsNullOrEmpty(request.PaymentId))
                {
                    if (user.WalletBalance < 500)
                    {
                        return BadRequest(new { message = "Insufficient Wallet Balance! Minimum ₹500 required." });
                    }

                    // Deduct balance
                    user.WalletBalance -= 500;
                }

                // Mark seat as booked
                availableSeat.IsBooked = true;

                // Generate PNR
                var random = new Random();
                string pnr = random.Next(1000000000, 2147483647).ToString();

                var ticket = new Ticket
                {
                    Pnr = pnr,
                    UserId = request.UserId,
                    TrainId = request.TrainId,
                    SeatId = availableSeat.Id,
                    PassengerName = request.PassengerName,
                    PassengerAge = request.PassengerAge,
                    Status = "CONFIRMED",
                    BookingDate = DateTime.UtcNow
                };

                _context.Tickets.Add(ticket);
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                var subject = $"Ticket Confirmation - PNR {ticket.Pnr}";
                var html = $"<h1>Booking Confirmed</h1><p>Dear {user.FullName},</p><p>Your ticket on {train.Name} has been confirmed. Seat: {availableSeat.SeatNumber}. PNR: {ticket.Pnr}.</p>";
                if (string.IsNullOrEmpty(request.PaymentId)) {
                    html += $"<p>An amount of ₹500 was deducted from your wallet. New Balance: ₹{user.WalletBalance}.</p>";
                }
                await _emailService.SendEmailAsync(user.Email, user.FullName, subject, html);

                return Ok(new { message = "Ticket Booked Successfully", pnr = ticket.Pnr, seat = availableSeat.SeatNumber, newBalance = user.WalletBalance });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred during booking. Please try again.", error = ex.Message });
            }
        }

        [HttpGet("pnr/{pnr}")]
        public async Task<IActionResult> GetByPnr(string pnr)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Seat)
                .Include(t => t.Train).ThenInclude(tr => tr.SourceStation)
                .Include(t => t.Train).ThenInclude(tr => tr.DestinationStation)
                .FirstOrDefaultAsync(t => t.Pnr == pnr);

            if (ticket == null) return NotFound(new { message = "PNR not found" });

            return Ok(ticket);
        }

        [HttpPost("cancel/{pnr}")]
        public async Task<IActionResult> Cancel(string pnr, [FromBody] int userId)
        {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Pnr == pnr && t.UserId == userId);
            if (ticket == null) return NotFound(new { message = "Ticket not found or unauthorized" });

            if (ticket.Status == "CANCELLED") return BadRequest(new { message = "Ticket is already cancelled" });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                ticket.Status = "CANCELLED";
                
                // Free the seat
                if (ticket.SeatId.HasValue)
                {
                    var seat = await _context.Seats.FindAsync(ticket.SeatId.Value);
                    if (seat != null)
                    {
                        seat.IsBooked = false;
                    }
                }
                
                // Refund
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.WalletBalance += 400; // ₹100 cancellation charge
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                if (user != null) {
                    var subject = $"Ticket Cancelled - PNR {pnr}";
                    var html = $"<h1>Cancellation Successful</h1><p>Dear {user.FullName},</p><p>Your ticket with PNR {pnr} has been cancelled.</p><p>An amount of ₹400 was refunded to your wallet. New Balance: ₹{user.WalletBalance}.</p>";
                    await _emailService.SendEmailAsync(user.Email, user.FullName, subject, html);
                }

                return Ok(new { message = "Ticket cancelled. ₹400 refunded to wallet." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred during cancellation.", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserTickets(int userId)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Seat)
                .Include(t => t.Train).ThenInclude(tr => tr.SourceStation)
                .Include(t => t.Train).ThenInclude(tr => tr.DestinationStation)
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.BookingDate)
                .ToListAsync();

            return Ok(tickets);
        }
    }
}
