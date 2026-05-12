using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Runtime;
using UserService.Data;
using UserService.Services;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

// Services
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

// Automatska migracija pri pokretanju
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Service Fabric Remoting
ServiceRuntime.RegisterServiceAsync("UserServiceType",
    context =>
    {
        var serviceProvider = app.Services;
        return new UserService.UserService(context, serviceProvider);
    }).GetAwaiter().GetResult();

await Task.Delay(Timeout.Infinite);