using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AuthenticationServer.Data.Exceptions;
using AuthenticationServer.Data.Repositories.Users;
using AuthenticationServer.Models;
using AuthenticationServer.Models.Entities;
using AuthenticationServer.Services.PasswordHasher;
using AuthenticationServer.Services.TokenGenerator;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AuthenticationServer.Services.AuthenticateService
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IAppUserRepository _appUserRepository;
        private readonly IPasswordHasher _hasher;
        private readonly ITokenGenerator _tokenGenerator;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly AuthenticationConfiguration _configuration;

        public AuthenticationService(IAppUserRepository appUserRepository, IPasswordHasher hasher, ITokenGenerator tokenGenerator, IRefreshTokenRepository tokenRepositor)
        {
            _appUserRepository = appUserRepository;
            _hasher = hasher;
            _tokenGenerator = tokenGenerator;
            _refreshTokenRepository = tokenRepositor;
        }

        public async Task<string> Login(string username, string password)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(username);
            ArgumentException.ThrowIfNullOrWhiteSpace(password);

            if ((await _appUserRepository.UserExists(username)) == false)
                throw new InvalidOperationException("User not found.");

            var user = await _appUserRepository.GetByUserName(username);
            if (!_hasher.Verify(password, user.PasswordHash))
                throw new InvalidOperationException("Wrong password.");

            return _tokenGenerator.GenerateToken(user);
        }

        public async Task Register(string username, string password)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(username);
            ArgumentException.ThrowIfNullOrWhiteSpace(password);
            if (await _appUserRepository.UserExists(username))
                throw new InvalidOperationException("Username Already Exists.");
            var user = new AppUser
            {
                UserName = username,
                PasswordHash = _hasher.Hash(password)
            };
            try
            {
                await _appUserRepository.Add(user);
            }
            catch (DatabaseException ex)
            {
                throw new InvalidOperationException("database error", ex);
            }

        }
        public async Task<string> Refresh(string refreshToken)
        {
            var userName = await _refreshTokenRepository.GetByToken(refreshToken);
            if (_refreshTokenRepository == null)
                return string.Empty;
            var user = await _appUserRepository.GetByUserName(userName);
            return _tokenGenerator.GenerateToken(user);
        }


        public async Task Logout(Guid Id)
        {
            var user = await _appUserRepository.GetById(Id);
            if (user == null)
                throw new EntityNotFoundException("User not found.");
            await _refreshTokenRepository.Delete(user);

        }

        public async Task<bool> ValidateToken(string token)
        {
            if (token == null)
                throw new ArgumentNullException("token");

            TokenValidationParameters validationParameters = new TokenValidationParameters
            {
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.RefreshTokenSecret)),
                ValidIssuer = _configuration.Issuer,
                ValidAudience = _configuration.Audience,
                ValidateIssuerSigningKey = true,
                ValidateIssuer = true,
                ValidateAudience = true,
                ClockSkew = TimeSpan.Zero
            };
            try
            {
                var principal = await new JwtSecurityTokenHandler().ValidateTokenAsync(token, validationParameters);
                return principal.IsValid;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
