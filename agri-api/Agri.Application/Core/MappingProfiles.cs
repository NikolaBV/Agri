using System.Linq;
using Agri.Application.Posts;
using Agri.Application.Tags;
using Agri.Domain.Entities;
using AutoMapper;

namespace Agri.Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Post, PostDto>()
            .ForMember(
                dest => dest.Author,
                opt =>
                    opt.MapFrom(src =>
                        new PostAuthorDto(
                            src.AuthorId,
                            src.Author != null && !string.IsNullOrWhiteSpace(src.Author.DisplayName)
                                ? src.Author.DisplayName
                                : src.Author != null
                                    ? (src.Author.UserName ?? string.Empty)
                                    : string.Empty
                        )
                    )
            )
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.PostTags.Select(pt => pt.Tag.Name)));

        CreateMap<Tag, TagDto>();
    }
}

