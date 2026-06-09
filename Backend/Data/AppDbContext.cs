using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Station> Stations { get; set; }
        public DbSet<Train> Trains { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Meal> Meals { get; set; }
        public DbSet<MealOrder> MealOrders { get; set; }
        public DbSet<Seat> Seats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Train>()
                .HasOne(t => t.SourceStation)
                .WithMany()
                .HasForeignKey(t => t.SourceStationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Train>()
                .HasOne(t => t.DestinationStation)
                .WithMany()
                .HasForeignKey(t => t.DestinationStationId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
