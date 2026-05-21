using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Runtime;
using UserService.Data;
using UserService.Models;
using UserService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

builder.Services.AddScoped<AuthService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Users.Any(u => u.Email == "admin@admin.com"))
    {
        db.Users.Add(new User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@admin.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow,
        });
        db.SaveChanges();
    }
}

ServiceRuntime.RegisterServiceAsync("UserServiceType",
    context =>
    {
        var serviceProvider = app.Services;
        return new UserService.UserService(context, serviceProvider);
    }).GetAwaiter().GetResult();

await Task.Delay(Timeout.Infinite);