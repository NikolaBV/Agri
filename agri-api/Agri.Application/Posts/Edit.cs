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

public class Edit
{
    public record Command : IRequest<Result<PostDto>>
    {
        public Guid Id { get; init; }
        public string? Title { get; init; }
        public string? Content { get; init; }
        public string? Summary { get; init; }
        public bool? IsPublished { get; init; }
        public List<string>? Tags { get; init; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Title).MaximumLength(160);
            RuleFor(x => x.Summary).MaximumLength(280);
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
            var post = await _context
                .Posts.Include(p => p.Author)
                .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (post is null)
            {
                return Result<PostDto>.Failure("Post not found");
            }

            var userId = _userAccessor.GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(userId) || post.AuthorId != userId)
            {
                return Result<PostDto>.Failure("Unauthorized");
            }

            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                post.Title = request.Title.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Content))
            {
                post.Content = request.Content.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Summary))
            {
                post.Summary = request.Summary.Trim();
            }

            if (request.IsPublished.HasValue)
            {
                post.IsPublished = request.IsPublished.Value;
            }

            if (request.Tags is not null)
            {
                _context.PostTags.RemoveRange(post.PostTags);
                post.PostTags.Clear();

                var tags = await ResolveTagsAsync(request.Tags, cancellationToken);
                foreach (var tag in tags)
                {
                    post.PostTags.Add(new PostTag { Post = post, Tag = tag });
                }
            }

            post.UpdatedAt = DateTime.UtcNow;

            var success = await _context.SaveChangesAsync(cancellationToken) > 0;
            if (!success)
            {
                return Result<PostDto>.Failure("Failed to update post");
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

