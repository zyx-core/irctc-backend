using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<bool> IsAdminAsync(int adminUserId)
        {
            var user = await _context.Users.FindAsync(adminUserId);
            return user != null && user.IsAdmin;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats([FromQuery] int adminUserId)
        {
            if (!await IsAdminAsync(adminUserId)) return Unauthorized("Admin access required.");

            var stats = new
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalTrains = await _context.Trains.CountAsync(),
                TotalTickets = await _context.Tickets.CountAsync(),
                TotalRevenue = await _context.Users.SumAsync(u => u.WalletBalance)
            };

            return Ok(stats);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int adminUserId)
        {
            if (!await IsAdminAsync(adminUserId)) return Unauthorized("Admin access required.");

            var users = await _context.Users.Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                u.Email,
                u.WalletBalance,
                u.IsAdmin
            }).ToListAsync();

            return Ok(users);
        }

        [HttpGet("trains")]
        public async Task<IActionResult> GetAllTrains([FromQuery] int adminUserId)
        {
            if (!await IsAdminAsync(adminUserId)) return Unauthorized("Admin access required.");

            var trains = await _context.Trains
                .Include(t => t.SourceStation)
                .Include(t => t.DestinationStation)
                .Take(50)
                .ToListAsync();

            return Ok(trains);
        }

        [HttpPost("trains")]
        public async Task<IActionResult> AddTrain([FromQuery] int adminUserId, [FromBody] Train train)
        {
            if (!await IsAdminAsync(adminUserId)) return Unauthorized("Admin access required.");

            _context.Trains.Add(train);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Train added successfully", train });
        }

        [HttpDelete("trains/{id}")]
        public async Task<IActionResult> DeleteTrain([FromQuery] int adminUserId, int id)
        {
            if (!await IsAdminAsync(adminUserId)) return Unauthorized("Admin access required.");

            var train = await _context.Trains.FindAsync(id);
            if (train == null) return NotFound("Train not found.");

            _context.Trains.Remove(train);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Train deleted successfully" });
        }

        [HttpGet("tickets")]
        public async Task<IActionResult> GetAllTickets([FromQuery] int adminUserId)
        {
            if (!await IsAdminAsync(adminUserId)) return Unauthorized("Admin access required.");

            var tickets = await _context.Tickets
                .Include(t => t.Train).ThenInclude(tr => tr.SourceStation)
                .Include(t => t.Train).ThenInclude(tr => tr.DestinationStation)
                .Include(t => t.User)
                .OrderByDescending(t => t.BookingDate)
                .Take(50)
                .ToListAsync();

            var result = tickets.Select(t => new
            {
                t.Id,
                t.Pnr,
                t.PassengerName,
                t.PassengerAge,
                t.Status,
                t.BookingDate,
                Train = $"{t.Train.Number} - {t.Train.Name}",
                Route = $"{t.Train.SourceStation?.Code} -> {t.Train.DestinationStation?.Code}",
                User = t.User?.Username ?? "Unknown"
            });

            return Ok(result);
        }

        [HttpGet("pantry")]
        public async Task<IActionResult> GetAllMealOrders([FromQuery] int adminUserId)
        {
            if (!await IsAdminAsync(adminUserId)) return Unauthorized("Admin access required.");

            var orders = await _context.MealOrders
                .Include(o => o.Meal)
                .OrderByDescending(o => o.OrderDate)
                .Take(100)
                .ToListAsync();

            var result = orders.Select(o => new
            {
                o.Id,
                o.Pnr,
                MealName = o.Meal?.Name ?? "Unknown",
                o.Quantity,
                TotalPrice = (o.Meal?.Price ?? 0) * o.Quantity,
                o.Status,
                o.OrderDate
            });

            return Ok(result);
        }

        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail([FromQuery] string email, [FromServices] Backend.Services.IEmailService emailService)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Email is required");
            
            await emailService.SendEmailAsync(
                email, 
                "Test User", 
                "IRCTC Test Email Integration", 
                "<h1>Success!</h1><p>If you are reading this, your Brevo email integration is working perfectly!</p>"
            );

            return Ok(new { message = "Test email sent successfully to " + email });
        }
    }
}
