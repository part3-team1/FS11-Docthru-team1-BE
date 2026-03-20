import { corsOrigins, isProduction } from '#config';

export const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = !isProduction || (origin && corsOrigins.includes(origin));

  if (isAllowed && origin) {
    res.header('Access_Control_Allow_Origin', origin);
    res.header('Access_Control_Allow_Credentials', 'true');
  } else if (!isProduction) {
    res.header('Access_Control_Allow_Origin', '*');
  }

  res.header(
    'Access_Control_Allow_Methods',
    'GET, POST, PUT,PATCH,DELETE,OPTIONS',
  );
  res.header('Access_Control_Allow_Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
