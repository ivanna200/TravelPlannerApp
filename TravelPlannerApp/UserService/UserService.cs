using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using TravelPlanner.Shared.DTOs;
using TravelPlanner.Shared.Interfaces;
using UserService.Data;
using UserService.Services;

namespace UserService
{
    internal sealed class UserService : StatelessService, IUserService
    {
        private readonly IServiceProvider _serviceProvider;

        public UserService(StatelessServiceContext context, IServiceProvider serviceProvider)
            : base(context)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<AuthService>();
            return await svc.RegisterAsync(dto);
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto dto)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<AuthService>();
            return await svc.LoginAsync(dto);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<AuthService>();
            return await svc.GetUserByIdAsync(id);
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<AuthService>();
            return await svc.GetAllUsersAsync();
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<AuthService>();
            return await svc.DeleteUserAsync(id);
        }

        public async Task<UserDto?> ChangeUserRoleAsync(int id, string role)
        {
            using var scope = _serviceProvider.CreateScope();
            var svc = scope.ServiceProvider.GetRequiredService<AuthService>();
            return await svc.ChangeUserRoleAsync(id, role);
        }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingInstanceListeners();
        }
    }
}