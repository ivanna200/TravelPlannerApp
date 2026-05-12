using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/activities")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private ITravelPlanService GetProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivity(int id)
        {
            var activity = await GetProxy().GetActivityAsync(id);
            if (activity == null) return NotFound(new { message = "Aktivnost nije pronađena." });
            return Ok(activity);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanActivities(int travelPlanId)
        {
            var activities = await GetProxy().GetPlanActivitiesAsync(travelPlanId);
            return Ok(activities);
        }

        [HttpGet("plan/{travelPlanId}/date/{date}")]
        public async Task<IActionResult> GetActivitiesByDate(int travelPlanId, DateTime date)
        {
            var activities = await GetProxy().GetActivitiesByDateAsync(travelPlanId, date);
            return Ok(activities);
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity([FromBody] CreateActivityDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Naziv aktivnosti je obavezan." });

            var activity = await GetProxy().CreateActivityAsync(dto);
            return Ok(activity);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateActivity(int id, [FromBody] UpdateActivityDto dto)
        {
            var activity = await GetProxy().UpdateActivityAsync(id, dto);
            if (activity == null) return NotFound(new { message = "Aktivnost nije pronađena." });
            return Ok(activity);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            var result = await GetProxy().DeleteActivityAsync(id);
            if (!result) return NotFound(new { message = "Aktivnost nije pronađena." });
            return Ok(new { message = "Aktivnost uspješno obrisana." });
        }
    }
}