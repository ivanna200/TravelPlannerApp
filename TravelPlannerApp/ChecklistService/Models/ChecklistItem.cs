namespace ChecklistService.Models
{
    public class ChecklistItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public int TravelPlanId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}