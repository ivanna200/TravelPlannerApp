using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using TravelPlanService.Data;
using TravelPlanService.Models;

namespace TravelPlanService.Services
{
    public class TravelPlanningService
    {
        private readonly TravelPlanDbContext _context;
        private readonly IConfiguration _configuration;

        public TravelPlanningService(TravelPlanDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private string GetFrontendUrl() =>
            _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173";

        public async Task<TravelPlanDto?> GetTravelPlanAsync(int id)
        {
            var plan = await _context.TravelPlans
                .Include(t => t.Destinations)
                .Include(t => t.Activities)
                .FirstOrDefaultAsync(t => t.Id == id);
            return plan == null ? null : MapToDto(plan);
        }

        public async Task<List<TravelPlanDto>> GetUserTravelPlansAsync(int userId)
        {
            var plans = await _context.TravelPlans
                .Include(t => t.Destinations)
                .Include(t => t.Activities)
                .Where(t => t.UserId == userId)
                .ToListAsync();
            return plans.Select(MapToDto).ToList();
        }

        public async Task<TravelPlanDto> CreateTravelPlanAsync(CreateTravelPlanDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                throw new ArgumentException("Krajnji datum ne moze biti prije pocetnog datuma.");
            if (dto.Budget < 0)
                throw new ArgumentException("Budzet ne moze biti negativan.");

            var plan = new TravelPlan
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Budget = dto.Budget,
                Notes = dto.Notes,
                UserId = dto.UserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TravelPlans.Add(plan);
            await _context.SaveChangesAsync();
            return MapToDto(plan);
        }

        public async Task<TravelPlanDto?> UpdateTravelPlanAsync(int id, UpdateTravelPlanDto dto)
        {
            var plan = await _context.TravelPlans
                .Include(t => t.Destinations)
                .Include(t => t.Activities)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (plan == null) return null;
            if (dto.EndDate < dto.StartDate)
                throw new ArgumentException("Krajnji datum ne moze biti prije pocetnog datuma.");
            if (dto.Budget < 0)
                throw new ArgumentException("Budzet ne moze biti negativan.");

            plan.Name = dto.Name;
            plan.Description = dto.Description;
            plan.StartDate = dto.StartDate;
            plan.EndDate = dto.EndDate;
            plan.Budget = dto.Budget;
            plan.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return MapToDto(plan);
        }

        public async Task<bool> DeleteTravelPlanAsync(int id)
        {
            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null) return false;
            _context.TravelPlans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUserPlansAsync(int userId)
        {
            var plans = await _context.TravelPlans
                .Where(t => t.UserId == userId)
                .ToListAsync();
            if (!plans.Any()) return true;
            _context.TravelPlans.RemoveRange(plans);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DestinationDto?> GetDestinationAsync(int id)
        {
            var dest = await _context.Destinations.FindAsync(id);
            return dest == null ? null : MapDestinationToDto(dest);
        }

        public async Task<List<DestinationDto>> GetPlanDestinationsAsync(int travelPlanId)
        {
            var destinations = await _context.Destinations
                .Where(d => d.TravelPlanId == travelPlanId)
                .ToListAsync();
            return destinations.Select(MapDestinationToDto).ToList();
        }

        public async Task<DestinationDto> CreateDestinationAsync(CreateDestinationDto dto)
        {
            var destination = new Destination
            {
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Description = dto.Description,
                TravelPlanId = dto.TravelPlanId
            };
            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();
            return MapDestinationToDto(destination);
        }

        public async Task<DestinationDto?> UpdateDestinationAsync(int id, UpdateDestinationDto dto)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null) return null;
            destination.Name = dto.Name;
            destination.Location = dto.Location;
            destination.ArrivalDate = dto.ArrivalDate;
            destination.DepartureDate = dto.DepartureDate;
            destination.Description = dto.Description;
            await _context.SaveChangesAsync();
            return MapDestinationToDto(destination);
        }

