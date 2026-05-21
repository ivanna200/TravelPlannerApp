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
    [Route("api/activities")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private ITravelPlanService GetProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin() => User.IsInRole("Admin");

        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivity(int id)
        {
            var accessError = await PlanAccessHelper.EnsureActivityAccessAsync(
                GetProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            var activity = await GetProxy().GetActivityAsync(id);
            return Ok(activity);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanActivities(int travelPlanId)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var activities = await GetProxy().GetPlanActivitiesAsync(travelPlanId);
            return Ok(activities);
        }

        [HttpGet("plan/{travelPlanId}/date/{date}")]
        public async Task<IActionResult> GetActivitiesByDate(int travelPlanId, DateTime date)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var activities = await GetProxy().GetActivitiesByDateAsync(travelPlanId, date);
            return Ok(activities);
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity([FromBody] CreateActivityDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Activity name is required." });

            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetProxy(), dto.TravelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            try
            {
                var activity = await GetProxy().CreateActivityAsync(dto);
                return Ok(activity);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateActivity(int id, [FromBody] UpdateActivityDto dto)
        {
            var accessError = await PlanAccessHelper.EnsureActivityAccessAsync(
                GetProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            try
            {
                var activity = await GetProxy().UpdateActivityAsync(id, dto);
                if (activity == null) return NotFound(new { message = "Activity not found." });
                return Ok(activity);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            var accessError = await PlanAccessHelper.EnsureActivityAccessAsync(
                GetProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            var result = await GetProxy().DeleteActivityAsync(id);
            if (!result) return NotFound(new { message = "Activity not found." });
            return Ok(new { message = "Activity deleted successfully." });
        }
    }
}
