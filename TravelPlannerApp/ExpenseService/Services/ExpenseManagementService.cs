using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using ExpenseService.Data;
using ExpenseService.Models;

namespace ExpenseService.Services
{
    public static class ExpenseCategories
    {
        public const string Prevoz = "Prevoz";
        public const string Smjestaj = "Smještaj";
        public const string Hrana = "Hrana";
        public const string Ulaznice = "Ulaznice";
        public const string Kupovina = "Kupovina";
        public const string Ostalo = "Ostalo";

        public static readonly List<string> All = new()
        {
            Prevoz, Smjestaj, Hrana, Ulaznice, Kupovina, Ostalo
        };
    }

    public class ExpenseManagementService
    {
        private readonly ExpenseDbContext _context;

        public ExpenseManagementService(ExpenseDbContext context)
        {
            _context = context;
        }

        public async Task<ExpenseDto?> GetExpenseAsync(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            return expense == null ? null : MapToDto(expense);
        }

        public async Task<List<ExpenseDto>> GetPlanExpensesAsync(int travelPlanId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .OrderBy(e => e.Date)
                .ToListAsync();
            return expenses.Select(MapToDto).ToList();
        }

        public async Task<List<ExpenseDto>> GetExpensesByCategoryAsync(int travelPlanId, string category)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId && e.Category == category)
                .OrderBy(e => e.Date)
                .ToListAsync();
            return expenses.Select(MapToDto).ToList();
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto)
        {
            if (dto.Amount <= 0)
                throw new ArgumentException("Iznos troška mora biti pozitivan.");

            if (!ExpenseCategories.All.Contains(dto.Category))
                throw new ArgumentException($"Nevalidna kategorija. Dozvoljene: {string.Join(", ", ExpenseCategories.All)}");

            var expense = new Expense
            {
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                TravelPlanId = dto.TravelPlanId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return MapToDto(expense);
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(int id, UpdateExpenseDto dto)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return null;

            if (dto.Amount <= 0)
                throw new ArgumentException("Iznos troška mora biti pozitivan.");

            expense.Name = dto.Name;
            expense.Category = dto.Category;
            expense.Amount = dto.Amount;
            expense.Date = dto.Date;
            expense.Description = dto.Description;

            await _context.SaveChangesAsync();
            return MapToDto(expense);
        }

        public async Task<bool> DeleteExpenseAsync(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return false;

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePlanExpensesAsync(int travelPlanId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .ToListAsync();

            if (!expenses.Any()) return true;

            _context.Expenses.RemoveRange(expenses);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(int travelPlanId, decimal plannedBudget)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .ToListAsync();

            var totalExpenses = expenses.Sum(e => e.Amount);

            var byCategory = expenses
                .GroupBy(e => e.Category)
                .Select(g => new CategorySummaryDto
                {
                    Category = g.Key,
                    Total = g.Sum(e => e.Amount)
                })
                .ToList();

            return new BudgetSummaryDto
            {
                TravelPlanId = travelPlanId,
                PlannedBudget = plannedBudget,
                TotalExpenses = totalExpenses,
                RemainingBudget = plannedBudget - totalExpenses,
                ByCategory = byCategory
            };
        }

        private static ExpenseDto MapToDto(Expense e) => new()
        {
            Id = e.Id,
            Name = e.Name,
            Category = e.Category,
            Amount = e.Amount,
            Date = e.Date,
            Description = e.Description,
            TravelPlanId = e.TravelPlanId
        };
    }
}
