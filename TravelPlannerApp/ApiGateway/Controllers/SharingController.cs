using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using QRCoder;

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

        // Kreiranje share tokena
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateShareToken([FromBody] CreateShareDto dto)
        {
            if (dto.AccessType != "VIEW" && dto.AccessType != "EDIT")
                return BadRequest(new { message = "AccessType mora biti VIEW ili EDIT." });

            var result = await GetProxy().CreateShareTokenAsync(dto);
            return Ok(result);
        }

        // QR kod generisanje
        [HttpGet("{token}/qr-code")]
        public async Task<IActionResult> GetQrCode(string token)
        {
            var validation = await GetProxy().ValidateShareTokenAsync(token);
            if (!validation.IsValid)
                return BadRequest(new { message = validation.Message });

            var shareUrl = $"http://localhost:5173/shared/{token}";

            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(shareUrl, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);

            return File(qrCodeBytes, "image/png");
        }

        // Validacija tokena
        [HttpGet("{token}/validate")]
        public async Task<IActionResult> ValidateToken(string token)
        {
            var result = await GetProxy().ValidateShareTokenAsync(token);
            if (!result.IsValid)
                return BadRequest(result);
            return Ok(result);
        }

        // Pristup dijeljenom planu - VIEW
        [HttpGet("{token}/plan")]
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

        // Editovanje putem share tokena - samo EDIT tip
        [HttpPut("{token}/plan")]
        public async Task<IActionResult> UpdateSharedPlan(string token, [FromBody] UpdateTravelPlanDto dto)
        {
            var validation = await GetProxy().ValidateShareTokenAsync(token);
            if (!validation.IsValid)
                return BadRequest(new { message = validation.Message });

            if (validation.AccessType != "EDIT")
                return StatusCode(403, new { message = "Nemate dozvolu za editovanje ovog plana." });

            var plan = await GetProxy().UpdateTravelPlanAsync(validation.TravelPlanId, dto);
            if (plan == null)
                return NotFound(new { message = "Plan nije pronađen." });

            return Ok(plan);
        }
    }
}