using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.DTOs;
using ChecklistService.Data;
using ChecklistService.Models;

namespace ChecklistService.Services
{
    public class ChecklistManagementService
    {
        private readonly ChecklistDbContext _context;

        public ChecklistManagementService(ChecklistDbContext context)
        {
            _context = context;
        }

        public async Task<ChecklistItemDto?> GetItemAsync(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<List<ChecklistItemDto>> GetPlanItemsAsync(int travelPlanId)
        {
            var items = await _context.ChecklistItems
                .Where(c => c.TravelPlanId == travelPlanId)
                .OrderBy(c => c.IsCompleted)
                .ThenBy(c => c.CreatedAt)
                .ToListAsync();
            return items.Select(MapToDto).ToList();
        }

        public async Task<ChecklistItemDto> CreateItemAsync(CreateChecklistItemDto dto)
        {
            var item = new ChecklistItem
            {
                Name = dto.Name,
                IsCompleted = false,
                TravelPlanId = dto.TravelPlanId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChecklistItems.Add(item);
            await _context.SaveChangesAsync();
            return MapToDto(item);
        }

        public async Task<ChecklistItemDto?> UpdateItemAsync(int id, UpdateChecklistItemDto dto)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null) return null;

            item.Name = dto.Name;
            item.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();
            return MapToDto(item);
        }

        public async Task<ChecklistItemDto?> ToggleItemAsync(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null) return null;

            item.IsCompleted = !item.IsCompleted;
            await _context.SaveChangesAsync();
            return MapToDto(item);
        }

        public async Task<bool> DeleteItemAsync(int id)
        {
            var item = await _context.ChecklistItems.FindAsync(id);
            if (item == null) return false;

            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePlanItemsAsync(int travelPlanId)
        {
            var items = await _context.ChecklistItems
                .Where(c => c.TravelPlanId == travelPlanId)
                .ToListAsync();

            if (!items.Any()) return true;

            _context.ChecklistItems.RemoveRange(items);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ChecklistItemDto MapToDto(ChecklistItem c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            IsCompleted = c.IsCompleted,
            TravelPlanId = c.TravelPlanId,
            CreatedAt = c.CreatedAt
        };
    }
}