        public async Task<bool> DeleteDestinationAsync(int id)
        {
            var destination = await _context.Destinations.FindAsync(id);
            if (destination == null) return false;
            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ActivityDto?> GetActivityAsync(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            return activity == null ? null : MapActivityToDto(activity);
        }

        public async Task<List<ActivityDto>> GetPlanActivitiesAsync(int travelPlanId)
        {
            var activities = await _context.Activities
                .Where(a => a.TravelPlanId == travelPlanId)
                .OrderBy(a => a.Date).ThenBy(a => a.Time)
                .ToListAsync();
            return activities.Select(MapActivityToDto).ToList();
        }

        public async Task<List<ActivityDto>> GetActivitiesByDateAsync(int travelPlanId, DateTime date)
        {
            var activities = await _context.Activities
                .Where(a => a.TravelPlanId == travelPlanId && a.Date.Date == date.Date)
                .OrderBy(a => a.Time)
                .ToListAsync();
            return activities.Select(MapActivityToDto).ToList();
        }

        public async Task<ActivityDto> CreateActivityAsync(CreateActivityDto dto)
        {
            var activity = new Activity
            {
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status,
                TravelPlanId = dto.TravelPlanId
            };
            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();
            return MapActivityToDto(activity);
        }

        public async Task<ActivityDto?> UpdateActivityAsync(int id, UpdateActivityDto dto)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return null;
            activity.Name = dto.Name;
            activity.Date = dto.Date;
            activity.Time = dto.Time;
            activity.Location = dto.Location;
            activity.Description = dto.Description;
            activity.EstimatedCost = dto.EstimatedCost;
            activity.Status = dto.Status;
            await _context.SaveChangesAsync();
            return MapActivityToDto(activity);
        }

        public async Task<bool> DeleteActivityAsync(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return false;
            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SharePlanDto> CreateShareTokenAsync(CreateShareDto dto)
        {
            var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

            var shareToken = new ShareToken
            {
                Token = token,
                AccessType = dto.AccessType,
                TravelPlanId = dto.TravelPlanId,
                ExpiresAt = DateTime.UtcNow.AddDays(dto.ExpiryDays),
                CreatedAt = DateTime.UtcNow
            };

            _context.ShareTokens.Add(shareToken);
            await _context.SaveChangesAsync();

            return new SharePlanDto
            {
                Id = shareToken.Id,
                Token = token,
                AccessType = dto.AccessType,
                TravelPlanId = dto.TravelPlanId,
                ExpiresAt = shareToken.ExpiresAt,
                ShareUrl = $"{GetFrontendUrl()}/shared/{token}"
            };
        }

        public async Task<List<SharePlanDto>> GetPlanSharingsAsync(int travelPlanId)
        {
            var tokens = await _context.ShareTokens
                .Where(s => s.TravelPlanId == travelPlanId && s.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return tokens.Select(s => new SharePlanDto
            {
                Id = s.Id,
                Token = s.Token,
                AccessType = s.AccessType,
                TravelPlanId = s.TravelPlanId,
                ExpiresAt = s.ExpiresAt,
                ShareUrl = $"{GetFrontendUrl()}/shared/{s.Token}"
            }).ToList();
        }

        public async Task<bool> DeleteShareTokenAsync(int id)
        {
            var shareToken = await _context.ShareTokens.FindAsync(id);
            if (shareToken == null) return false;
            _context.ShareTokens.Remove(shareToken);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ShareTokenValidationDto> ValidateShareTokenAsync(string token)
        {
            var shareToken = await _context.ShareTokens
                .FirstOrDefaultAsync(s => s.Token == token);

            if (shareToken == null)
                return new ShareTokenValidationDto { IsValid = false, Message = "Token nije pronađen." };

            if (shareToken.ExpiresAt < DateTime.UtcNow)
                return new ShareTokenValidationDto { IsValid = false, Message = "Token je istekao." };

            return new ShareTokenValidationDto
            {
                IsValid = true,
                AccessType = shareToken.AccessType,
                TravelPlanId = shareToken.TravelPlanId,
                Message = "Token je validan."
            };
        }

        public async Task<TravelPlanDto?> GetPlanByShareTokenAsync(string token)
        {
            var shareToken = await _context.ShareTokens
                .FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);

            if (shareToken == null) return null;
            return await GetTravelPlanAsync(shareToken.TravelPlanId);
        }

        private static TravelPlanDto MapToDto(TravelPlan plan) => new()
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            StartDate = plan.StartDate,
            EndDate = plan.EndDate,
            Budget = plan.Budget,
            Notes = plan.Notes,
            UserId = plan.UserId,
            CreatedAt = plan.CreatedAt,
            Destinations = plan.Destinations.Select(MapDestinationToDto).ToList(),
            Activities = plan.Activities.Select(MapActivityToDto).ToList()
        };

        private static DestinationDto MapDestinationToDto(Destination d) => new()
        {
            Id = d.Id,
            Name = d.Name,
            Location = d.Location,
            ArrivalDate = d.ArrivalDate,
            DepartureDate = d.DepartureDate,
            Description = d.Description,
            TravelPlanId = d.TravelPlanId
        };

        private static ActivityDto MapActivityToDto(Activity a) => new()
        {
            Id = a.Id,
            Name = a.Name,
            Date = a.Date,
            Time = a.Time,
            Location = a.Location,
            Description = a.Description,
            EstimatedCost = a.EstimatedCost,
            Status = a.Status,
            TravelPlanId = a.TravelPlanId
        };
    }
}
