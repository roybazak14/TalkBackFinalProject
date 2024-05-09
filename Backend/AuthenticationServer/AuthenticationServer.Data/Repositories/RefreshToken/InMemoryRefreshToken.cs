using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AuthenticationServer.Data.Exceptions;
using AuthenticationServer.Models.Entities;


namespace AuthenticationServer.Data.Repositories.RefreshToken
{
    public class InMemoryRefreshTokenRepository : IRefreshTokenRepository
    {
        private static readonly Dictionary<string, string> _refreshTokens = new Dictionary<string, string>();

        public Task Create(RefreshTokenModel refreshToken, AppUser user)
        {
            refreshToken.Id = Guid.NewGuid();
            if (_refreshTokens.ContainsKey(user.UserName))
                _refreshTokens[user.UserName] = refreshToken.Token;
            else
                _refreshTokens.Add(user.UserName, refreshToken.Token);
            return Task.CompletedTask;
        }

        public Task Delete(AppUser user)
        {
            if (_refreshTokens.ContainsKey(user.UserName))
                _refreshTokens.Remove(user.UserName);
            return Task.CompletedTask;
        }



        public Task<string> GetByToken(string token)
        {
            if (_refreshTokens.ContainsValue(token))
            {
                var userName = _refreshTokens.FirstOrDefault(x => x.Value == token).Key;
                return Task.FromResult(userName);
            }
            throw new EntityNotFoundException("Refresh token not found");
        }



        public Task Update(AppUser user, string refreshToken)
        {
            _refreshTokens[user.UserName] = refreshToken;
            return Task.CompletedTask;
        }
    }
}
