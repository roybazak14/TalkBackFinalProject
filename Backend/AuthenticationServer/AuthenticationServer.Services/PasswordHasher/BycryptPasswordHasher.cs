using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Services.PasswordHasher
{
    public class BycryptPasswordHasher : IPasswordHasher
    {
        public string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool Verify(string text, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(text, hash);
        }
    }
}
