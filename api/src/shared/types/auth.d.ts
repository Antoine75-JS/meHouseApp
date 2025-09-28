/**
 * Auth service response for login/register
 * Contains user data and JWT access token
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  token: string;
}

/**
 * User response (without password)
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}
