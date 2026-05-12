namespace TravelPlanner.Shared.DTOs
{
    public class ChecklistItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int TravelPlanId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateChecklistItemDto
    {
        public string Name { get; set; } = string.Empty;
        public int TravelPlanId { get; set; }
    }

    public class UpdateChecklistItemDto
    {
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}