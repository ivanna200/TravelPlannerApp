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

        private TravelPlanningService GetSvc(IServiceScope scope) =>
            scope.ServiceProvider.GetRequiredService<TravelPlanningService>();

        public async Task<TravelPlanDto?> GetTravelPlanAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetTravelPlanAsync(id);
        }

        public async Task<List<TravelPlanDto>> GetUserTravelPlansAsync(int userId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetUserTravelPlansAsync(userId);
        }

        public async Task<TravelPlanDto> CreateTravelPlanAsync(CreateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).CreateTravelPlanAsync(dto);
        }

        public async Task<TravelPlanDto?> UpdateTravelPlanAsync(int id, UpdateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).UpdateTravelPlanAsync(id, dto);
        }

        public async Task<bool> DeleteTravelPlanAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).DeleteTravelPlanAsync(id);
        }

        public async Task<bool> DeleteUserPlansAsync(int userId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).DeleteUserPlansAsync(userId);
        }

        public async Task<DestinationDto?> GetDestinationAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetDestinationAsync(id);
        }

        public async Task<List<DestinationDto>> GetPlanDestinationsAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetPlanDestinationsAsync(travelPlanId);
        }

        public async Task<DestinationDto> CreateDestinationAsync(CreateDestinationDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).CreateDestinationAsync(dto);
        }

        public async Task<DestinationDto?> UpdateDestinationAsync(int id, UpdateDestinationDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).UpdateDestinationAsync(id, dto);
        }

        public async Task<bool> DeleteDestinationAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).DeleteDestinationAsync(id);
        }

        public async Task<ActivityDto?> GetActivityAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetActivityAsync(id);
        }

        public async Task<List<ActivityDto>> GetPlanActivitiesAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetPlanActivitiesAsync(travelPlanId);
        }

        public async Task<List<ActivityDto>> GetActivitiesByDateAsync(int travelPlanId, DateTime date)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetActivitiesByDateAsync(travelPlanId, date);
        }

        public async Task<ActivityDto> CreateActivityAsync(CreateActivityDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).CreateActivityAsync(dto);
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int id, UpdateActivityDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).UpdateActivityAsync(id, dto);
        }

        public async Task<bool> DeleteActivityAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).DeleteActivityAsync(id);
        }


        public async Task<SharePlanDto> CreateShareTokenAsync(CreateShareDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).CreateShareTokenAsync(dto);
        }

        public async Task<List<SharePlanDto>> GetPlanSharingsAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetPlanSharingsAsync(travelPlanId);
        }

        public async Task<bool> DeleteShareTokenAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).DeleteShareTokenAsync(id);
        }

        public async Task<ShareTokenValidationDto> ValidateShareTokenAsync(string token)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).ValidateShareTokenAsync(token);
        }

        public async Task<TravelPlanDto?> GetPlanByShareTokenAsync(string token)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetPlanByShareTokenAsync(token);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }
    }
}