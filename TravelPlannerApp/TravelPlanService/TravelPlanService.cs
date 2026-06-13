using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using TravelPlanService.Infrastructure;
using TravelPlanService.Services;

namespace TravelPlanService
{
    internal sealed class TravelPlanService : StatefulService, ITravelPlanService
    {
        private const string PlanCacheName = "planCache";
        private readonly IServiceProvider _serviceProvider;
        private IReliableDictionary<int, string>? _planCache;

        public TravelPlanService(StatefulServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task OnOpenAsync(ReplicaOpenMode openMode, CancellationToken cancellationToken)
        {
            _planCache = await StateManager.GetOrAddAsync<IReliableDictionary<int, string>>(PlanCacheName);
            await base.OnOpenAsync(openMode, cancellationToken);
        }

        private TravelPlanningService GetSvc(IServiceScope scope) =>
            scope.ServiceProvider.GetRequiredService<TravelPlanningService>();

        private async Task InvalidatePlanCacheAsync(int planId)
        {
            if (_planCache == null) return;
            await ReliableJsonCache.RemoveAsync(StateManager, _planCache, planId);
        }

        public async Task<TravelPlanDto?> GetTravelPlanAsync(int id)
        {
            if (_planCache != null)
            {
                var cached = await ReliableJsonCache.TryGetAsync<TravelPlanDto>(StateManager, _planCache, id);
                if (cached != null) return cached;
            }

            using var scope = _serviceProvider.CreateScope();
            var plan = await GetSvc(scope).GetTravelPlanAsync(id);
            if (plan != null && _planCache != null)
                await ReliableJsonCache.SetAsync(StateManager, _planCache, id, plan);
            return plan;
        }

        public async Task<List<TravelPlanDto>> GetUserTravelPlansAsync(int userId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetUserTravelPlansAsync(userId);
        }

        public async Task<List<TravelPlanDto>> GetAllTravelPlansAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetAllTravelPlansAsync();
        }

        public async Task<TravelPlanDto> CreateTravelPlanAsync(CreateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).CreateTravelPlanAsync(dto);
        }

        public async Task<TravelPlanDto?> UpdateTravelPlanAsync(int id, UpdateTravelPlanDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var plan = await GetSvc(scope).UpdateTravelPlanAsync(id, dto);
            if (plan != null) await InvalidatePlanCacheAsync(id);
            return plan;
        }

        public async Task<bool> DeleteTravelPlanAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var deleted = await GetSvc(scope).DeleteTravelPlanAsync(id);
            if (deleted) await InvalidatePlanCacheAsync(id);
            return deleted;
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
            var dest = await GetSvc(scope).CreateDestinationAsync(dto);
            await InvalidatePlanCacheAsync(dto.TravelPlanId);
            return dest;
        }

        public async Task<DestinationDto?> UpdateDestinationAsync(int id, UpdateDestinationDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var existing = await GetSvc(scope).GetDestinationAsync(id);
            var updated = await GetSvc(scope).UpdateDestinationAsync(id, dto);
            if (existing != null) await InvalidatePlanCacheAsync(existing.TravelPlanId);
            return updated;
        }

        public async Task<bool> DeleteDestinationAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var existing = await GetSvc(scope).GetDestinationAsync(id);
            var deleted = await GetSvc(scope).DeleteDestinationAsync(id);
            if (deleted && existing != null) await InvalidatePlanCacheAsync(existing.TravelPlanId);
            return deleted;
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
            var activity = await GetSvc(scope).CreateActivityAsync(dto);
            await InvalidatePlanCacheAsync(dto.TravelPlanId);
            return activity;
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int id, UpdateActivityDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var existing = await GetSvc(scope).GetActivityAsync(id);
            var updated = await GetSvc(scope).UpdateActivityAsync(id, dto);
            if (existing != null) await InvalidatePlanCacheAsync(existing.TravelPlanId);
            return updated;
        }

        public async Task<bool> DeleteActivityAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var existing = await GetSvc(scope).GetActivityAsync(id);
            var deleted = await GetSvc(scope).DeleteActivityAsync(id);
            if (deleted && existing != null) await InvalidatePlanCacheAsync(existing.TravelPlanId);
            return deleted;
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

        public async Task<SharePlanDto?> GetShareTokenByIdAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await GetSvc(scope).GetShareTokenByIdAsync(id);
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
