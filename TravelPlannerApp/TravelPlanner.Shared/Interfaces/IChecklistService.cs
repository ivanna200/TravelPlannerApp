using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.DTOs;

namespace TravelPlanner.Shared.Interfaces
{
    public interface IChecklistService : IService
    {
        Task<ChecklistItemDto?> GetItemAsync(int id);
        Task<List<ChecklistItemDto>> GetPlanItemsAsync(int travelPlanId);
        Task<ChecklistItemDto> CreateItemAsync(CreateChecklistItemDto dto);
        Task<ChecklistItemDto?> UpdateItemAsync(int id, UpdateChecklistItemDto dto);
        Task<ChecklistItemDto?> ToggleItemAsync(int id);
        Task<bool> DeleteItemAsync(int id);
        Task<bool> DeletePlanItemsAsync(int travelPlanId);
    }
}
