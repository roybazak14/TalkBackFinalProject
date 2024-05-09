using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Api.Exceptions
{
    public class RefreshTokenException : Exception
    {
        public RefreshTokenException(string message) : base(message)
        {
        }
    }
}
