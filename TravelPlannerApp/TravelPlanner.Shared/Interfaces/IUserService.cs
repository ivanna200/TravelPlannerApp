using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.DTOs;

namespace TravelPlanner.Shared.Interfaces
{
    public interface IUserService : IService
    {
        Task<AuthResultDto> RegisterAsync(RegisterDto dto);
        Task<AuthResultDto> LoginAsync(LoginDto dto);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<bool> DeleteUserAsync(int id);
        Task<UserDto?> ChangeUserRoleAsync(int id, string role);
    }
}