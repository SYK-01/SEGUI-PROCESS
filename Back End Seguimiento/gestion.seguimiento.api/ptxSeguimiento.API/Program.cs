using ptxSeguimiento.API.Extensions;
using ptxSeguimiento.API.Middleware;

var corsPolicy = "_seguimientoAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Mantiene los nombres originales (PascalCase)
    });

builder.Services.AddConexion(builder.Configuration);
builder.Services.AddRepositories();
builder.Services.AddApplicationServices();
builder.Services.AddMappings();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddPresentationServices(corsPolicy);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(corsPolicy);

app.UseHttpsRedirection();

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
