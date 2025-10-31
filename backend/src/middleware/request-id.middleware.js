import { nanoid } from 'nanoid';

export function requestIdMiddleware(req, res, next) {
  const id = req.headers['x-request-id'] || `req_${nanoid(10)}`;
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
}
