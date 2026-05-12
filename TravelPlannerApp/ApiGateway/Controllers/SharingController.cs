using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/sharing")]
    public class SharingController : ControllerBase
    {
        private ITravelPlanService GetProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        [HttpPost("share")]
        [Authorize]
        public async Task<IActionResult> CreateShareToken([FromBody] CreateShareDto dto)
        {
            if (dto.AccessType != "VIEW" && dto.AccessType != "EDIT")
                return BadRequest(new { message = "AccessType mora biti VIEW ili EDIT." });

            var result = await GetProxy().CreateShareTokenAsync(dto);
            return Ok(result);
        }

        [HttpGet("validate/{token}")]
        public async Task<IActionResult> ValidateToken(string token)
        {
            var result = await GetProxy().ValidateShareTokenAsync(token);
            if (!result.IsValid)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("plan/{token}")]
        public async Task<IActionResult> GetSharedPlan(string token)
        {
            var validation = await GetProxy().ValidateShareTokenAsync(token);
            if (!validation.IsValid)
                return BadRequest(new { message = validation.Message });

            var plan = await GetProxy().GetPlanByShareTokenAsync(token);
            if (plan == null)
                return NotFound(new { message = "Plan nije pronađen." });

            return Ok(new { plan, accessType = validation.AccessType });
        }
    }
}