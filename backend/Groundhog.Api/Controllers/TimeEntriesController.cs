using Groundhog.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Groundhog.Api.Controllers;

[ApiController]
public class TimeEntriesController : ControllerBase
{
    [HttpGet("time-entries")]
    [ProducesResponseType(typeof(List<TimeEntryResponse>), StatusCodes.Status200OK)]
    public IActionResult ListTimeEntries(
        [FromQuery] Guid? taskId,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] bool? active)
        => Ok(Array.Empty<TimeEntryResponse>());

    [HttpPost("time-entries")]
    [ProducesResponseType(typeof(TimeEntryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public IActionResult CreateTimeEntry([FromBody] TimeEntryCreateRequest request)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("time-entries/{entryId:guid}")]
    [ProducesResponseType(typeof(TimeEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetTimeEntry(Guid entryId)
        => NotFound();

    [HttpPut("time-entries/{entryId:guid}")]
    [ProducesResponseType(typeof(TimeEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public IActionResult UpdateTimeEntry(Guid entryId, [FromBody] TimeEntryUpdateRequest request)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("time-entries/{entryId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteTimeEntry(Guid entryId)
        => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("tasks/{taskId:guid}/time-entries")]
    [ProducesResponseType(typeof(List<TimeEntryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult ListTaskTimeEntries(Guid taskId)
        => Ok(Array.Empty<TimeEntryResponse>());
}
