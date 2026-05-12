using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using ExpenseService.Services;

namespace ExpenseService
{
    internal sealed class ExpenseService : StatefulService, IExpenseService
    {
        private readonly IServiceProvider _serviceProvider;

        public ExpenseService(StatefulServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task<ExpenseDto?> GetExpenseAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            return await svc.GetExpenseAsync(id);
        }

        public async Task<List<ExpenseDto>> GetPlanExpensesAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            return await svc.GetPlanExpensesAsync(travelPlanId);
        }

        public async Task<List<ExpenseDto>> GetExpensesByCategoryAsync(int travelPlanId, string category)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            return await svc.GetExpensesByCategoryAsync(travelPlanId, category);
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            return await svc.CreateExpenseAsync(dto);
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            return await svc.UpdateExpenseAsync(id, dto);
        }

        public async Task<bool> DeleteExpenseAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            return await svc.DeleteExpenseAsync(id);
        }

        public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(int travelPlanId, decimal plannedBudget)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            return await svc.GetBudgetSummaryAsync(travelPlanId, plannedBudget);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }
    }
}