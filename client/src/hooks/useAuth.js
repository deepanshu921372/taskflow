import { useSelector, useDispatch } from 'react-redux';
import { useGetMeQuery } from '../features/auth/authApi';
import { setUser, logout } from '../features/auth/authSlice';
import { useEffect } from 'react';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data?.data?.user) {
      dispatch(setUser(data.data.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error && token) {
      dispatch(logout());
    }
  }, [error, token, dispatch]);

  return {
    user: user || data?.data?.user,
    token,
    isAuthenticated: isAuthenticated || !!data?.data?.user,
    isLoading,
    logout: () => dispatch(logout()),
  };
};

export default useAuth;
