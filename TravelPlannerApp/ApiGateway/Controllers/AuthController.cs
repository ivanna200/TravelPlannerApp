using Microsoft.AspNetCore.Authorization;
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
        private IUserService GetUserServiceProxy() =>
            ServiceProxy.Create<IUserService>(
                new Uri("fabric:/TravelPlannerApp/UserService"));

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.FirstName) ||
                string.IsNullOrWhiteSpace(dto.LastName))
                return BadRequest(new { message = "Sva polja su obavezna." });

            var result = await GetUserServiceProxy().RegisterAsync(dto);
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

            var result = await GetUserServiceProxy().LoginAsync(dto);
            if (!result.Success)
                return Unauthorized(new { message = result.Message });
            return Ok(result);
        }

        [HttpGet("users/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await GetUserServiceProxy().GetUserByIdAsync(id);
            if (user == null) return NotFound(new { message = "Korisnik nije pronađen." });
            return Ok(user);
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await GetUserServiceProxy().GetAllUsersAsync();
            return Ok(users);
        }

        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await GetUserServiceProxy().DeleteUserAsync(id);
            if (!result) return NotFound(new { message = "Korisnik nije pronađen." });
            return Ok(new { message = "Korisnik uspješno obrisan." });
        }

        [HttpPatch("users/{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] string role)
        {
            var user = await GetUserServiceProxy().ChangeUserRoleAsync(id, role);
            if (user == null) return BadRequest(new { message = "Nevalidna uloga ili korisnik nije pronađen." });
            return Ok(user);
        }
    }
}