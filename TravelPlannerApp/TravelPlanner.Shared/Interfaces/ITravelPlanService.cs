using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.DTOs;

namespace TravelPlanner.Shared.Interfaces
{
    public interface ITravelPlanService : IService
    {
        Task<TravelPlanDto?> GetTravelPlanAsync(int id);
        Task<List<TravelPlanDto>> GetUserTravelPlansAsync(int userId);
        Task<TravelPlanDto> CreateTravelPlanAsync(CreateTravelPlanDto dto);
        Task<TravelPlanDto?> UpdateTravelPlanAsync(int id, UpdateTravelPlanDto dto);
        Task<bool> DeleteTravelPlanAsync(int id);
        Task<bool> DeleteUserPlansAsync(int userId);

        Task<DestinationDto?> GetDestinationAsync(int id);
        Task<List<DestinationDto>> GetPlanDestinationsAsync(int travelPlanId);
        Task<DestinationDto> CreateDestinationAsync(CreateDestinationDto dto);
        Task<DestinationDto?> UpdateDestinationAsync(int id, UpdateDestinationDto dto);
        Task<bool> DeleteDestinationAsync(int id);

        Task<ActivityDto?> GetActivityAsync(int id);
        Task<List<ActivityDto>> GetPlanActivitiesAsync(int travelPlanId);
        Task<List<ActivityDto>> GetActivitiesByDateAsync(int travelPlanId, DateTime date);
        Task<ActivityDto> CreateActivityAsync(CreateActivityDto dto);
        Task<ActivityDto?> UpdateActivityAsync(int id, UpdateActivityDto dto);
        Task<bool> DeleteActivityAsync(int id);

        Task<SharePlanDto> CreateShareTokenAsync(CreateShareDto dto);
        Task<List<SharePlanDto>> GetPlanSharingsAsync(int travelPlanId);
        Task<SharePlanDto?> GetShareTokenByIdAsync(int id);
        Task<bool> DeleteShareTokenAsync(int id);
        Task<ShareTokenValidationDto> ValidateShareTokenAsync(string token);
        Task<TravelPlanDto?> GetPlanByShareTokenAsync(string token);
    }
}
