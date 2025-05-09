import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCookie } from './userSlice';

// Получение базового URL API
const getApiUrl = () => {
  const url = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  return url;
};

// Асинхронный thunk для получения отзывов маршрута по ID
export const fetchRouteReviews = createAsyncThunk(
  'reviews/fetchRouteReviews',
  async (routeId, { rejectWithValue }) => {
    try {
      const url = `${getApiUrl()}/api/routes/${routeId}/reviews/`;
      console.log('Запрашиваем отзывы по URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении отзывов: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Получены отзывы:', data);
      return { routeId, reviews: data };
    } catch (error) {
      console.error('Ошибка при получении отзывов:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный thunk для создания нового отзыва
export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue, getState }) => {
    try {
      // Получаем CSRF-токен из куки
      const csrftoken = getCookie('csrftoken');
      
      // Получаем ID пользователя из Redux
      const state = getState();
      const userId = state.user?.currentUser?.id;
      
      if (!userId) {
        return rejectWithValue('Необходимо авторизоваться для добавления отзыва');
      }
      
      // Подготавливаем данные для запроса
      const requestData = {
        rating: reviewData.rating,
        comment: reviewData.comment,
        route: parseInt(reviewData.routeId),
        user: parseInt(userId)
      };
      
      console.log('Отправляем запрос на создание отзыва:', requestData);
      const url = `${getApiUrl()}/api/route_reviews/`;
      console.log('URL для создания отзыва:', url);
      
      // Отправляем запрос
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFTOKEN': csrftoken
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        let errorMessage = `Ошибка при создании отзыва: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Детали ошибки:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('Не удалось получить детали ошибки:', e);
        }
        
        return rejectWithValue(errorMessage);
      }
      
      const data = await response.json();
      console.log('Успешно создан отзыв:', data);
      return data;
    } catch (error) {
      console.error('Исключение при создании отзыва:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  reviews: {},  // Объект с ключами - ID маршрутов, значения - массивы отзывов
  loading: false,
  error: null,
  createReviewLoading: false,
  createReviewError: null,
  lastCreatedReview: null
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewErrors: (state) => {
      state.error = null;
      state.createReviewError = null;
    },
    clearLastCreatedReview: (state) => {
      state.lastCreatedReview = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка получения отзывов
      .addCase(fetchRouteReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteReviews.fulfilled, (state, action) => {
        state.loading = false;
        // Убедимся, что reviews всегда массив
        const reviews = Array.isArray(action.payload.reviews) 
          ? action.payload.reviews 
          : [action.payload.reviews];
        
        // Сохраняем отзывы для конкретного маршрута
        state.reviews[action.payload.routeId] = reviews;
      })
      .addCase(fetchRouteReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Обработка создания отзыва
      .addCase(createReview.pending, (state) => {
        state.createReviewLoading = true;
        state.createReviewError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.createReviewLoading = false;
        state.lastCreatedReview = action.payload;
        
        // Добавляем новый отзыв в список отзывов для данного маршрута
        const routeId = action.payload.route;
        if (state.reviews[routeId]) {
          // Проверяем, является ли state.reviews[routeId] массивом
          if (Array.isArray(state.reviews[routeId])) {
            // Если это массив, добавляем новый отзыв
            state.reviews[routeId] = [...state.reviews[routeId], action.payload];
          } else {
            // Если это не массив, создаем новый массив с текущим отзывом и новым
            state.reviews[routeId] = [state.reviews[routeId], action.payload];
          }
        } else {
          // Если отзывов еще нет, создаем массив с одним отзывом
          state.reviews[routeId] = [action.payload];
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.createReviewLoading = false;
        state.createReviewError = action.payload;
      });
  }
});

export const { clearReviewErrors, clearLastCreatedReview } = reviewsSlice.actions;

export default reviewsSlice.reducer; 