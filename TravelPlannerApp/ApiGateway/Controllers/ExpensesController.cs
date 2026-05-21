using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Security.Claims;
using ApiGateway.Helpers;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/expenses")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private ITravelPlanService GetTravelProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        private IExpenseService GetExpenseProxy() =>
            ServiceProxy.Create<IExpenseService>(
                new Uri("fabric:/TravelPlannerApp/ExpenseService"),
                new ServicePartitionKey(0));

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin() => User.IsInRole("Admin");

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExpense(int id)
        {
            var accessError = await PlanAccessHelper.EnsureExpenseAccessAsync(
                GetTravelProxy(), GetExpenseProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            var expense = await GetExpenseProxy().GetExpenseAsync(id);
            return Ok(expense);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanExpenses(int travelPlanId)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var expenses = await GetExpenseProxy().GetPlanExpensesAsync(travelPlanId);
            return Ok(expenses);
        }

        [HttpGet("plan/{travelPlanId}/category/{category}")]
        public async Task<IActionResult> GetByCategory(int travelPlanId, string category)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var expenses = await GetExpenseProxy().GetExpensesByCategoryAsync(travelPlanId, category);
            return Ok(expenses);
        }

        [HttpGet("plan/{travelPlanId}/budget-summary")]
        public async Task<IActionResult> GetBudgetSummary(int travelPlanId, [FromQuery] decimal plannedBudget)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var summary = await GetExpenseProxy().GetBudgetSummaryAsync(travelPlanId, plannedBudget);
            return Ok(summary);
        }

        [HttpPost]
        public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Expense name is required." });
            if (dto.Amount <= 0)
                return BadRequest(new { message = "Amount must be positive." });

            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), dto.TravelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            try
            {
                var expense = await GetExpenseProxy().CreateExpenseAsync(dto);
                return Ok(expense);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] UpdateExpenseDto dto)
        {
            if (dto.Amount <= 0)
                return BadRequest(new { message = "Amount must be positive." });

            var accessError = await PlanAccessHelper.EnsureExpenseAccessAsync(
                GetTravelProxy(), GetExpenseProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            try
            {
                var expense = await GetExpenseProxy().UpdateExpenseAsync(id, dto);
                if (expense == null) return NotFound(new { message = "Expense not found." });
                return Ok(expense);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var accessError = await PlanAccessHelper.EnsureExpenseAccessAsync(
                GetTravelProxy(), GetExpenseProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            var result = await GetExpenseProxy().DeleteExpenseAsync(id);
            if (!result) return NotFound(new { message = "Expense not found." });
            return Ok(new { message = "Expense deleted successfully." });
        }
    }
}
