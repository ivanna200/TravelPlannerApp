namespace TravelPlanService.Models
{
    public class TravelPlan
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Destination> Destinations { get; set; } = new();
        public List<Activity> Activities { get; set; } = new();
    }
}