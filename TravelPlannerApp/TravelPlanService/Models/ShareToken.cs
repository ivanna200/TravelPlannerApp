namespace TravelPlanService.Models
{
    public class ShareToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public string AccessType { get; set; } = "VIEW";
        public int TravelPlanId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public TravelPlan TravelPlan { get; set; } = null!;
    }
}