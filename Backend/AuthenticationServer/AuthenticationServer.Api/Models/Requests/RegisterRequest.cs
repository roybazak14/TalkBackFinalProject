using System.ComponentModel.DataAnnotations;

namespace AuthenticationServer.Api.Models.Requests
{
    public class RegisterRequest
    {
        [Required]
        [RegularExpression(@"^[\w]{5,20}$")]
        public string UserName { get; set; } = null!;
        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$")]
        public string Password { get; set; } = null!;
        public string ConfirmPassword { get; set; } = null!;
    }
}
