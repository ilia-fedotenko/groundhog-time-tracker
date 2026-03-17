using Groundhog.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Groundhog.Api.Controllers;

[ApiController]
public class TasksController : ControllerBase
{
    [HttpGet("tasks")]
    [ProducesResponseType(typeof(List<TaskResponse>), StatusCodes.Status200OK)]
    public IActionResult ListTasks([FromQuery] Guid? tagId, [FromQuery] string? search)
        => Ok(Array.Empty<TaskResponse>());

    [HttpPost("tasks")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public IActionResult CreateTask([FromBody] TaskCreateRequest request)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("tasks/{taskId:guid}")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetTask(Guid taskId)
        => NotFound();

    [HttpPut("tasks/{taskId:guid}")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public IActionResult UpdateTask(Guid taskId, [FromBody] TaskUpdateRequest request)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("tasks/{taskId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteTask(Guid taskId)
        => StatusCode(StatusCodes.Status501NotImplemented);
}
