using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using ExpenseService.Infrastructure;
using ExpenseService.Services;

namespace ExpenseService
{
    internal sealed class ExpenseService : StatefulService, IExpenseService
    {
        private const string BudgetCacheName = "budgetSummaryCache";
        private readonly IServiceProvider _serviceProvider;
        private IReliableDictionary<int, string>? _budgetCache;

        public ExpenseService(StatefulServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task OnOpenAsync(ReplicaOpenMode openMode, CancellationToken cancellationToken)
        {
            _budgetCache = await StateManager.GetOrAddAsync<IReliableDictionary<int, string>>(BudgetCacheName);
            await base.OnOpenAsync(openMode, cancellationToken);
        }

        private async Task InvalidateBudgetCacheAsync(int travelPlanId)
        {
            if (_budgetCache == null) return;
            await ReliableJsonCache.RemoveAsync(StateManager, _budgetCache, travelPlanId);
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
            var expense = await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().CreateExpenseAsync(dto);
            await InvalidateBudgetCacheAsync(dto.TravelPlanId);
            return expense;
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            var existing = await svc.GetExpenseAsync(id);
            var updated = await svc.UpdateExpenseAsync(id, dto);
            if (existing != null) await InvalidateBudgetCacheAsync(existing.TravelPlanId);
            return updated;
        }

        public async Task<bool> DeleteExpenseAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<ExpenseManagementService>();
            var existing = await svc.GetExpenseAsync(id);
            var deleted = await svc.DeleteExpenseAsync(id);
            if (deleted && existing != null) await InvalidateBudgetCacheAsync(existing.TravelPlanId);
            return deleted;
        }

        public async Task<bool> DeletePlanExpensesAsync(int travelPlanId)
        {
            using var scope = _serviceProvider.CreateScope();
            var deleted = await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>().DeletePlanExpensesAsync(travelPlanId);
            if (deleted) await InvalidateBudgetCacheAsync(travelPlanId);
            return deleted;
        }

        public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(int travelPlanId, decimal plannedBudget)
        {
            if (_budgetCache != null)
            {
                var cached = await ReliableJsonCache.TryGetAsync<BudgetSummaryDto>(StateManager, _budgetCache, travelPlanId);
                if (cached != null && cached.PlannedBudget == plannedBudget)
                    return cached;
            }

            using var scope = _serviceProvider.CreateScope();
            var summary = await scope.ServiceProvider.GetRequiredService<ExpenseManagementService>()
                .GetBudgetSummaryAsync(travelPlanId, plannedBudget);

            if (_budgetCache != null)
                await ReliableJsonCache.SetAsync(StateManager, _budgetCache, travelPlanId, summary);

            return summary;
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }
    }
}
