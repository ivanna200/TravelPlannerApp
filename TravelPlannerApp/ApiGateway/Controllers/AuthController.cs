using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private IUserService GetUserProxy() =>
            ServiceProxy.Create<IUserService>(
                new Uri("fabric:/TravelPlannerApp/UserService"));

        private ITravelPlanService GetTravelProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        private IExpenseService GetExpenseProxy() =>
            ServiceProxy.Create<IExpenseService>(
                new Uri("fabric:/TravelPlannerApp/ExpenseService"),
                new ServicePartitionKey(0));

        private IChecklistService GetChecklistProxy() =>
            ServiceProxy.Create<IChecklistService>(
                new Uri("fabric:/TravelPlannerApp/ChecklistService"));

        [HttpPost("api/auth/register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.FirstName) ||
                string.IsNullOrWhiteSpace(dto.LastName))
                return BadRequest(new { message = "Sva polja su obavezna." });

            var result = await GetUserProxy().RegisterAsync(dto);
            if (!result.Success)
                return BadRequest(new { message = result.Message });
            return Ok(result);
        }

        [HttpPost("api/auth/login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email i lozinka su obavezni." });

            var result = await GetUserProxy().LoginAsync(dto);
            if (!result.Success)
                return Unauthorized(new { message = result.Message });
            return Ok(result);
        }

        [HttpGet("api/users/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await GetUserProxy().GetUserByIdAsync(id);
            if (user == null) return NotFound(new { message = "Korisnik nije pronađen." });
            return Ok(user);
        }

        [HttpGet("api/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await GetUserProxy().GetAllUsersAsync();
            return Ok(users);
        }

        [HttpDelete("api/users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {

            var plans = await GetTravelProxy().GetUserTravelPlansAsync(id);

            foreach (var plan in plans)
            {
                await GetExpenseProxy().DeletePlanExpensesAsync(plan.Id);
                await GetChecklistProxy().DeletePlanItemsAsync(plan.Id);
            }

            await GetTravelProxy().DeleteUserPlansAsync(id);

            var result = await GetUserProxy().DeleteUserAsync(id);
            if (!result) return NotFound(new { message = "Korisnik nije pronađen." });

            return Ok(new { message = "Korisnik i svi povezani podaci su uspješno obrisani." });
        }

        [HttpPatch("api/users/{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Role))
                return BadRequest(new { message = "Uloga je obavezna." });

            var user = await GetUserProxy().ChangeUserRoleAsync(id, dto.Role);
            if (user == null) return BadRequest(new { message = "Nevalidna uloga ili korisnik nije pronađen." });
            return Ok(user);
        }
    }
}
