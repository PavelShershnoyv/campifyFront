import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRoutes } from './routesSlice';

// Получение базового URL API
const getApiUrl = () => {
  const url = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  console.log('API URL:', url);
  return url;
};

// Вызываем сразу для проверки
console.log('Инициализация userSlice, API URL:', getApiUrl());

// Функция для установки куки
const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
  console.log(`Кука ${name} установлена`, document.cookie);
};

// Функция для получения значения куки
export const getCookie = (name) => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
};

// Функция для вывода всех кук (для отладки)
export const logAllCookies = () => {
  console.log('Все доступные куки:');
  const cookies = document.cookie.split(';');
  if (cookies.length === 1 && cookies[0] === '') {
    console.log('Куки отсутствуют');
    return;
  }
  
  cookies.forEach((cookie, index) => {
    const trimmed = cookie.trim();
    console.log(`${index + 1}. ${trimmed}`);
  });
};

// Функция для получения ID пользователя из Redux store
export const getUserIdFromStore = (state) => {
  // Получаем ID пользователя из Redux store
  if (state?.user?.currentUser?.id) {
    return state.user.currentUser.id;
  }
  return null;
};

// Асинхронный экшен для регистрации
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      // Проверяем токен в куках
      const cookieToken = getCookie('csrftoken');
      console.log('CSRF-токен из куки:', cookieToken);
      
      // Формируем заголовки
      const headers = {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrfToken, // Важно передать токен в заголовке
      };
      
      const response = await fetch(`${getApiUrl()}/api/register/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          username: userData.login,
          email: userData.email,
          password: userData.password
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка при регистрации';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Ошибка при регистрации:', errorData);
        } catch (e) {
          console.error('Не удалось получить детали ошибки:', e);
        }
        
        return rejectWithValue(errorMessage);
      }

      // Пытаемся получить результат
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Поймано исключение при регистрации:', error);
      return rejectWithValue(error.message || 'Не удалось выполнить запрос');
    }
  }
);

// Асинхронный экшен для авторизации
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      console.log('Заголовки для входа:', headers);
      
      // Отправляем запрос на вход
      const response = await fetch(`${getApiUrl()}/api/login/`, {
        method: 'POST',
        headers,
        credentials: 'include', // Важно для работы с куками
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          remember: credentials.remember || false
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка при входе';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('Не удалось получить детали ошибки:', e);
        }
        
        return rejectWithValue(errorMessage);
      }

      // Получаем данные пользователя
      const data = await response.json();
      console.log('Ответ при авторизации:', data);
      console.log('ID пользователя из ответа:', data.user_id);
      
      // Сохраняем access_token в куки
      if (data.access_token) {
        setCookie('access_token', data.access_token);
      }

      // Создаем объект пользователя для хранения в Redux
      const userData = {
        id: data.user_id, // Берем ID напрямую из ответа
        email: data.email || '', // Добавляем email пользователя
        username: data.username || '', // Добавляем username пользователя
        is_pass_test: data.is_pass_test || false, // Добавляем статус прохождения теста
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        isAuthenticated: true
      };
      
      console.log('Сохраняем в Redux данные пользователя:', userData);

      return userData;
    } catch (error) {
      return rejectWithValue(error.message || 'Не удалось выполнить запрос');
    }
  }
);

// Асинхронный экшен для получения информации о пользователе по ID
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (userId, { rejectWithValue, getState }) => {
    try {
      // Проверяем, есть ли уже этот пользователь в кэше
      const cachedUsers = getState().user.usersCache;
      if (cachedUsers[userId]) {
        console.log('Информация о пользователе с ID', userId, 'взята из кэша');
        // Возвращаем rejected, чтобы не обновлять состояние
        return rejectWithValue('Пользователь уже в кэше');
      }
      
      const url = `${getApiUrl()}/api/user/${userId}/`;
      console.log('Запрашиваем информацию о пользователе по URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Важно для работы с куками
      });

      if (!response.ok) {
        throw new Error(`Ошибка получения информации о пользователе: ${response.status}`);
      }

      const userData = await response.json();
      console.log('Получены данные пользователя:', userData);
      
      return { userId, userData };
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return rejectWithValue(error.message || 'Не удалось получить информацию о пользователе');
    }
  }
);

// Асинхронный экшен для получения информации о текущем пользователе
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { currentUser } = getState().user;
      if (!currentUser || !currentUser.id) {
        throw new Error('Пользователь не авторизован');
      }
      
      const url = `${getApiUrl()}/api/users/${currentUser.id}/`;
      console.log('Запрашиваем информацию о текущем пользователе по URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Важно для работы с куками
      });

      if (!response.ok) {
        throw new Error(`Ошибка получения информации о пользователе: ${response.status}`);
      }

      const userData = await response.json();
      console.log('Получены данные пользователя:', userData);
      
      // Объединяем с текущими данными и обновляем is_pass_test
      return {
        ...currentUser,
        ...userData,
        is_pass_test: userData.is_pass_test || false
      };
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return rejectWithValue(error.message || 'Не удалось получить информацию о пользователе');
    }
  }
);

// Асинхронный экшен для отправки данных теста по рекомендациям
// tagsData - массив строк с тегами, которые выбрал пользователь в опросе
export const submitUserPreferences = createAsyncThunk(
  'user/submitUserPreferences',
  async (tagsData, { rejectWithValue, getState }) => {
    try {
      // Получаем ID пользователя из состояния
      const userId = selectUserId(getState());
      
      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }
      
      // Используем фиксированный URL вместо getApiUrl() для этого эндпоинта
      const response = await fetch(`${getApiUrl()}/api/user/preferences/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
          tags: tagsData
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка при отправке данных теста';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('Не удалось получить детали ошибки:', e);
        }
        
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      console.log('Ответ при отправке данных теста:', data);
      
      // Возвращаем обновленный статус прохождения теста
      return { is_pass_test: true };
    } catch (error) {
      console.error('Ошибка при отправке данных теста:', error);
      return rejectWithValue(error.message || 'Не удалось отправить данные теста');
    }
  }
);

