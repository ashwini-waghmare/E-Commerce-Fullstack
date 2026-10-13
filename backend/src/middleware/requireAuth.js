const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const cookie = (req.headers.cookie || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith('goodform_token='));
  const cookieToken = cookie ? decodeURIComponent(cookie.slice('goodform_token='.length)) : '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : cookieToken;

  if (!token || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace_')) {
    return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload === 'string' || !Number.isInteger(payload.userId)) {
      return res.status(401).json({ success: false, message: 'Your session is invalid.' });
    }
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
  }
}

module.exports = requireAuth;