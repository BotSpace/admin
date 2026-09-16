export type ProjectListFilters = {
  owner?: string;
  search?: string;
  is_template?: string;
  has_release?: string;
  created_after?: string;
  created_before?: string;
};

export type ProjectListParams = ProjectListFilters & {
  ordering?: string;
  page?: number;
  page_size?: number;
};

// Both endpoints apply these filters with AND before counting and pagination.
// Dates are inclusive UTC calendar days; send them unchanged, without local conversion.
export function projectListQuery(params: ProjectListParams | undefined, defaultPageSize: number) {
  const page = params?.page && Number.isSafeInteger(params.page) && params.page > 0 ? params.page : 1;
  const limit = params?.page_size ?? defaultPageSize;
  return {
    owner: params?.owner,
    search: params?.search,
    is_template: params?.is_template,
    has_release: params?.has_release,
    created_after: params?.created_after,
    created_before: params?.created_before,
    ordering: params?.ordering,
    limit,
    offset: (page - 1) * limit,
  };
}
