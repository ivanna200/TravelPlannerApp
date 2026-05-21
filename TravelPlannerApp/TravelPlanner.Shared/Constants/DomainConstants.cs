namespace TravelPlanner.Shared.Constants
{
    public static class ActivityStatuses
    {
        public const string Planned = "Planned";
        public const string Reserved = "Reserved";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";

        public static readonly IReadOnlyList<string> All = new[]
        {
            Planned, Reserved, Completed, Cancelled
        };
    }

    public static class ExpenseCategories
    {
        public const string Transport = "Transport";
        public const string Accommodation = "Accommodation";
        public const string Food = "Food";
        public const string Tickets = "Tickets";
        public const string Shopping = "Shopping";
        public const string Other = "Other";

        public static readonly IReadOnlyList<string> All = new[]
        {
            Transport, Accommodation, Food, Tickets, Shopping, Other
        };
    }
}
