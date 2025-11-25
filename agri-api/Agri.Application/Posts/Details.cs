using Agri.Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Agri.Persistence;

namespace Agri.Application.Posts;

public class Details
{
    public class Query : IRequest<Result<PostDto>>
    {
        public Guid Id { get; init; }
    }

    public class Handler : IRequestHandler<Query, Result<PostDto>>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public Handler(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<PostDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var post = await _context
                .Posts.Where(p => p.Id == request.Id)
                .ProjectTo<PostDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            return post is null
                ? Result<PostDto>.Failure("Post not found")
                : Result<PostDto>.Success(post);
        }
    }
}

