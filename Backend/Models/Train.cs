namespace Backend.Models
{
    public class Train
    {
        public int Id { get; set; }
        public required string Number { get; set; }
        public required string Name { get; set; }
        public int SourceStationId { get; set; }
        public Station? SourceStation { get; set; }
        public int DestinationStationId { get; set; }
        public Station? DestinationStation { get; set; }
        public required string DepartureTime { get; set; }
        public required string ArrivalTime { get; set; }
        public ICollection<Seat>? Seats { get; set; }
    }
}
