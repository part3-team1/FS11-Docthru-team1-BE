import { toCamel } from '#utils/case-converter.util.js';

export const responseCaseConverter = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const camelData = data ? toCamel(data) : data;

    return originalJson.call(this, camelData);
  };

  next();
};
