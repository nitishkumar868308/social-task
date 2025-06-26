import { jwtDecode } from 'jwt-decode';

export const getUserFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (err) {
    return null;
  }
};
