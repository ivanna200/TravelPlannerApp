using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Security.Claims;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Middleware
{
    public class UserExistsMiddleware
    {
        private readonly RequestDelegate _next;

        public UserExistsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out var userId))
                {
                    var userService = ServiceProxy.Create<IUserService>(
                        new Uri("fabric:/TravelPlannerApp/UserService"));

                    var user = await userService.GetUserByIdAsync(userId);
                    if (user == null)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        await context.Response.WriteAsJsonAsync(new { message = "User account no longer exists." });
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
