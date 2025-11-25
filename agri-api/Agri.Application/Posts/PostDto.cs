using System.Collections.Generic;

namespace Agri.Application.Posts;

public record PostAuthorDto(string Id, string DisplayName);

public class PostDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public string Summary { get; init; } = string.Empty;
    public bool IsPublished { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public PostAuthorDto? Author { get; init; }
    public List<string> Tags { get; init; } = new();
}

