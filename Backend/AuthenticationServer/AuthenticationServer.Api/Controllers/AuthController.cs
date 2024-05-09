using AuthenticationServer.Api.Exceptions;
using AuthenticationServer.Api.Models.Requests;
using AuthenticationServer.Data.Repositories.Users;
using AuthenticationServer.Models;
using AuthenticationServer.Models.Entities;
using AuthenticationServer.Models.Response;
using AuthenticationServer.Services.AuthenticateService;
using AuthenticationServer.Services.Authenticators;
using AuthenticationServer.Services.TokenValidators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LoginRequest = AuthenticationServer.Api.Models.Requests.LoginRequest;
using RegisterRequest = AuthenticationServer.Api.Models.Requests.RegisterRequest;

namespace AuthenticationServer.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthenticationService _service;
        private readonly IAppUserRepository _appUserRepository;
        private readonly Authenticator _authenticator;
        private readonly RefreshTokenValidators _validator;
        private readonly IRefreshTokenRepository _refreshRepository;

        private readonly AuthenticationConfiguration _configuration;

        public AuthController(
            IAuthenticationService service,
            IAppUserRepository appUserRepository,
            Authenticator authenticator,
            RefreshTokenValidators validator,
            IRefreshTokenRepository refreshRepository,
            AuthenticationConfiguration configuration)
        {
            _service = service;
            _appUserRepository = appUserRepository;
            _authenticator = authenticator;
            _validator = validator;
            _refreshRepository = refreshRepository;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid || !request.ConfirmPassword.Equals(request.Password))
                return BadRequest();
            try
            {
                await _service.Register(request.UserName, request.Password);
                return Ok();
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest();

            try
            {
                var user = await _appUserRepository.GetByUserName(request.Username);
                var response = await _authenticator.Authenticate(request.Username, request.Password);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return Problem("Login Failed");
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest();

            try
            {
                bool valid = _validator.Validate(request.RefreshToken);
                if (!valid)
                    throw new RefreshTokenException("Invalid or expired refresh token");

                var refreshTokenModel = await _refreshRepository.GetByToken(request.RefreshToken);
                if (refreshTokenModel == null)
                {
                    throw new RefreshTokenException("Invalid refresh token");
                }

                var newAccessToken = await _service.Refresh(request.RefreshToken);

                if (string.IsNullOrEmpty(newAccessToken))
                    throw new RefreshTokenException("Failed to generate new access token");
                var accessTokenExpiration = DateTime.UtcNow.AddMinutes(_configuration.AccessTokenExpirationMinutes);


                return Ok(new AuthenticatedUserResponse
                {
                    RefreshToken = request.RefreshToken,
                    AccessToken = newAccessToken,
                    accessTokenExpiration = accessTokenExpiration
                });
            }
            catch (Exception e)
            {
                throw new RefreshTokenException(e.Message);
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var name = HttpContext.User.FindFirstValue(ClaimTypes.Name);
            if (name == null)
                return NotFound("User not found");

            var user = await _appUserRepository.GetByUserName(name);
            if (user == null)
                return NotFound("User not found");

            try
            {
                await _refreshRepository.Delete(user);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error logging out: {ex.Message}");
            }
        }

        [HttpGet("validate")]
        public async Task<IActionResult> Validate(ValidateRequest request)
        {
            var accessToken = request.AccessToken;
            bool isValid = await _service.ValidateToken(accessToken);
            if(!isValid)
                return BadRequest();
            return Ok(accessToken);
        }
    

        [HttpGet("all-users")]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetAllUsers()
        {
            try
            {
                var allUsers = await _appUserRepository.GetAllUsers();
                return Ok(allUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching data: {ex.Message}");
            }
        }


    }
}
