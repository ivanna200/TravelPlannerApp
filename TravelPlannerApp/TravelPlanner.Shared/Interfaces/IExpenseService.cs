using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.DTOs;

namespace TravelPlanner.Shared.Interfaces
{
    public interface IExpenseService : IService
    {
        Task<ExpenseDto?> GetExpenseAsync(int id);
        Task<List<ExpenseDto>> GetPlanExpensesAsync(int travelPlanId);
        Task<List<ExpenseDto>> GetExpensesByCategoryAsync(int travelPlanId, string category);
        Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto);
        Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto);
        Task<bool> DeleteExpenseAsync(int id);
        Task<BudgetSummaryDto> GetBudgetSummaryAsync(int travelPlanId, decimal plannedBudget);
    }
}