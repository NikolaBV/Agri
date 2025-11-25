using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Agri.Domain.Entities;

public class AppUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}

