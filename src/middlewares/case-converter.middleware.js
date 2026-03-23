import { toCamel, toSnake } from '#utils/case-converter.util.js';

export const responseCaseConverter = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const camelData = data ? toCamel(data) : data;

    return originalJson.call(this, camelData);
  };

  next();
};

export const requestCaseConverter = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = toSnake(req.body);
  }

  if (req.query && Object.keys(req.query).length > 0) {
    req.query = toSnake(req.query);
  }

  if (req.params && Object.keys(req.params).length > 0) {
    req.params = toSnake(req.params);
  }

  next();
};
