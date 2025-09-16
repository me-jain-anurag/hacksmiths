import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.OUR_API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

export const validateAbhaToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ABHA token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ABHA_PUBLIC_KEY, {
      algorithms: ['RS256']
    });
    req.abhaUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid ABHA token' });
  }
};
