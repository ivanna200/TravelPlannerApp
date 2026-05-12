namespace ExpenseService.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public int TravelPlanId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}