// Асинхронный экшен для проверки статуса авторизации
export const checkAuthStatus = createAsyncThunk(
  'user/checkAuthStatus',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Получаем доступ к текущему состоянию
      const { user } = getState();
      
      // Проверяем наличие данных пользователя в состоянии
      if (user.currentUser && user.currentUser.email) {
        console.log('Пользователь уже авторизован:', user.currentUser.email);
        return user.currentUser;
      }
      
      // Проверяем наличие токена в куках
      const accessToken = getCookie('access_token');
      
      if (!accessToken) {
        console.log('Токен авторизации не найден в куках');
        return rejectWithValue('Нет сохраненного токена');
      }
      
      // Вместо запроса на сервер, просто возвращаем статус неавторизованного пользователя
      return rejectWithValue('Необходима авторизация');
      
    } catch (error) {
      console.error('Ошибка при проверке статуса авторизации:', error);
      return rejectWithValue(error.message || 'Ошибка проверки статуса авторизации');
    }
  }
);

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  registerSuccess: false,
  favorites: [], // Избранные маршруты
  usersCache: {}, // Кэш информации о пользователях по ID
  userLoading: false,
  userError: null,
  isPassTest: false, // Статус прохождения теста рекомендаций
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      // Удаляем куку с токеном авторизации
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    },
    clearErrors: (state) => {
      state.error = null;
    },
    resetRegisterSuccess: (state) => {
      state.registerSuccess = false;
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
      if (state.currentUser) {
        state.currentUser = { 
          ...state.currentUser, 
          ...action.payload,
          // Если обновляется статус прохождения теста, обновляем и isPassTest
          is_pass_test: action.payload.is_pass_test !== undefined 
            ? action.payload.is_pass_test 
            : state.currentUser.is_pass_test || false
        };
        
        // Обновляем также состояние isPassTest
        if (action.payload.is_pass_test !== undefined) {
          state.isPassTest = action.payload.is_pass_test;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка экшена loginUser
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
      })
      // Обработка экшена registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;
      })
      // Обработка экшена fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.userLoading = false;
        // Сохраняем полученную информацию о пользователе в кэше
        state.usersCache[action.payload.userId] = action.payload.userData;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.userLoading = false;
        // Не показываем ошибку, если пользователь уже в кэше
        if (action.payload !== 'Пользователь уже в кэше') {
          state.userError = action.payload;
        }
      })
      // Обработка экшена fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Обработка экшена submitUserPreferences
      .addCase(submitUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = {
          ...state.currentUser,
          is_pass_test: action.payload.is_pass_test
        };
        state.isPassTest = action.payload.is_pass_test;
        state.isAuthenticated = true;
      })
      .addCase(submitUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Обработка экшена checkAuthStatus
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = null; // Не показываем ошибку пользователю, просто считаем, что он не авторизован
        state.isAuthenticated = false;
        state.currentUser = null;
      });
  },
});

export const { 
  logout, 
  clearErrors, 
  resetRegisterSuccess,
  addToFavorites, 
  removeFromFavorites, 
  updateUserProfile 
} = userSlice.actions;

// Селектор для получения ID пользователя из токена или из состояния Redux
export const selectUserId = (state) => {
  // Сначала пробуем получить ID из состояния Redux
  if (state.user.currentUser && state.user.currentUser.id) {
    return state.user.currentUser.id;
  }
  
  // Если в состоянии нет, пробуем получить из токена
  return getUserIdFromStore(state);
};

export default userSlice.reducer; 