using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.ServiceFabric.Services.Runtime;
using ExpenseService.Data;
using ExpenseService.Services;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<ExpenseDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

builder.Services.AddScoped<ExpenseManagementService>();

var host = builder.Build();

ServiceRuntime.RegisterServiceAsync("ExpenseServiceType",
    context => new ExpenseService.ExpenseService(context, host.Services))
    .GetAwaiter().GetResult();

Thread.Sleep(Timeout.Infinite);
