using AuthenticationServer.Models.Entities;
using AuthenticationServer.Models;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AuthenticationServer.Data.Exceptions;
using AuthenticationServer.Data.Repositories.RefreshToken;

namespace AuthenticationServer.Services.RefreshToken
{
    public class RefreshTokenGenerator(AuthenticationConfiguration configuration) : IRefreshTokenGenerator
    {
        public string GenerateToken()
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.RefreshTokenSecret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var utcExpiration = DateTime.UtcNow.AddMinutes(configuration.RefreshTokenExpirationMinutes);
            var token = new JwtSecurityToken(
                issuer: configuration.Issuer,
                audience: configuration.Audience,
                expires: utcExpiration,
                signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }



    }
}
