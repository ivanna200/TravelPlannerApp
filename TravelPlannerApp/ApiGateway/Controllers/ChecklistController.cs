using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        private IChecklistService GetProxy() =>
            ServiceProxy.Create<IChecklistService>(
                new Uri("fabric:/TravelPlannerApp/ChecklistService"));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var item = await GetProxy().GetItemAsync(id);
            if (item == null) return NotFound(new { message = "Stavka nije pronađena." });
            return Ok(item);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanItems(int travelPlanId)
        {
            var items = await GetProxy().GetPlanItemsAsync(travelPlanId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> CreateItem([FromBody] CreateChecklistItemDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Naziv stavke je obavezan." });

            var item = await GetProxy().CreateItemAsync(dto);
            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateChecklistItemDto dto)
        {
            var item = await GetProxy().UpdateItemAsync(id, dto);
            if (item == null) return NotFound(new { message = "Stavka nije pronađena." });
            return Ok(item);
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleItem(int id)
        {
            var item = await GetProxy().ToggleItemAsync(id);
            if (item == null) return NotFound(new { message = "Stavka nije pronađena." });
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var result = await GetProxy().DeleteItemAsync(id);
            if (!result) return NotFound(new { message = "Stavka nije pronađena." });
            return Ok(new { message = "Stavka uspješno obrisana." });
        }
    }
}