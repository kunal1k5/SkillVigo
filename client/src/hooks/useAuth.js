/**
 * Custom Hook: useAuth
 * 
 * Provides convenient access to AuthContext
 * 
 * Usage:
 * const { currentUser, login, logout } = useAuth();
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
	const auth = useContext(AuthContext);
	if (!auth) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return auth;
}
