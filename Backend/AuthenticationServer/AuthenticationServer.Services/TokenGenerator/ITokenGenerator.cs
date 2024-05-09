using AuthenticationServer.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Services.TokenGenerator
{
    public interface ITokenGenerator
    {
        string GenerateToken(AppUser user);
    }
}
