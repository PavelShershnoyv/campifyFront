import { configureStore } from '@reduxjs/toolkit';
import mapPointsReducer from '../features/map/mapPointsSlice';

export const store = configureStore({
  reducer: {
    mapPoints: mapPointsReducer,
    // Здесь можно добавить другие редьюсеры
  },
});

export default store; 