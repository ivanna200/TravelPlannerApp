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
    [Route("api/destinations")]
    [Authorize]
    public class DestinationsController : ControllerBase
    {
        private ITravelPlanService GetProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin() => User.IsInRole("Admin");

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDestination(int id)
        {
            var accessError = await PlanAccessHelper.EnsureDestinationAccessAsync(
                GetProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            var dest = await GetProxy().GetDestinationAsync(id);
            return Ok(dest);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanDestinations(int travelPlanId)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var destinations = await GetProxy().GetPlanDestinationsAsync(travelPlanId);
            return Ok(destinations);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDestination([FromBody] CreateDestinationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Destination name is required." });

            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetProxy(), dto.TravelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            try
            {
                var dest = await GetProxy().CreateDestinationAsync(dto);
                return Ok(dest);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDestination(int id, [FromBody] UpdateDestinationDto dto)
        {
            var accessError = await PlanAccessHelper.EnsureDestinationAccessAsync(
                GetProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            try
            {
                var dest = await GetProxy().UpdateDestinationAsync(id, dto);
                if (dest == null) return NotFound(new { message = "Destination not found." });
                return Ok(dest);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDestination(int id)
        {
            var accessError = await PlanAccessHelper.EnsureDestinationAccessAsync(
                GetProxy(), id, GetCurrentUserId(), IsAdmin());
            if (accessError != null) return accessError;

            var result = await GetProxy().DeleteDestinationAsync(id);
            if (!result) return NotFound(new { message = "Destination not found." });
            return Ok(new { message = "Destination deleted successfully." });
        }
    }
}
