using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Security.Claims;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/travel-plans")]
    [Authorize]
    public class TravelPlansController : ControllerBase
    {
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

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin() =>
            User.IsInRole("Admin");

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPlans()
        {
            var plans = await GetTravelProxy().GetAllTravelPlansAsync();
            return Ok(plans);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlan(int id)
        {
            var plan = await GetTravelProxy().GetTravelPlanAsync(id);
            if (plan == null)
                return NotFound(new { message = "Travel plan not found." });

            if (!IsAdmin() && plan.UserId != GetCurrentUserId())
                return Forbid();

            return Ok(plan);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserPlans(int userId)
        {
            if (!IsAdmin() && userId != GetCurrentUserId())
                return Forbid();

            var plans = await GetTravelProxy().GetUserTravelPlansAsync(userId);
            return Ok(plans);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePlan([FromBody] CreateTravelPlanDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Plan name is required." });
            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "End date cannot be before start date." });
            if (dto.Budget < 0)
                return BadRequest(new { message = "Budget cannot be negative." });

            if (!IsAdmin() && dto.UserId != GetCurrentUserId())
                return Forbid();

            try
            {
                var plan = await GetTravelProxy().CreateTravelPlanAsync(dto);
                return Ok(plan);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdateTravelPlanDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "End date cannot be before start date." });
            if (dto.Budget < 0)
                return BadRequest(new { message = "Budget cannot be negative." });

            var existing = await GetTravelProxy().GetTravelPlanAsync(id);
            if (existing == null)
                return NotFound(new { message = "Travel plan not found." });
            if (!IsAdmin() && existing.UserId != GetCurrentUserId())
                return Forbid();

            try
            {
                var plan = await GetTravelProxy().UpdateTravelPlanAsync(id, dto);
                return Ok(plan);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(int id)
        {
            var existing = await GetTravelProxy().GetTravelPlanAsync(id);
            if (existing == null)
                return NotFound(new { message = "Travel plan not found." });
            if (!IsAdmin() && existing.UserId != GetCurrentUserId())
                return Forbid();

            await GetExpenseProxy().DeletePlanExpensesAsync(id);
            await GetChecklistProxy().DeletePlanItemsAsync(id);
            await GetTravelProxy().DeleteTravelPlanAsync(id);

            return Ok(new { message = "Travel plan and all related data were deleted successfully." });
        }
    }
}
