using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ptxSeguimiento.Domain.Entities;
using ptxSeguimiento.Domain.Interfaces;
using ptxSeguimiento.Infrastructure.Configurations;

namespace ptxSeguimiento.Infrastructure.Security
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;

        public JwtService(IOptions<JwtSettings> options)
        {
            _settings = options.Value;
        }

        public string GenerarToken(Usuario usuario)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.NameId, usuario.Cod_Usuario.ToString()),
                new(ClaimTypes.Name, usuario.Nom_Usuario ?? string.Empty),
                new("nom_completo", usuario.Nom_Completo ?? string.Empty),
                new(ClaimTypes.Role, usuario.Rol ?? "Usuario"),
                // Base del acceso por usuario: los controladores usan este claim para
                // filtrar a "lo suyo" cuando el rol no es Admin (ver TicketsController /
                // DashboardController). Se manda vacío (no "0") cuando no hay vínculo,
                // para que int.TryParse falle de forma segura en vez de matchear Cod_Miembro=0.
                new("cod_miembro", usuario.Cod_Miembro?.ToString() ?? string.Empty)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_settings.ExpireMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
