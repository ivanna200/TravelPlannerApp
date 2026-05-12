using Microsoft.EntityFrameworkCore;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelPlanService.Data;
using TravelPlanService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TravelPlanDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

builder.Services.AddScoped<TravelPlanningService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TravelPlanDbContext>();
    db.Database.Migrate();
}

ServiceRuntime.RegisterServiceAsync("TravelPlanServiceType",
    context =>
    {
        var serviceProvider = app.Services;
        return new TravelPlanService.TravelPlanService(context, serviceProvider);
    }).GetAwaiter().GetResult();

await Task.Delay(Timeout.Infinite);