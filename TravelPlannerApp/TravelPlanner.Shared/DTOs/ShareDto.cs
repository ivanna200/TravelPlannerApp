namespace TravelPlanner.Shared.DTOs
{
    public class SharePlanDto
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public string AccessType { get; set; } = string.Empty; // VIEW or EDIT
        public int TravelPlanId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string ShareUrl { get; set; } = string.Empty;
    }

    public class CreateShareDto
    {
        public int TravelPlanId { get; set; }
        public string AccessType { get; set; } = "VIEW"; // VIEW or EDIT
        public int ExpiryDays { get; set; } = 7;
    }

    public class ShareTokenValidationDto
    {
        public bool IsValid { get; set; }
        public string AccessType { get; set; } = string.Empty;
        public int TravelPlanId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}