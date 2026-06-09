using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MealController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MealController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("menu")]
        public async Task<IActionResult> GetMenu()
        {
            var menu = await _context.Meals.ToListAsync();
            return Ok(menu);
        }

        [HttpGet("orders/{pnr}")]
        public async Task<IActionResult> GetOrders(string pnr)
        {
            var orders = await _context.MealOrders
                .Include(o => o.Meal)
                .Where(o => o.Pnr == pnr)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        public class OrderMealDto
        {
            public string Pnr { get; set; } = string.Empty;
            public int MealId { get; set; }
            public int Quantity { get; set; }
            public int UserId { get; set; }
            public string? PaymentId { get; set; }
        }

        [HttpPost("order")]
        public async Task<IActionResult> OrderMeal([FromBody] OrderMealDto request)
        {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Pnr == request.Pnr);
            if (ticket == null || ticket.Status != "CONFIRMED")
            {
                return BadRequest(new { message = "Invalid or Cancelled PNR." });
            }

            var meal = await _context.Meals.FindAsync(request.MealId);
            if (meal == null) return NotFound(new { message = "Meal not found" });

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound();

            decimal totalCost = meal.Price * request.Quantity;

            if (string.IsNullOrEmpty(request.PaymentId))
            {
                if (user.WalletBalance < totalCost)
                {
                    return BadRequest(new { message = $"Insufficient Wallet Balance! Need ₹{totalCost}." });
                }

                user.WalletBalance -= totalCost;
            }

            var order = new MealOrder
            {
                Pnr = request.Pnr,
                MealId = request.MealId,
                Quantity = request.Quantity,
                Status = "PREPARING",
                OrderDate = DateTime.UtcNow
            };

            _context.MealOrders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Meal Ordered Successfully! ₹{totalCost} deducted.", orderId = order.Id, newBalance = user.WalletBalance });
        }
    }
}
