using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;
using System.Text;

namespace ApiGateway
{
    internal sealed class ApiGateway : StatelessService
    {
        public ApiGateway(StatelessServiceContext context)
            : base(context) { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        var builder = WebApplication.CreateBuilder();

                        builder.Services.AddSingleton(serviceContext);
                        builder.WebHost.UseKestrel()
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url);

                        builder.Services.AddControllers();
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();

                        // CORS - dozvoli oba porta
                        builder.Services.AddCors(options =>
                        {
                            options.AddPolicy("AllowFrontend", policy =>
                            {
                                policy.WithOrigins(
                                        "http://localhost:5173",
                                        "http://localhost:5174",
                                        "http://localhost:5175"
                                      )
                                      .AllowAnyHeader()
                                      .AllowAnyMethod();
                            });
                        });

                        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
                        var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret nije konfigurisan.");

                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                            .AddJwtBearer(options =>
                            {
                                options.TokenValidationParameters = new TokenValidationParameters
                                {
                                    ValidateIssuer = true,
                                    ValidateAudience = true,
                                    ValidateLifetime = true,
                                    ValidateIssuerSigningKey = true,
                                    ValidIssuer = jwtSettings["Issuer"],
                                    ValidAudience = jwtSettings["Audience"],
                                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
                                };
                            });

                        builder.Services.AddAuthorization();

                        var app = builder.Build();

                        app.UseSwagger();
                        app.UseSwaggerUI();
                        app.UseCors("AllowFrontend");
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.MapControllers();

                        return app;
                    }))
            };
        }
    }
}