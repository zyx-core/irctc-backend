using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrainController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TrainController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Train>>> SearchTrains(
            [FromQuery] int sourceStationId, 
            [FromQuery] int destinationStationId, 
            [FromQuery] string date)
        {
            // Simplified search that ignores date for dummy data
            var trains = await _context.Trains
                .Include(t => t.SourceStation)
                .Include(t => t.DestinationStation)
                .Where(t => t.SourceStationId == sourceStationId && t.DestinationStationId == destinationStationId)
                .ToListAsync();

            return Ok(trains);
        }

        [HttpGet("lookup")]
        public async Task<ActionResult> LookupTrains([FromQuery] string query = "")
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                return Ok(new List<object>());

            var lower = query.ToLower();
            var results = await _context.Trains
                .Where(t => t.Number.ToLower().Contains(lower) || t.Name.ToLower().Contains(lower))
                .Take(20)
                .Select(t => new { t.Id, t.Number, t.Name })
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("schedule/{trainNumber}")]
        public async Task<ActionResult> GetTrainSchedule(string trainNumber)
        {
            var train = await _context.Trains
                .Include(t => t.SourceStation)
                .Include(t => t.DestinationStation)
                .FirstOrDefaultAsync(t => t.Number == trainNumber);

            if (train == null)
            {
                return NotFound(new { message = "Train not found." });
            }

            // Mocking intermediate stops
            var stops = new List<object>();

            // Origin
            stops.Add(new {
                stationName = train.SourceStation?.Name,
                arrivalTime = "--",
                departureTime = train.DepartureTime,
                haltTime = "--"
            });

            // Calculate mocked intermediate times
            if (TimeSpan.TryParse(train.DepartureTime, out TimeSpan depTime) && 
                TimeSpan.TryParse(train.ArrivalTime, out TimeSpan arrTime))
            {
                // If arrival is on next day, adjust
                if (arrTime < depTime) arrTime = arrTime.Add(TimeSpan.FromHours(24));

                var totalDuration = arrTime - depTime;
                var step = TimeSpan.FromTicks(totalDuration.Ticks / 4);

                // Mock 3 intermediate stops
                for (int i = 1; i <= 3; i++)
                {
                    var stopArrTime = depTime.Add(TimeSpan.FromTicks(step.Ticks * i));
                    var stopDepTime = stopArrTime.Add(TimeSpan.FromMinutes(5)); // 5 min halt
                    
                    // Format correctly (modulo 24 hours for next day arrivals)
                    var arrStr = string.Format("{0:hh\\:mm}", stopArrTime);
                    var depStr = string.Format("{0:hh\\:mm}", stopDepTime);
                    
                    if (stopArrTime.Days > 0) arrStr = string.Format("{0:00}:{1:mm}", stopArrTime.Hours, stopArrTime);
                    if (stopDepTime.Days > 0) depStr = string.Format("{0:00}:{1:mm}", stopDepTime.Hours, stopDepTime);

                    stops.Add(new {
                        stationName = $"Mock Halt {i}",
                        arrivalTime = arrStr,
                        departureTime = depStr,
                        haltTime = "5 mins"
                    });
                }
            }

            // Destination
            stops.Add(new {
                stationName = train.DestinationStation?.Name,
                arrivalTime = train.ArrivalTime,
                departureTime = "--",
                haltTime = "--"
            });

            return Ok(new {
                trainName = train.Name,
                stops = stops
            });
        }
    }
}
