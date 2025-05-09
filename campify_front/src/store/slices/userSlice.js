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

// Функция для получения CSRF-токена
export const getCSRFToken = createAsyncThunk(
  'user/getCSRFToken',
  async (_, { rejectWithValue }) => {
    try {
      // Проверяем, есть ли уже токен в куках
      let token = getCookie('csrftoken');
      if (token) {
        console.log('Найден CSRF-токен в куках:', token);
        return token;
      }
      
      const response = await fetch(`${getApiUrl()}/api/csrf-token/`, {
        method: 'GET',
        credentials: 'include', // Важно для работы с куками
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Ошибка при получении CSRF-токена. Код ответа:', response.status);
        return rejectWithValue('Не удалось получить CSRF-токен');
      }
      
      // Получаем токен из ответа API
      const data = await response.json();
      console.log('Ответ с CSRF-токеном:', data);
      
      // Проверяем, есть ли токен в поле csrfToken (согласно примеру бэкенда)
      if (data && data.csrfToken) {
        console.log('Получен CSRF-токен из API:', data.csrfToken);
        
        // Сохраняем токен в куки
        setCookie('csrftoken', data.csrfToken);
        console.log('Сохранили CSRF-токен в куки. Все куки:', document.cookie);
        
        return data.csrfToken;
      }
      
      return rejectWithValue('CSRF токен не найден в ответе');
    } catch (error) {
      console.error('Ошибка при получении CSRF-токена:', error);
      return rejectWithValue(error.message || 'Не удалось получить CSRF-токен');
    }
  }
);

// Асинхронный экшен для регистрации
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      // Сначала получаем CSRF-токен
      // const tokenResult = await dispatch(fetchRoutes());
      
      // Если получение токена завершилось ошибкой, прерываем регистрацию
      // if (tokenResult.error) {
      //   console.error('Ошибка получения токена:', tokenResult.error);
      //   return rejectWithValue('Не удалось получить CSRF-токен');
      // }

      // const swagger = await fetch(`${getApiUrl()}/swagger/`, {
      //   method: 'GET',
      //   headers: {'Content-Type': 'application/json',},
      //   credentials: 'include', // Важно для работы с куками
      // });
      
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
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      // Сначала получаем CSRF-токен
      const tokenResult = await dispatch(getCSRFToken());
      
      // Если получение токена завершилось ошибкой, прерываем авторизацию
      if (tokenResult.error) {
        return rejectWithValue('Не удалось получить CSRF-токен');
      }
      
      const csrfToken = tokenResult.payload;
      
      // Если нет токена, прерываем запрос
      if (!csrfToken || typeof csrfToken !== 'string') {
        return rejectWithValue('CSRF токен отсутствует или имеет неверный формат');
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
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
        return { userId, userData: cachedUsers[userId] };
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

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  csrfLoading: false,
  csrfError: null,
  error: null,
  registerSuccess: false,
  favorites: [], // Избранные маршруты
  usersCache: {}, // Кэш информации о пользователях по ID
  userLoading: false,
  userError: null,
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
      state.currentUser = { ...state.currentUser, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка экшена getCSRFToken
      .addCase(getCSRFToken.pending, (state) => {
        state.csrfLoading = true;
        state.csrfError = null;
      })
      .addCase(getCSRFToken.fulfilled, (state) => {
        state.csrfLoading = false;
      })
      .addCase(getCSRFToken.rejected, (state, action) => {
        state.csrfLoading = false;
        state.csrfError = action.payload;
      })
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
        state.userError = action.payload;
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