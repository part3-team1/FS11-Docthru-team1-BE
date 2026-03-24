import { corsOrigins, isProduction } from '#config';

export const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = !isProduction || (origin && corsOrigins.includes(origin));

  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (!isProduction) {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT,PATCH,DELETE,OPTIONS',
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
