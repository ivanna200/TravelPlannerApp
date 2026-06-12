using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Security.Claims;
using ApiGateway.Helpers;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using QRCoder;

namespace ApiGateway.Controllers
{
    [ApiController]
    [Route("api/sharing")]
    public class SharingController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public SharingController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private ITravelPlanService GetTravelProxy() =>
            ServiceProxy.Create<ITravelPlanService>(
                new Uri("fabric:/TravelPlannerApp/TravelPlanService"),
                new ServicePartitionKey(0));

        private IChecklistService GetChecklistProxy() =>
            ServiceProxy.Create<IChecklistService>(
                new Uri("fabric:/TravelPlannerApp/ChecklistService"));

        private string GetFrontendUrl() =>
            _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173";

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin() => User.IsInRole("Admin");

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateShareToken([FromBody] CreateShareDto dto)
        {
            if (dto.AccessType != "VIEW" && dto.AccessType != "EDIT")
                return BadRequest(new { message = "AccessType must be VIEW or EDIT." });

            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), dto.TravelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var result = await GetTravelProxy().CreateShareTokenAsync(dto);
            return Ok(result);
        }

        [HttpGet("plan/{travelPlanId:int}")]
        [Authorize]
        public async Task<IActionResult> GetPlanSharings(int travelPlanId)
        {
            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), travelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var result = await GetTravelProxy().GetPlanSharingsAsync(travelPlanId);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteShareToken(int id)
        {
            var share = await GetTravelProxy().GetShareTokenByIdAsync(id);
            if (share == null)
                return NotFound(new { message = "Share token not found." });

            var (_, error) = await PlanAccessHelper.GetOwnedPlanAsync(
                GetTravelProxy(), share.TravelPlanId, GetCurrentUserId(), IsAdmin());
            if (error != null) return error;

            var deleted = await GetTravelProxy().DeleteShareTokenAsync(id);
            if (!deleted)
                return NotFound(new { message = "Share token not found." });
            return NoContent();
        }

        [HttpGet("{token}/qr-code")]
        public async Task<IActionResult> GetQrCode(string token)
        {
            var validation = await GetTravelProxy().ValidateShareTokenAsync(token);
            if (!validation.IsValid)
                return BadRequest(new { message = validation.Message });

            var shareUrl = $"{GetFrontendUrl()}/shared/{token}";

            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(shareUrl, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);

            return File(qrCodeBytes, "image/png");
        }

        [HttpGet("{token}/validate")]
        public async Task<IActionResult> ValidateToken(string token)
        {
            var result = await GetTravelProxy().ValidateShareTokenAsync(token);
            if (!result.IsValid)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("{token}/plan")]
        public async Task<IActionResult> GetSharedPlan(string token)
        {
            var validation = await GetTravelProxy().ValidateShareTokenAsync(token);
            if (!validation.IsValid)
                return BadRequest(new { message = validation.Message });

            var plan = await GetTravelProxy().GetPlanByShareTokenAsync(token);
            if (plan == null)
                return NotFound(new { message = "Travel plan not found." });

            var checklist = await GetChecklistProxy().GetPlanItemsAsync(plan.Id);

            return Ok(new { plan, checklist, accessType = validation.AccessType });
        }

        [HttpPut("{token}/plan")]
        public async Task<IActionResult> UpdateSharedPlan(string token, [FromBody] UpdateTravelPlanDto dto)
        {
            var validation = await ValidateEditTokenAsync(token);
            if (validation.Error != null) return validation.Error;

            try
            {
                var plan = await GetTravelProxy().UpdateTravelPlanAsync(validation.Value!.TravelPlanId, dto);
                if (plan == null)
                    return NotFound(new { message = "Travel plan not found." });
                return Ok(plan);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{token}/destinations")]
        public async Task<IActionResult> CreateSharedDestination(string token, [FromBody] CreateDestinationDto dto)
        {
            var validation = await ValidateEditTokenAsync(token);
            if (validation.Error != null) return validation.Error;

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Destination name is required." });

            if (dto.TravelPlanId != validation.Value!.TravelPlanId)
                return BadRequest(new { message = "Destination does not belong to the shared plan." });

            try
            {
                var dest = await GetTravelProxy().CreateDestinationAsync(dto);
                return Ok(dest);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{token}/destinations/{id:int}")]
        public async Task<IActionResult> UpdateSharedDestination(string token, int id, [FromBody] UpdateDestinationDto dto)
        {
            var validation = await ValidateEditTokenAsync(token);
            if (validation.Error != null) return validation.Error;

            var dest = await GetTravelProxy().GetDestinationAsync(id);
            if (dest == null)
                return NotFound(new { message = "Destination not found." });

            if (dest.TravelPlanId != validation.Value!.TravelPlanId)
                return StatusCode(403, new { message = "Destination does not belong to the shared plan." });

            try
            {
                var updated = await GetTravelProxy().UpdateDestinationAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Destination not found." });
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{token}/destinations/{id:int}")]
        public async Task<IActionResult> DeleteSharedDestination(string token, int id)
        {
            var validation = await ValidateEditTokenAsync(token);
            if (validation.Error != null) return validation.Error;

            var dest = await GetTravelProxy().GetDestinationAsync(id);
            if (dest == null)
                return NotFound(new { message = "Destination not found." });

            if (dest.TravelPlanId != validation.Value!.TravelPlanId)
                return StatusCode(403, new { message = "Destination does not belong to the shared plan." });

            var deleted = await GetTravelProxy().DeleteDestinationAsync(id);
            if (!deleted)
                return NotFound(new { message = "Destination not found." });

            return Ok(new { message = "Destination deleted successfully." });
        }

        [HttpPost("{token}/activities")]
        public async Task<IActionResult> CreateSharedActivity(string token, [FromBody] CreateActivityDto dto)
        {
            var validation = await ValidateEditTokenAsync(token);
            if (validation.Error != null) return validation.Error;

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Activity name is required." });

            if (dto.TravelPlanId != validation.Value!.TravelPlanId)
                return BadRequest(new { message = "Activity does not belong to the shared plan." });

            try
            {
                var activity = await GetTravelProxy().CreateActivityAsync(dto);
                return Ok(activity);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{token}/activities/{id:int}")]
        public async Task<IActionResult> UpdateSharedActivity(string token, int id, [FromBody] UpdateActivityDto dto)
        {
            var validation = await ValidateEditTokenAsync(token);
            if (validation.Error != null) return validation.Error;

            var activity = await GetTravelProxy().GetActivityAsync(id);
            if (activity == null)
                return NotFound(new { message = "Activity not found." });

            if (activity.TravelPlanId != validation.Value!.TravelPlanId)
                return StatusCode(403, new { message = "Activity does not belong to the shared plan." });

            try
            {
                var updated = await GetTravelProxy().UpdateActivityAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = "Activity not found." });
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{token}/activities/{id:int}")]
        public async Task<IActionResult> DeleteSharedActivity(string token, int id)
        {
            var validation = await ValidateEditTokenAsync(token);
            if (validation.Error != null) return validation.Error;

            var activity = await GetTravelProxy().GetActivityAsync(id);
            if (activity == null)
                return NotFound(new { message = "Activity not found." });

            if (activity.TravelPlanId != validation.Value!.TravelPlanId)
                return StatusCode(403, new { message = "Activity does not belong to the shared plan." });

            var deleted = await GetTravelProxy().DeleteActivityAsync(id);
            if (!deleted)
                return NotFound(new { message = "Activity not found." });

            return Ok(new { message = "Activity deleted successfully." });
        }

        private async Task<(ShareTokenValidationDto? Value, IActionResult? Error)> ValidateEditTokenAsync(string token)
        {
            var validation = await GetTravelProxy().ValidateShareTokenAsync(token);
            if (!validation.IsValid)
                return (null, BadRequest(new { message = validation.Message }));

            if (validation.AccessType != "EDIT")
                return (null, StatusCode(403, new { message = "You do not have permission to edit this plan." }));

            return (validation, null);
        }
    }
}
