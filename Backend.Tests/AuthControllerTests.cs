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
    public class AuthControllerTests
    {
        private readonly AppDbContext _context;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockEmailService = new Mock<IEmailService>();
            
            _mockEmailService.Setup(s => s.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _controller = new AuthController(_context, _mockEmailService.Object);
        }

        [Fact]
        public async Task Register_ValidUser_ReturnsOk()
        {
            // Arrange
            var req = new UserRegisterDto { Username = "testuser", FullName = "Test User", Password = "password123", Email = "test@example.com" };

            // Act
            var result = await _controller.Register(req);
            var okResult = result.Result as OkObjectResult;

            // Assert
            Assert.NotNull(okResult);
            Assert.Equal(200, okResult.StatusCode);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == "testuser");
            Assert.NotNull(user);
            Assert.Equal("test@example.com", user.Email);
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOk()
        {
            // Arrange
            var req = new UserRegisterDto { Username = "loginuser", FullName = "Login User", Password = "password123", Email = "login@example.com" };
            await _controller.Register(req);

            var loginReq = new UserLoginDto { Username = "loginuser", Password = "password123" };

            // Act
            var result = await _controller.Login(loginReq);
            var okResult = result.Result as OkObjectResult;

            // Assert
            Assert.NotNull(okResult);
            Assert.Equal(200, okResult.StatusCode);
            var tokenString = okResult.Value.ToString();
            Assert.Contains("loginuser", tokenString);
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsBadRequest()
        {
            // Arrange
            var req = new UserRegisterDto { Username = "loginuser2", FullName = "Login User 2", Password = "password123", Email = "login2@example.com" };
            await _controller.Register(req);

            var loginReq = new UserLoginDto { Username = "loginuser2", Password = "wrongpassword" };

            // Act
            var result = await _controller.Login(loginReq);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }
    }
}
