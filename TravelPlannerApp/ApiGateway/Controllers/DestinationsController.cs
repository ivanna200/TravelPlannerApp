using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDestination(int id)
        {
            var dest = await GetProxy().GetDestinationAsync(id);
            if (dest == null) return NotFound(new { message = "Destinacija nije pronađena." });
            return Ok(dest);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanDestinations(int travelPlanId)
        {
            var destinations = await GetProxy().GetPlanDestinationsAsync(travelPlanId);
            return Ok(destinations);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDestination([FromBody] CreateDestinationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Naziv destinacije je obavezan." });

            var dest = await GetProxy().CreateDestinationAsync(dto);
            return Ok(dest);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDestination(int id, [FromBody] UpdateDestinationDto dto)
        {
            var dest = await GetProxy().UpdateDestinationAsync(id, dto);
            if (dest == null) return NotFound(new { message = "Destinacija nije pronađena." });
            return Ok(dest);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDestination(int id)
        {
            var result = await GetProxy().DeleteDestinationAsync(id);
            if (!result) return NotFound(new { message = "Destinacija nije pronađena." });
            return Ok(new { message = "Destinacija uspješno obrisana." });
        }
    }
}