export const validateSort = (
  sortBy,
  sortOrder = 'desc',
  allowedFields = [],
) => {
  const fallbackField = allowedFields[0] || 'id';

  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : fallbackField;
  const safeSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : 'desc';

  return { sortBy: safeSortBy, sortOrder: safeSortOrder };
};
