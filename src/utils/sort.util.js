export const validateSort = (
  sortBy,
  sortOrder = 'desc',
  allowedFields = [],
  defaultField = 'approvedAt',
) => {
  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const safeSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';

  return { sortBy: safeSortBy, sortOrder: safeSortOrder };
};
