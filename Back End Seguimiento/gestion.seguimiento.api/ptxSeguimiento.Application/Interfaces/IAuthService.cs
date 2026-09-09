using ptxSeguimiento.Application.DTOs.Responses;

namespace ptxSeguimiento.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse> Login(string Nom_Usuario, string Pwd_Usuario);
    }
}
