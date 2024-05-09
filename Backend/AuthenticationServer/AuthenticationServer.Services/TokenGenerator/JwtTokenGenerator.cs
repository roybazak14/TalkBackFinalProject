using AuthenticationServer.Models;
using AuthenticationServer.Models.Entities;
using AuthenticationServer.Services.TokenGenerator;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Security;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Services.TokenGenerators.TokenGenerator
{
    public class JwtTokenGenerator(AuthenticationConfiguration configuration) : ITokenGenerator
    {
        public string GenerateToken(AppUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.AccessTokenSecret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new Claim[] { new Claim(ClaimTypes.Name, user.UserName) };
            var utcExpiration = DateTime.UtcNow.AddMinutes(configuration.AccessTokenExpirationMinutes);
            var token = new JwtSecurityToken(
                issuer: configuration.Issuer,
                audience: configuration.Audience,
                claims: claims,
                expires: utcExpiration,
                signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
