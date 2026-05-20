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
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().GetExpenseAsync(id);
        }

        public async Task<List<ExpenseDto>> GetPlanExpensesAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().GetPlanExpensesAsync(travelPlanId);
        }

        public async Task<List<ExpenseDto>> GetExpensesByCategoryAsync(int travelPlanId, string category)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().GetExpensesByCategoryAsync(travelPlanId, category);
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().CreateExpenseAsync(dto);
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().UpdateExpenseAsync(id, dto);
        }

        public async Task<bool> DeleteExpenseAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().DeleteExpenseAsync(id);
        }

        public async Task<bool> DeletePlanExpensesAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().DeletePlanExpensesAsync(travelPlanId);
        }

        public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(int travelPlanId, decimal plannedBudget)
        {
            using var scope = _serviceProvider.CreateScope();
            return await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().GetBudgetSummaryAsync(travelPlanId, plannedBudget);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }
    }
}
