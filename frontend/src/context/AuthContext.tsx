import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { User, AuthState, Assistant } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateProfile: (data: unknown) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; assistantProfile?: Assistant } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('carryhand_token'),
  loading: true,
  assistantProfile: null
};

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS': return { ...state, user: action.payload.user, token: action.payload.token, assistantProfile: action.payload.assistantProfile || null, loading: false };
    case 'LOGOUT': return { ...initialState, token: null, loading: false };
    case 'UPDATE_USER': return { ...state, user: action.payload };
    default: return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('carryhand_token');
    if (token) {
      api.get('/auth/me').then(res => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data.user, token, assistantProfile: res.data.assistantProfile } });
      }).catch(() => {
        localStorage.removeItem('carryhand_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('carryhand_token', res.data.token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    return res.data.user as User;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('carryhand_token', res.data.token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    return res.data.user as User;
  };

  const logout = () => {
    localStorage.removeItem('carryhand_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: unknown) => {
    const res = await api.put('/auth/profile', data);
    dispatch({ type: 'UPDATE_USER', payload: res.data.user });
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data.user, token: state.token!, assistantProfile: res.data.assistantProfile } });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
