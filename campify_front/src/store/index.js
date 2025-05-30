import { configureStore } from '@reduxjs/toolkit';
import routesReducer from './slices/routesSlice';
import userReducer from './slices/userSlice';
import mapPointsReducer from '../features/map/mapPointsSlice';
import reviewsReducer from './slices/reviewsSlice';

export const store = configureStore({
  reducer: {
    routes: routesReducer,
    user: userReducer,
    mapPoints: mapPointsReducer,
    reviews: reviewsReducer,
  },
});

export default store; 