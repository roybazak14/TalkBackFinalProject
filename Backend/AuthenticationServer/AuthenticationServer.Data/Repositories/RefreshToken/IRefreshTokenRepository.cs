using AuthenticationServer.Models.Entities;

public interface IRefreshTokenRepository
{
    Task Create(RefreshTokenModel refreshToken, AppUser user);
    Task<string> GetByToken(string token);
    Task Update(AppUser user, string refreshToken);
    Task Delete(AppUser user);
}
