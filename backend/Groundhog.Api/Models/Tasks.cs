namespace Groundhog.Api.Models;

public record TaskCreateRequest(
    string Name
);

public record TaskUpdateRequest(
    string Name
);

public record TaskResponse(
    Guid Id,
    string Name,
    List<TagResponse> Tags
);
