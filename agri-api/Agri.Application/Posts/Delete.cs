using Agri.Application.Core;
using Agri.Application.Interfaces;
using Agri.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Agri.Application.Posts;

public class Delete
{
    public class Command : IRequest<Result<Unit>>
    {
        public Guid Id { get; init; }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;

        public Handler(DataContext context, IUserAccessor userAccessor)
        {
            _context = context;
            _userAccessor = userAccessor;
        }

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
            if (post is null)
            {
                return Result<Unit>.Failure("Post not found");
            }

            var userId = _userAccessor.GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(userId) || post.AuthorId != userId)
            {
                return Result<Unit>.Failure("Unauthorized");
            }

            _context.Posts.Remove(post);

            var success = await _context.SaveChangesAsync(cancellationToken) > 0;
            if (!success)
            {
                return Result<Unit>.Failure("Failed to delete post");
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}

