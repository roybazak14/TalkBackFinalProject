using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Models.Response
{
    public class AuthenticatedUserResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime accessTokenExpiration { get; set; }
    }
}
