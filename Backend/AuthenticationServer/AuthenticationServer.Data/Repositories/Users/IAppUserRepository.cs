using AuthenticationServer.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthenticationServer.Data.Repositories.Users;

public interface IAppUserRepository
{
    Task<AppUser> GetByUserName(string userName);

    Task Add(AppUser user);

    Task<bool> UserExists(string userName);
    Task<AppUser> GetById(Guid id);
    Task<IEnumerable<AppUser>> GetAllUsers();
    //Task AddOnlineUser(AppUser user);
    //Task RemoveOnlineUser(AppUser user);
    //Task<IEnumerable<AppUser>> GetOnlineUsers();


}
