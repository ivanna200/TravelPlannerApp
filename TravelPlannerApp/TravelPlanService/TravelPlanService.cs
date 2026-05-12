using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using TravelPlanService.Services;

namespace TravelPlanService
{
    internal sealed class TravelPlanService : StatefulService, ITravelPlanService
    {
        private readonly IServiceProvider _serviceProvider;

        public TravelPlanService(StatefulServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task<TravelPlanDto?> GetTravelPlanAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetTravelPlanAsync(id);
        }

        public async Task<List<TravelPlanDto>> GetUserTravelPlansAsync(int userId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetUserTravelPlansAsync(userId);
        }

        public async Task<TravelPlanDto> CreateTravelPlanAsync(CreateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().CreateTravelPlanAsync(dto);
        }

        public async Task<TravelPlanDto?> UpdateTravelPlanAsync(int id, UpdateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().UpdateTravelPlanAsync(id, dto);
        }

        public async Task<bool> DeleteTravelPlanAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().DeleteTravelPlanAsync(id);
        }

        public async Task<DestinationDto?> GetDestinationAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetDestinationAsync(id);
        }

        public async Task<List<DestinationDto>> GetPlanDestinationsAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetPlanDestinationsAsync(travelPlanId);
        }

        public async Task<DestinationDto> CreateDestinationAsync(CreateDestinationDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().CreateDestinationAsync(dto);
        }

        public async Task<DestinationDto?> UpdateDestinationAsync(int id, UpdateDestinationDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().UpdateDestinationAsync(id, dto);
        }

        public async Task<bool> DeleteDestinationAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().DeleteDestinationAsync(id);
        }

        public async Task<ActivityDto?> GetActivityAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetActivityAsync(id);
        }

        public async Task<List<ActivityDto>> GetPlanActivitiesAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetPlanActivitiesAsync(travelPlanId);
        }

        public async Task<List<ActivityDto>> GetActivitiesByDateAsync(int travelPlanId, DateTime date)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetActivitiesByDateAsync(travelPlanId, date);
        }

        public async Task<ActivityDto> CreateActivityAsync(CreateActivityDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().CreateActivityAsync(dto);
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int id, UpdateActivityDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().UpdateActivityAsync(id, dto);
        }

        public async Task<bool> DeleteActivityAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().DeleteActivityAsync(id);
        }

        public async Task<SharePlanDto> CreateShareTokenAsync(CreateShareDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().CreateShareTokenAsync(dto);
        }

        public async Task<ShareTokenValidationDto> ValidateShareTokenAsync(string token)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().ValidateShareTokenAsync(token);
        }

        public async Task<TravelPlanDto?> GetPlanByShareTokenAsync(string token)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<TravelPlanningService>().GetPlanByShareTokenAsync(token);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }
    }
}