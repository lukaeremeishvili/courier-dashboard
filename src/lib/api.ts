import { NextApiRequest, NextApiResponse } from 'next';

const apiUrl = process.env.API_URL || 'http://localhost:3000/api'; 

export async function apiRequest(endpoint: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  return { data, status: res.status };
}

export async function registerUser(req: NextApiRequest, res: NextApiResponse) {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }


  const result = await apiRequest('/users/register', 'POST', { email, password, role });
  return res.status(result.status).json(result.data);
}
