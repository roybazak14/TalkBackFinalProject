using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Api.Exceptions
{
    public class AuthenticationException : Exception
    {
        public AuthenticationException(string message) : base(message)
        {

        }
    }
}
