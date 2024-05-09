using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Data.Exceptions
{
    public class DatabaseException : Exception
    {
        public DatabaseException(string? message = null, Exception? inner = null) : base(message, inner) { }
    }
    public class EntityNotFoundException : DatabaseException
    {
        public EntityNotFoundException(string? message = null, Exception? inner = null) : base(message, inner) { }
    }
    public class DuplicateEntityException : DatabaseException
    { 
        public DuplicateEntityException(string? message = null, Exception? inner = null) : base(message, inner) { }
    }
}
