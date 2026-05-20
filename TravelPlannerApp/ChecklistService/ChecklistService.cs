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
            return await scope.ServiceProvider.GetRequiredService<ChecklistManagementService>().GetItemAsync(id);
        }

        public async Task<List<ChecklistItemDto>> GetPlanItemsAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ChecklistManagementService>().GetPlanItemsAsync(travelPlanId);
        }

        public async Task<ChecklistItemDto> CreateItemAsync(CreateChecklistItemDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ChecklistManagementService>().CreateItemAsync(dto);
        }

        public async Task<ChecklistItemDto?> UpdateItemAsync(int id, UpdateChecklistItemDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ChecklistManagementService>().UpdateItemAsync(id, dto);
        }

        public async Task<ChecklistItemDto?> ToggleItemAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ChecklistManagementService>().ToggleItemAsync(id);
        }

        public async Task<bool> DeleteItemAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ChecklistManagementService>().DeleteItemAsync(id);
        }

        public async Task<bool> DeletePlanItemsAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ChecklistManagementService>().DeletePlanItemsAsync(travelPlanId);
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }
    }
}
