using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Runtime;
using ChecklistService.Data;
using ChecklistService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ChecklistDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

builder.Services.AddScoped<ChecklistManagementService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ChecklistDbContext>();
    db.Database.Migrate();
}

ServiceRuntime.RegisterServiceAsync("ChecklistServiceType",
    context =>
    {
        var serviceProvider = app.Services;
        return new ChecklistService.ChecklistService(context, serviceProvider);
    }).GetAwaiter().GetResult();

await Task.Delay(Timeout.Infinite);