using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private IUserService GetUserServiceProxy()
        {
            return ServiceProxy.Create<IUserService>(
                new Uri("fabric:/TravelPlannerApp/UserService"));
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.FirstName) ||
                string.IsNullOrWhiteSpace(dto.LastName))
                return BadRequest(new { message = "Sva polja su obavezna." });

            var proxy = GetUserServiceProxy();
            var result = await proxy.RegisterAsync(dto);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email i lozinka su obavezni." });

            var proxy = GetUserServiceProxy();
            var result = await proxy.LoginAsync(dto);

            if (!result.Success)
                return Unauthorized(new { message = result.Message });

            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var proxy = GetUserServiceProxy();
            var user = await proxy.GetUserByIdAsync(id);

            if (user == null)
                return NotFound(new { message = "Korisnik nije pronađen." });

            return Ok(user);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var proxy = GetUserServiceProxy();
            var users = await proxy.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var proxy = GetUserServiceProxy();
            var result = await proxy.DeleteUserAsync(id);

            if (!result)
                return NotFound(new { message = "Korisnik nije pronađen." });

            return Ok(new { message = "Korisnik uspješno obrisan." });
        }
    }
}