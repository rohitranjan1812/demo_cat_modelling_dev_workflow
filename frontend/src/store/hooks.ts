/**
 * Redux Typed Hooks
 * 
 * Pre-typed versions of useDispatch and useSelector hooks
 * for better TypeScript support throughout the application
 */

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <TSelected>(selector: (state: RootState) => TSelected): TSelected => useSelector(selector);
