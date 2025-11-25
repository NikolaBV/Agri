using Agri.Application.Tags;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Agri.API.Controllers;

public class TagsController : BaseApiController
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetTags()
    {
        return HandleResult(await Mediator.Send(new List.Query()));
    }
}

