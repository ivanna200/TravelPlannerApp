using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;

namespace ApiGateway.Helpers
{
    public static class PlanAccessHelper
    {
        public static async Task<(TravelPlanDto? Plan, IActionResult? Error)> GetOwnedPlanAsync(
            ITravelPlanService travelPlanService,
            int travelPlanId,
            int userId,
            bool isAdmin)
        {
            var plan = await travelPlanService.GetTravelPlanAsync(travelPlanId);
            if (plan == null)
                return (null, new NotFoundObjectResult(new { message = "Travel plan not found." }));

            if (!isAdmin && plan.UserId != userId)
                return (null, new ForbidResult());

            return (plan, null);
        }

        public static async Task<IActionResult?> EnsureDestinationAccessAsync(
            ITravelPlanService travelPlanService,
            int destinationId,
            int userId,
            bool isAdmin)
        {
            var destination = await travelPlanService.GetDestinationAsync(destinationId);
            if (destination == null)
                return new NotFoundObjectResult(new { message = "Destination not found." });

            var (_, error) = await GetOwnedPlanAsync(
                travelPlanService, destination.TravelPlanId, userId, isAdmin);
            return error;
        }

        public static async Task<IActionResult?> EnsureActivityAccessAsync(
            ITravelPlanService travelPlanService,
            int activityId,
            int userId,
            bool isAdmin)
        {
            var activity = await travelPlanService.GetActivityAsync(activityId);
            if (activity == null)
                return new NotFoundObjectResult(new { message = "Activity not found." });

            var (_, error) = await GetOwnedPlanAsync(
                travelPlanService, activity.TravelPlanId, userId, isAdmin);
            return error;
        }

        public static async Task<IActionResult?> EnsureExpenseAccessAsync(
            ITravelPlanService travelPlanService,
            IExpenseService expenseService,
            int expenseId,
            int userId,
            bool isAdmin)
        {
            var expense = await expenseService.GetExpenseAsync(expenseId);
            if (expense == null)
                return new NotFoundObjectResult(new { message = "Expense not found." });

            var (_, error) = await GetOwnedPlanAsync(
                travelPlanService, expense.TravelPlanId, userId, isAdmin);
            return error;
        }
    }
}
