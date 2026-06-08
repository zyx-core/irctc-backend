using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Station>>> GetStations([FromQuery] string query = "")
        {
            var stations = await _context.Stations
                .Where(s => string.IsNullOrEmpty(query) || s.Name.Contains(query) || s.Code.Contains(query))
                .ToListAsync();

            return Ok(stations);
        }
    }
}
