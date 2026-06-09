using System;
using System.Threading.Tasks;
using Backend.Controllers;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Moq;

namespace Backend.Tests
{
    public class TicketControllerTests
    {
        private readonly AppDbContext _context;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly TicketController _controller;

        public TicketControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockEmailService = new Mock<IEmailService>();

            // Setup mock email service to succeed
            _mockEmailService.Setup(s => s.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _controller = new TicketController(_context, _mockEmailService.Object);
        }

        [Fact]
        public async Task BookTicket_InsufficientBalance_ReturnsBadRequest()
        {
            // Arrange
            var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", WalletBalance = 50, PasswordHash = "hash" };
            var train = new Train { Id = 10, Name = "Express", Number = "123", DepartureTime = "10:00", ArrivalTime = "12:00" };
            
            _context.Users.Add(user);
            _context.Trains.Add(train);
            await _context.SaveChangesAsync();

            var req = new TicketController.BookTicketDto { UserId = 1, TrainId = 10, PassengerName = "John Doe", PassengerAge = 30 };

            // Act
            var result = await _controller.Book(req);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Insufficient Wallet Balance!", badRequest.Value.ToString());
        }

        [Fact]
        public async Task BookTicket_ValidRequest_DeductsBalanceAndSendsEmail()
        {
            // Arrange
            var user = new User { Id = 2, Username = "richuser", FullName = "richuser", Email = "rich@example.com", WalletBalance = 1000, PasswordHash = "hash" };
            var train = new Train { Id = 20, Name = "Superfast", Number = "456", DepartureTime = "14:00", ArrivalTime = "18:00" };
            
            _context.Users.Add(user);
            _context.Trains.Add(train);
            await _context.SaveChangesAsync();

            var req = new TicketController.BookTicketDto { UserId = 2, TrainId = 20, PassengerName = "Jane Doe", PassengerAge = 25 };

            // Act
            var result = await _controller.Book(req);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var tokenString = okResult.Value.ToString();
            Assert.Contains("pnr", tokenString);

            // Verify wallet was deducted (assuming fare is calculated)
            var updatedUser = await _context.Users.FindAsync(2);
            Assert.True(updatedUser.WalletBalance < 1000);

            // Verify email was sent
            _mockEmailService.Verify(s => s.SendEmailAsync("rich@example.com", "richuser", It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }
    }
}
