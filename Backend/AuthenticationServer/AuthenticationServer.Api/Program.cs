using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using AuthenticationServer.Data;
using AuthenticationServer.Data.Repositories.RefreshToken;
using AuthenticationServer.Data.Repositories.Users;
using AuthenticationServer.Models;
using AuthenticationServer.Services.AuthenticateService;
using AuthenticationServer.Services.Authenticators;
using AuthenticationServer.Services.PasswordHasher;
using AuthenticationServer.Services.RefreshToken;
using AuthenticationServer.Services.TokenGenerator;
using AuthenticationServer.Services.TokenGenerators.TokenGenerator;
using AuthenticationServer.Services.TokenValidators;
using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<AuthenticationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultDb")));

var authenticationConfiguration = new AuthenticationConfiguration();
builder.Configuration.Bind("Authentication", authenticationConfiguration);
builder.Services.AddSingleton(authenticationConfiguration);
builder.Services.AddScoped<RefreshTokenValidators>();
builder.Services.AddScoped<IRefreshTokenRepository, InMemoryRefreshTokenRepository>();
builder.Services.AddScoped<Authenticator>();

builder.Services.AddTransient<IAppUserRepository, AppUserRepository>();
builder.Services.AddTransient<IRefreshTokenGenerator, RefreshTokenGenerator>();
builder.Services.AddTransient<ITokenGenerator, JwtTokenGenerator>();
builder.Services.AddTransient<IPasswordHasher, BycryptPasswordHasher>();
builder.Services.AddTransient<IAuthenticationService, AuthenticationService>();

// Add authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => options.TokenValidationParameters =
    new TokenValidationParameters
    {
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authenticationConfiguration.AccessTokenSecret)),
        ValidIssuer = authenticationConfiguration.Issuer,
        ValidAudience = authenticationConfiguration.Audience,
        ValidateIssuerSigningKey = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ClockSkew = TimeSpan.Zero
    });

// Add controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowCors", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowCors"); // Apply CORS middleware before authentication and authorization

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

app.Run();
