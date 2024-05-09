using System.ComponentModel.DataAnnotations;

namespace AuthenticationServer.Api.Models.Requests
{
    public class ValidateRequest
    {
        [Required]
        public string AccessToken { get; set; } = null!;
    }
}
