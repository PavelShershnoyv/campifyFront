import { configureStore } from '@reduxjs/toolkit';
import routesReducer from './slices/routesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    routes: routesReducer,
    user: userReducer,
  },
});

export default store; 