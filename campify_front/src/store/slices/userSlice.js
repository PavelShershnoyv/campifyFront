import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Асинхронный экшен для авторизации
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Здесь будет реальный API-запрос авторизации
      // Пример заглушки с успешной авторизацией
      return {
        id: '12345',
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        token: 'sample-auth-token',
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  favorites: [], // Избранные маршруты
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.token = null;
    },
    addToFavorites: (state, action) => {
      // Добавление маршрута в избранное
      const routeId = action.payload;
      if (!state.favorites.includes(routeId)) {
        state.favorites.push(routeId);
      }
    },
    removeFromFavorites: (state, action) => {
      // Удаление маршрута из избранного
      const routeId = action.payload;
      state.favorites = state.favorites.filter(id => id !== routeId);
    },
    updateUserProfile: (state, action) => {
      // Обновление данных профиля
      state.currentUser = { ...state.currentUser, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, addToFavorites, removeFromFavorites, updateUserProfile } = userSlice.actions;

export default userSlice.reducer; 