using System.Text.Json.Serialization;

namespace Agri.Domain.Entities;

public class Post
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string AuthorId { get; set; } = string.Empty;

    [JsonIgnore]
    public AppUser Author { get; set; }

    [JsonIgnore]
    public ICollection<PostTag> PostTags { get; set; } = new List<PostTag>();
}

