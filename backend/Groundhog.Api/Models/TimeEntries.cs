namespace Groundhog.Api.Models;

public record TimeEntryCreateRequest(
    Guid TaskId,
    DateTimeOffset StartedAt,
    DateTimeOffset? StoppedAt
);

public record TimeEntryUpdateRequest(
    DateTimeOffset StartedAt,
    DateTimeOffset? StoppedAt
);

public record TimeEntryResponse(
    Guid Id,
    Guid TaskId,
    DateTimeOffset StartedAt,
    DateTimeOffset? StoppedAt
);
