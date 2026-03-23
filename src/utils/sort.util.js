export const validateSort = (
  sortBy,
  sortOrder = 'desc',
  allowedFields = [],
  defaultField = 'created_at',
) => {
  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const safeSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';

  return { sortBy: safeSortBy, sortOrder: safeSortOrder };
};
