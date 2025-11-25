using System.Text.Json.Serialization;

namespace Agri.Domain.Entities;

public class Tag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<PostTag> PostTags { get; set; } = new List<PostTag>();
}

