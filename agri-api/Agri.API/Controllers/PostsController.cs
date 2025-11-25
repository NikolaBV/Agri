using Agri.Application.Posts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Agri.API.Controllers;

public class PostsController : BaseApiController
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] List.Query query)
    {
        return HandleResult(await Mediator.Send(query));
    }

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPost(Guid id)
    {
        return HandleResult(await Mediator.Send(new Details.Query { Id = id }));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreatePost(Create.Command command)
    {
        if (command is null)
        {
            return BadRequest("Payload is required.");
        }

        return HandleResult(await Mediator.Send(command));
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> EditPost(Guid id, Edit.Command command)
    {
        if (command is null)
        {
            return BadRequest("Payload is required.");
        }

        var payload = command with { Id = id };
        return HandleResult(await Mediator.Send(payload));
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        return HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
    }
}

