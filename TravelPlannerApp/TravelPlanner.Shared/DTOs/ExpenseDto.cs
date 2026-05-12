namespace TravelPlanner.Shared.DTOs
{
    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public int TravelPlanId { get; set; }
    }

    public class CreateExpenseDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public int TravelPlanId { get; set; }
    }

    public class UpdateExpenseDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class BudgetSummaryDto
    {
        public int TravelPlanId { get; set; }
        public decimal PlannedBudget { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal RemainingBudget { get; set; }
        public List<CategorySummaryDto> ByCategory { get; set; } = new();
    }

    public class CategorySummaryDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}