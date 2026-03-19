using Groundhog.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Groundhog.Api.Controllers;

[ApiController]
public class TagsController : ControllerBase
{
    [HttpGet("tags")]
    [ProducesResponseType(typeof(List<TagResponse>), StatusCodes.Status200OK)]
    public IActionResult ListTags()
        => Ok(Array.Empty<TagResponse>());

    [HttpPost("tags")]
    [ProducesResponseType(typeof(TagResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public IActionResult CreateTag([FromBody] TagCreateRequest request)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("tags/{tagId:guid}")]
    [ProducesResponseType(typeof(TagResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetTag(Guid tagId)
        => NotFound();

    [HttpPut("tags/{tagId:guid}")]
    [ProducesResponseType(typeof(TagResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public IActionResult UpdateTag(Guid tagId, [FromBody] TagUpdateRequest request)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("tags/{tagId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteTag(Guid tagId)
        => StatusCode(StatusCodes.Status501NotImplemented);
}
