import { useAppSelector, useAppDispatch } from './useAppDispatch';
import { loginSuccess, logout } from '../store/slices/authSlice';
import { MOCK_USERS, USER_PASSWORDS } from '../services/mockData';
import { getMenuPermissions, getActionPermissions } from '../utils/permissions';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  const login = (email: string, password: string, rememberMe: boolean): boolean => {
    const expectedPassword = USER_PASSWORDS[email];
    if (!expectedPassword || expectedPassword !== password) return false;
    const foundUser = MOCK_USERS.find((u) => u.email === email && u.activo);
    if (!foundUser) return false;
    dispatch(loginSuccess({ user: foundUser, rememberMe }));
    return true;
  };

  const logoutUser = () => dispatch(logout());

  const menuPerms = user ? getMenuPermissions(user.rol) : null;
  const actionPerms = user ? getActionPermissions(user.rol) : null;

  return { user, isAuthenticated, login, logout: logoutUser, menuPerms, actionPerms };
};
