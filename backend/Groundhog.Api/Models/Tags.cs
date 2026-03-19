namespace Groundhog.Api.Models;

public record TagCreateRequest(
    string Name
);

public record TagUpdateRequest(
    string Name
);

public record TagResponse(
    Guid Id,
    string Name
);

public record TaskTagsUpdateRequest(
    List<Guid> TagIds
);
