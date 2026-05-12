using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/travel-plans")]
    [Authorize]
    public class TravelPlansController : ControllerBase
    {
        private ITravelPlanService GetProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlan(int id)
        {
            var plan = await GetProxy().GetTravelPlanAsync(id);
            if (plan == null) return NotFound(new { message = "Plan nije pronađen." });
            return Ok(plan);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserPlans(int userId)
        {
            var plans = await GetProxy().GetUserTravelPlansAsync(userId);
            return Ok(plans);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePlan([FromBody] CreateTravelPlanDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Naziv plana je obavezan." });
            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti prije početnog." });
            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan." });

            var plan = await GetProxy().CreateTravelPlanAsync(dto);
            return Ok(plan);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] UpdateTravelPlanDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti prije početnog." });
            if (dto.Budget < 0)
                return BadRequest(new { message = "Budžet ne može biti negativan." });

            var plan = await GetProxy().UpdateTravelPlanAsync(id, dto);
            if (plan == null) return NotFound(new { message = "Plan nije pronađen." });
            return Ok(plan);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(int id)
        {
            var result = await GetProxy().DeleteTravelPlanAsync(id);
            if (!result) return NotFound(new { message = "Plan nije pronađen." });
            return Ok(new { message = "Plan uspješno obrisan." });
        }
    }
}