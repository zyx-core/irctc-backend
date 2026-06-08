using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    public class BrevoEmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<BrevoEmailService> _logger;

        public BrevoEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<BrevoEmailService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            
            // Base URL for Brevo API
            _httpClient.BaseAddress = new Uri("https://api.brevo.com/v3/");
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlContent)
        {
            try
            {
                var apiKey = _configuration["Brevo:ApiKey"];
                var senderName = _configuration["Brevo:SenderName"];
                var senderEmail = _configuration["Brevo:SenderEmail"];

                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogError("Brevo API key is not configured.");
                    return;
                }

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);
                _httpClient.DefaultRequestHeaders.Add("accept", "application/json");

                var payload = new
                {
                    sender = new { name = senderName, email = senderEmail },
                    to = new[] { new { email = toEmail, name = toName } },
                    subject = subject,
                    htmlContent = htmlContent
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("smtp/email", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Failed to send email. Status Code: {response.StatusCode}. Error: {error}");
                }
                else
                {
                    _logger.LogInformation($"Email sent successfully to {toEmail}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception occurred while sending email: {ex.Message}");
            }
        }
    }
}
