﻿using System.ComponentModel.DataAnnotations;

namespace AuthenticationServer.Api.Models.Requests
{
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
