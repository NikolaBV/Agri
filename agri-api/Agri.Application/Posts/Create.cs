using System.Linq;
using Agri.Application.Core;
using Agri.Application.Interfaces;
using Agri.Domain.Entities;
using Agri.Persistence;
using AutoMapper;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Agri.Application.Posts;

public class Create
{
    public class Command : IRequest<Result<PostDto>>
    {
        public string Title { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public string Summary { get; init; } = string.Empty;
        public bool IsPublished { get; init; } = true;
        public List<string>? Tags { get; init; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(160);
            RuleFor(x => x.Content).NotEmpty();
            RuleFor(x => x.Summary).NotEmpty().MaximumLength(280);
        }
    }

    public class Handler : IRequestHandler<Command, Result<PostDto>>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;
        private readonly IMapper _mapper;

        public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper)
        {
            _context = context;
            _userAccessor = userAccessor;
            _mapper = mapper;
        }

        public async Task<Result<PostDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var userId = _userAccessor.GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Result<PostDto>.Failure("Unauthorized");
            }

            var author = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (author is null)
            {
                return Result<PostDto>.Failure("Author not found");
            }

            var post = new Post
            {
                Id = Guid.NewGuid(),
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                Summary = request.Summary.Trim(),
                IsPublished = request.IsPublished,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AuthorId = author.Id,
                Author = author,
            };

            var tags = await ResolveTagsAsync(request.Tags ?? new List<string>(), cancellationToken);
            foreach (var tag in tags)
            {
                post.PostTags.Add(new PostTag { Post = post, Tag = tag });
            }

            _context.Posts.Add(post);

            var success = await _context.SaveChangesAsync(cancellationToken) > 0;
            if (!success)
            {
                return Result<PostDto>.Failure("Failed to create post");
            }

            return Result<PostDto>.Success(_mapper.Map<PostDto>(post));
        }

        private async Task<List<Tag>> ResolveTagsAsync(IEnumerable<string> tagNames, CancellationToken cancellationToken)
        {
            var tags = new List<Tag>();
            foreach (var name in tagNames.Where(n => !string.IsNullOrWhiteSpace(n)))
            {
                var trimmed = name.Trim();
                var existing = await _context.Tags.FirstOrDefaultAsync(
                    t => t.Name.ToLower() == trimmed.ToLower(),
                    cancellationToken
                );
                if (existing is null)
                {
                    existing = new Tag { Id = Guid.NewGuid(), Name = trimmed };
                    _context.Tags.Add(existing);
                }

                tags.Add(existing);
            }

            return tags;
        }
    }
}

