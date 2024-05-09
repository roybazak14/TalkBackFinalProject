namespace AuthenticationServer.Services.AuthenticateService
{
    public interface IAuthenticationService
    {
        Task<string> Login(string username, string password);
        Task Register(string username, string password);
        Task<string> Refresh(string refreshToken);
        Task Logout(Guid Id);
        Task<bool> ValidateToken(string token);
    }
}
