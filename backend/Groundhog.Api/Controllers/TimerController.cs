using Groundhog.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Groundhog.Api.Controllers;

[ApiController]
public class TimerController : ControllerBase
{
    [HttpPost("tasks/{taskId:guid}/timer/start")]
    [ProducesResponseType(typeof(TimeEntryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public IActionResult StartTimer(Guid taskId)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost("tasks/{taskId:guid}/timer/stop")]
    [ProducesResponseType(typeof(TimeEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public IActionResult StopTimer(Guid taskId)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("timer/active")]
    [ProducesResponseType(typeof(TimeEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public IActionResult GetActiveTimer()
        => NoContent();
}
