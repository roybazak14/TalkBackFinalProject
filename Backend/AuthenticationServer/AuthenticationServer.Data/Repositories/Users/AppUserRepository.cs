using AuthenticationServer.Data.Exceptions;
using AuthenticationServer.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthenticationServer.Data.Repositories.Users;

public class AppUserRepository(AuthenticationDbContext context)
    : IAppUserRepository
{
    public async Task Add(AppUser user)
    {
        if (await UserExists(user.UserName))
            throw new DuplicateEntityException();
        try
        {
            await context.AppUsers.AddAsync(user);
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new DatabaseException("database error", ex);
        }
    }

    public async Task<IEnumerable<AppUser>> GetAllUsers()
    {
        var allUsers = await context.AppUsers.ToListAsync();
        if (allUsers == null)
            throw new EntityNotFoundException();
        return allUsers;
    }

    public async Task<AppUser> GetById(Guid id)
    {
        var user = await context.AppUsers.FindAsync(id);
        if (user == null)
            throw new EntityNotFoundException();
        return user;
    }

    public async Task<AppUser> GetByUserName(string userName)
    {
        var user = await context.AppUsers.SingleOrDefaultAsync(u => u.UserName == userName);
        if (user == null)
            throw new EntityNotFoundException();
        return user;
    }

    public async Task<bool> UserExists(string userName)
    {
        return await context.AppUsers.AnyAsync(u => u.UserName == userName);
    }
}
