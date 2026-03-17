using Groundhog.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Groundhog.Api.Controllers;

[ApiController]
public class TaskTagsController : ControllerBase
{
    [HttpGet("tasks/{taskId:guid}/tags")]
    [ProducesResponseType(typeof(List<TagResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult ListTaskTags(Guid taskId)
        => Ok(Array.Empty<TagResponse>());

    [HttpPut("tasks/{taskId:guid}/tags")]
    [ProducesResponseType(typeof(List<TagResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public IActionResult ReplaceTaskTags(Guid taskId, [FromBody] TaskTagsUpdateRequest request)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost("tasks/{taskId:guid}/tags/{tagId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult AddTagToTask(Guid taskId, Guid tagId)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("tasks/{taskId:guid}/tags/{tagId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult RemoveTagFromTask(Guid taskId, Guid tagId)
        => StatusCode(StatusCodes.Status501NotImplemented);
}
