using System.Linq;
using Agri.Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Agri.Persistence;

namespace Agri.Application.Posts;

public class List
{
    public class Query : IRequest<Result<List<PostDto>>>
    {
        public bool OnlyPublished { get; init; } = true;
        public string? AuthorId { get; init; }
        public string? Search { get; init; }
    }

    public class Handler : IRequestHandler<Query, Result<List<PostDto>>>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public Handler(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<List<PostDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var queryable = _context
                .Posts.Include(p => p.Author)
                .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
                .AsQueryable();

            if (request.OnlyPublished)
            {
                queryable = queryable.Where(post => post.IsPublished);
            }

            if (!string.IsNullOrWhiteSpace(request.AuthorId))
            {
                queryable = queryable.Where(post => post.AuthorId == request.AuthorId);
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                queryable = queryable.Where(post =>
                    post.Title.ToLower().Contains(search)
                    || post.Content.ToLower().Contains(search)
                    || post.Summary.ToLower().Contains(search)
                );
            }

            var posts = await queryable
                .OrderByDescending(p => p.CreatedAt)
                .ProjectTo<PostDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<PostDto>>.Success(posts);
        }
    }
}

