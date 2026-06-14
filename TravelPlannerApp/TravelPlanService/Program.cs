using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelPlanService.Data;
using TravelPlanService.Services;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<TravelPlanDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

builder.Services.AddScoped<TravelPlanningService>();

var host = builder.Build();

ServiceRuntime.RegisterServiceAsync("TravelPlanServiceType",
    context => new TravelPlanService.TravelPlanService(context, host.Services))
    .GetAwaiter().GetResult();

Thread.Sleep(Timeout.Infinite);
