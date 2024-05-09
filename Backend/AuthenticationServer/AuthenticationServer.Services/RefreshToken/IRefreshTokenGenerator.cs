using AuthenticationServer.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Services.RefreshToken
{
    public interface IRefreshTokenGenerator
    {
        string GenerateToken();

    }
}
