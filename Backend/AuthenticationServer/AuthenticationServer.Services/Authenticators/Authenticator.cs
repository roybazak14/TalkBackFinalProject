using AuthenticationServer.Data.Repositories.RefreshToken;
using AuthenticationServer.Data.Repositories.Users;
using AuthenticationServer.Models;
using AuthenticationServer.Models.Entities;
using AuthenticationServer.Models.Response;
using AuthenticationServer.Services.AuthenticateService;
using AuthenticationServer.Services.RefreshToken;
using AuthenticationServer.Services.TokenValidators;
using Azure.Core;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Services.Authenticators
{
    public class Authenticator
    {
        private readonly IAuthenticationService _service;
        private readonly IRefreshTokenGenerator _rGenerator;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IAppUserRepository _userRepos;
        private readonly AuthenticationConfiguration _configuration;

        public Authenticator(IAuthenticationService service, IRefreshTokenGenerator rGenerator, IRefreshTokenRepository refreshTokenRepository, IAppUserRepository userRepos, AuthenticationConfiguration configuration)
        {
            _service = service;
            _rGenerator = rGenerator;
            _refreshTokenRepository = refreshTokenRepository;
            _userRepos = userRepos;
            _configuration = configuration;
        }

        public async Task<AuthenticatedUserResponse> Authenticate(string userName, string password)
        {
            var accessToken = await _service.Login(userName, password);

            var user = await _userRepos.GetByUserName(userName);

            if (user == null)
            {
                
                throw new Exception("User not found");
            }

            var refreshToken = _rGenerator.GenerateToken();

            var refreshTokenModel = new RefreshTokenModel
            {
                Token = refreshToken,
            };

            await _refreshTokenRepository.Create(refreshTokenModel, user);

            var accessTokenExpiration = DateTime.UtcNow.AddMinutes(_configuration.AccessTokenExpirationMinutes);


            return new AuthenticatedUserResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                accessTokenExpiration = accessTokenExpiration

            };
        }


    }
}
