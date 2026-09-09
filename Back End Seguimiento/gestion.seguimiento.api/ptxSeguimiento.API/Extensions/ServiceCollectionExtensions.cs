using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ptxSeguimiento.Application.Interfaces;
using ptxSeguimiento.Application.Mappings;
using ptxSeguimiento.Application.Services;
using ptxSeguimiento.Domain.Interfaces;
using ptxSeguimiento.Infrastructure.Common;
using ptxSeguimiento.Infrastructure.Configurations;
using ptxSeguimiento.Infrastructure.Repositories;
using ptxSeguimiento.Infrastructure.Security;

namespace ptxSeguimiento.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddConexion(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<ConnectionStrings>(configuration.GetSection(ConnectionStrings.SectionName));
            services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        }

        public static void AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();
            services.AddScoped<IUsuariosRepository, UsuariosRepository>();
            services.AddScoped<ISistemasRepository, SistemasRepository>();
            services.AddScoped<IEquipoRepository, EquipoRepository>();
            services.AddScoped<ITicketsRepository, TicketsRepository>();
            services.AddScoped<IDashboardRepository, DashboardRepository>();
            services.AddScoped<IJwtService, JwtService>();
        }

        public static void AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ISistemasService, SistemasService>();
            services.AddScoped<IEquipoService, EquipoService>();
            services.AddScoped<ITicketsService, TicketsService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IUsuariosService, UsuariosService>();
        }

        public static void AddMappings(this IServiceCollection services)
        {
            services.AddAutoMapper(typeof(SeguimientoProfile).Assembly);
        }

        public static void AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtSection = configuration.GetSection(JwtSettings.SectionName);
            var jwtSettings = jwtSection.Get<JwtSettings>() ?? new JwtSettings();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                    ClockSkew = TimeSpan.Zero
                };
            });

            services.AddAuthorization();
        }

        public static void AddPresentationServices(this IServiceCollection services, string corsPolicyName)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(corsPolicyName, builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyHeader()
                           .AllowAnyMethod();
                });
            });

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new()
                {
                    Title = "ptxSeguimiento API",
                    Version = "v1"
                });

                // Nota: el botón "Authorize" de Swagger UI con el candado de JWT se
                // quitó porque su sintaxis depende de la versión exacta del paquete
                // Microsoft.OpenApi que trae Swashbuckle.AspNetCore, y cambió entre
                // versiones. La autenticación JWT de los endpoints sigue funcionando
                // igual; para probar endpoints protegidos desde Swagger/Postman,
                // agrega manualmente el header "Authorization: Bearer {token}".
            });
        }
    }
}
