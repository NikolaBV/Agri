using System.Linq;
using Agri.Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Agri.Persistence;

namespace Agri.Application.Tags;

public class List
{
    public class Query : IRequest<Result<List<TagDto>>>
    {
    }

    public class Handler : IRequestHandler<Query, Result<List<TagDto>>>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public Handler(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<List<TagDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var tags = await _context.Tags
                .OrderBy(t => t.Name)
                .ProjectTo<TagDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<TagDto>>.Success(tags);
        }
    }
}

