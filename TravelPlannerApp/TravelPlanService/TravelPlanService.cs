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

        // Travel Plans
        public async Task<TravelPlanDto?> GetTravelPlanAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.GetTravelPlanAsync(id);
        }

        public async Task<List<TravelPlanDto>> GetUserTravelPlansAsync(int userId)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.GetUserTravelPlansAsync(userId);
        }

        public async Task<TravelPlanDto> CreateTravelPlanAsync(CreateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.CreateTravelPlanAsync(dto);
        }

        public async Task<TravelPlanDto?> UpdateTravelPlanAsync(int id, UpdateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.UpdateTravelPlanAsync(id, dto);
        }

        public async Task<bool> DeleteTravelPlanAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.DeleteTravelPlanAsync(id);
        }

        // Destinations
        public async Task<DestinationDto?> GetDestinationAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.GetDestinationAsync(id);
        }

        public async Task<List<DestinationDto>> GetPlanDestinationsAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.GetPlanDestinationsAsync(travelPlanId);
        }

        public async Task<DestinationDto> CreateDestinationAsync(CreateDestinationDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.CreateDestinationAsync(dto);
        }

        public async Task<DestinationDto?> UpdateDestinationAsync(int id, UpdateDestinationDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.UpdateDestinationAsync(id, dto);
        }

        public async Task<bool> DeleteDestinationAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.DeleteDestinationAsync(id);
        }

        // Activities
        public async Task<ActivityDto?> GetActivityAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.GetActivityAsync(id);
        }

        public async Task<List<ActivityDto>> GetPlanActivitiesAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.GetPlanActivitiesAsync(travelPlanId);
        }

        public async Task<List<ActivityDto>> GetActivitiesByDateAsync(int travelPlanId, DateTime date)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.GetActivitiesByDateAsync(travelPlanId, date);
        }

        public async Task<ActivityDto> CreateActivityAsync(CreateActivityDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.CreateActivityAsync(dto);
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int id, UpdateActivityDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.UpdateActivityAsync(id, dto);
        }

        public async Task<bool> DeleteActivityAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<TravelPlanningService>();
            return await svc.DeleteActivityAsync(id);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }
    }
}