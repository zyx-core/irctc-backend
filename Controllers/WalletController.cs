using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public WalletController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetBalance(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new { balance = user.WalletBalance });
        }

        public class AddFundsDto
        {
            public int UserId { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddFunds([FromBody] AddFundsDto request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound();

            if (request.Amount <= 0) return BadRequest(new { message = "Amount must be positive" });

            user.WalletBalance += request.Amount;
            await _context.SaveChangesAsync();

            var subject = "Wallet Recharged - IRCTC";
            var html = $"<h1>Wallet Recharged</h1><p>Dear {user.FullName},</p><p>An amount of ₹{request.Amount} has been successfully added to your wallet. Your new balance is ₹{user.WalletBalance}.</p>";
            await _emailService.SendEmailAsync(user.Email, user.FullName, subject, html);

            return Ok(new { message = "Funds added successfully", balance = user.WalletBalance });
        }
    }
}
