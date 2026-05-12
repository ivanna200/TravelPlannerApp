using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/expenses")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private IExpenseService GetProxy() =>
            ServiceProxy.Create<IExpenseService>(
                new Uri("fabric:/TravelPlannerApp/ExpenseService"),
                new ServicePartitionKey(0));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExpense(int id)
        {
            var expense = await GetProxy().GetExpenseAsync(id);
            if (expense == null) return NotFound(new { message = "Trošak nije pronađen." });
            return Ok(expense);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanExpenses(int travelPlanId)
        {
            var expenses = await GetProxy().GetPlanExpensesAsync(travelPlanId);
            return Ok(expenses);
        }

        [HttpGet("plan/{travelPlanId}/category/{category}")]
        public async Task<IActionResult> GetByCategory(int travelPlanId, string category)
        {
            var expenses = await GetProxy().GetExpensesByCategoryAsync(travelPlanId, category);
            return Ok(expenses);
        }

        [HttpGet("plan/{travelPlanId}/budget-summary")]
        public async Task<IActionResult> GetBudgetSummary(int travelPlanId, [FromQuery] decimal plannedBudget)
        {
            var summary = await GetProxy().GetBudgetSummaryAsync(travelPlanId, plannedBudget);
            return Ok(summary);
        }

        [HttpPost]
        public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Naziv troška je obavezan." });
            if (dto.Amount <= 0)
                return BadRequest(new { message = "Iznos mora biti pozitivan." });

            var expense = await GetProxy().CreateExpenseAsync(dto);
            return Ok(expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] UpdateExpenseDto dto)
        {
            if (dto.Amount <= 0)
                return BadRequest(new { message = "Iznos mora biti pozitivan." });

            var expense = await GetProxy().UpdateExpenseAsync(id, dto);
            if (expense == null) return NotFound(new { message = "Trošak nije pronađen." });
            return Ok(expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var result = await GetProxy().DeleteExpenseAsync(id);
            if (!result) return NotFound(new { message = "Trošak nije pronađen." });
            return Ok(new { message = "Trošak uspješno obrisan." });
        }
    }
}