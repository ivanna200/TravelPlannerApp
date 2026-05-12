using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using ChecklistService.Services;

namespace ChecklistService
{
    internal sealed class ChecklistService : StatelessService, IChecklistService
    {
        private readonly IServiceProvider _serviceProvider;

        public ChecklistService(StatelessServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task<ChecklistItemDto?> GetItemAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ChecklistManagementService>();
            return await svc.GetItemAsync(id);
        }

        public async Task<List<ChecklistItemDto>> GetPlanItemsAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ChecklistManagementService>();
            return await svc.GetPlanItemsAsync(travelPlanId);
        }

        public async Task<ChecklistItemDto> CreateItemAsync(CreateChecklistItemDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ChecklistManagementService>();
            return await svc.CreateItemAsync(dto);
        }

        public async Task<ChecklistItemDto?> UpdateItemAsync(int id, UpdateChecklistItemDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ChecklistManagementService>();
            return await svc.UpdateItemAsync(id, dto);
        }

        public async Task<ChecklistItemDto?> ToggleItemAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ChecklistManagementService>();
            return await svc.ToggleItemAsync(id);
        }

        public async Task<bool> DeleteItemAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ChecklistManagementService>();
            return await svc.DeleteItemAsync(id);
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }
    }
}