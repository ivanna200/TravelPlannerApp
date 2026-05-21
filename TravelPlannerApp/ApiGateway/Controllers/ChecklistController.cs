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
    [Route("api/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        private ITravelPlanService GetTravelProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        private IChecklistService GetChecklistProxy() =>
            ServiceProxy.Create<IChecklistService>(
                new Uri("fabric:/TravelPlannerApp/ChecklistService"));

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin() => User.IsInRole("Admin");

        private async Task<IActionResult?> EnsureChecklistItemAccessAsync(int itemId)
        {
            var item = await GetChecklistProxy().GetItemAsync(itemId);
            if (item == null)
                return new NotFoundObjectResult(new { message = "Checklist item not found." });

            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), item.TravelPlanId, GetCurrentUserId(), IsAdmin());
            return error;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(int id)
        {
            var accessError = await EnsureChecklistItemAccessAsync(id);
            if (accessError != null) return accessError;

            var item = await GetChecklistProxy().GetItemAsync(id);
            return Ok(item);
        }

        [HttpGet("plan/{travelPlanId}")]
        public async Task<IActionResult> GetPlanItems(int travelPlanId)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var items = await GetChecklistProxy().GetPlanItemsAsync(travelPlanId);
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> CreateItem([FromBody] CreateChecklistItemDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Item name is required." });

            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), dto.TravelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var item = await GetChecklistProxy().CreateItemAsync(dto);
            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateChecklistItemDto dto)
        {
            var accessError = await EnsureChecklistItemAccessAsync(id);
            if (accessError != null) return accessError;

            var item = await GetChecklistProxy().UpdateItemAsync(id, dto);
            if (item == null) return NotFound(new { message = "Checklist item not found." });
            return Ok(item);
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleItem(int id)
        {
            var accessError = await EnsureChecklistItemAccessAsync(id);
            if (accessError != null) return accessError;

            var item = await GetChecklistProxy().ToggleItemAsync(id);
            if (item == null) return NotFound(new { message = "Checklist item not found." });
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var accessError = await EnsureChecklistItemAccessAsync(id);
            if (accessError != null) return accessError;

            var result = await GetChecklistProxy().DeleteItemAsync(id);
            if (!result) return NotFound(new { message = "Checklist item not found." });
            return Ok(new { message = "Checklist item deleted successfully." });
        }
    }
}
