import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCookie } from '../../store/slices/userSlice';

// Асинхронный thunk для получения точек карты
export const fetchMapPoints = createAsyncThunk(
  'mapPoints/fetchMapPoints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/map_points/`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки точек: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный thunk для построения маршрута
export const buildRouteThunk = createAsyncThunk(
  'mapPoints/buildRoute',
  async ({coordinates, accessToken}, { rejectWithValue }) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?access_token=${accessToken}&geometries=geojson&annotations=distance,duration&overview=full`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ошибка при получении маршрута: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Не удалось построить маршрут между выбранными точками');
      }
      
      return data.routes[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный thunk для сохранения маршрута
export const saveRouteThunk = createAsyncThunk(
  'mapPoints/saveRoute',
  async (routeData, { rejectWithValue, getState }) => {
    try {
      // Получаем CSRF-токен из куки
      const csrftoken = getCookie('csrftoken');
      console.log('CSRF-токен для сохранения маршрута:', csrftoken);
      
      // Получаем полное состояние Redux для отладки
      const state = getState();
      console.log('Полное состояние Redux при сохранении маршрута:', state);
      
      // Получаем ID пользователя из Redux store
      const userId = state.user?.currentUser?.id;
      console.log('ID пользователя из Redux (currentUser.id):', userId);
      
      // Преобразуем userId в число, если это строка
      const numericUserId = userId ? parseInt(userId, 10) : null;
      console.log('ID пользователя в числовом формате:', numericUserId);
      
      // Если ID пользователя не найден, выдаем ошибку
      if (!numericUserId) {
        return rejectWithValue('ID пользователя не найден. Пожалуйста, авторизуйтесь');
      }
      
      // Проверяем, в каком формате предоставлена продолжительность
      let formattedDuration;
      if (typeof routeData.duration === 'string' && routeData.duration.includes(':')) {
        // Если уже в формате HH:MM:SS, используем как есть
        formattedDuration = routeData.duration;
      } else if (typeof routeData.duration === 'number') {
        // Форматируем продолжительность в формат HH:MM:SS из секунд
        const hours = Math.floor(routeData.duration / 3600);
        const minutes = Math.floor((routeData.duration % 3600) / 60);
        const remainingSeconds = Math.floor(routeData.duration % 60);
        
        formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      } else {
        formattedDuration = '00:00:00'; // Значение по умолчанию
      }
      
      // Формируем URL запроса
      const url = `${process.env.REACT_APP_API_URL}/api/routes/`;
      console.log('URL запроса:', url);
      
      // Преобразуем данные в формат, ожидаемый API
      const formattedData = {
        name: routeData.name,
        description: routeData.description || "",
        location_area: routeData.location_area || "Россия Свердловская область",
        duration: formattedDuration,
        chat_link: routeData.chat_link || "http://127.0.0.1:8000/example/",
        views: 0,
        is_public: routeData.is_public !== undefined ? routeData.is_public : false,
        
        // Обрабатываем расстояние: может прийти как length_in_km или distance (в метрах)
        length_in_km: routeData.length_in_km || (routeData.distance ? routeData.distance / 1000 : 0),
        
        // Обрабатываем высоту: может прийти как height или elevation_gain
        height: routeData.height || routeData.elevation_gain || 0,
        
        // Сложность (число от 1 до 3)
        difficulty: routeData.difficulty || 1,
        
        // Тип (1 - обустроенный, 2 - дикий)
        type: routeData.type || 1,
        
        // Сохраняем дополнительные данные маршрута в строковом формате
        coordinates: typeof routeData.coordinates === 'string' 
          ? routeData.coordinates 
          : JSON.stringify(routeData.coordinates),
          
        waypoints: typeof routeData.waypoints === 'string' 
          ? routeData.waypoints 
          : JSON.stringify(routeData.waypoints),
          
        // Передаем ID пользователя в поле author, как ожидает сервер
        author: numericUserId
      };
      
      console.log('Отправляем запрос с данными:', JSON.stringify(formattedData, null, 2));
      
      // Отправляем запрос с данными:
      const requestBody = JSON.stringify(formattedData);
      console.log('JSON запроса:', requestBody);
      
      // Создаем объект с заголовками
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRFTOKEN': csrftoken
      };
      
      console.log('Заголовки запроса:', headers);
      
      // Отправляем запрос
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include', // Включаем куки в запрос
        body: requestBody
      });
      
      console.log('Ответ сервера:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Ошибка при сохранении маршрута: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Ошибка сохранения маршрута:', errorData);
        } catch (e) {}
        
        return rejectWithValue(errorMessage);
      }
      
      const data = await response.json();
      console.log('Маршрут успешно сохранен:', data);
      return data;
    } catch (error) {
      console.error('Ошибка при сохранении маршрута:', error);
      return rejectWithValue(error.message || 'Неизвестная ошибка при сохранении маршрута');
    }
  }
);

// Асинхронный thunk для получения маршрутов пользователя
export const fetchUserRoutesThunk = createAsyncThunk(
  'mapPoints/fetchUserRoutes',
  async (providedUserId, { rejectWithValue, getState }) => {
    try {
      // Получаем ID пользователя
      let userId = providedUserId;
      
      // Если userId не передан, берем из Redux
      if (!userId) {
        const state = getState();
        userId = state.user?.currentUser?.id;
      }
      
      // Если ID всё равно нет, ошибка
      if (!userId) {
        return rejectWithValue('ID пользователя не найден. Пожалуйста, авторизуйтесь');
      }
      
      console.log('Запрос маршрутов для пользователя ID:', userId);
      
      // Формируем URL запроса на получение маршрутов
      const url = `${process.env.REACT_APP_API_URL}/api/routes/user/${userId}/`;
      console.log('URL запроса:', url);
      
      // Отправляем запрос на получение маршрутов конкретного пользователя
      const response = await fetch(url, {
        credentials: 'include' // Включаем куки в запрос
      });
      
      console.log('Ответ сервера:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Ошибка при получении маршрутов пользователя: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        
        return rejectWithValue(errorMessage);
      }
      
      const data = await response.json();
      console.log('Получены маршруты:', data);
      return data;
    } catch (error) {
      console.error('Ошибка при получении маршрутов:', error);
      return rejectWithValue(error.message || 'Неизвестная ошибка при получении маршрутов');
    }
  }
);

// Асинхронный thunk для удаления маршрута пользователя
export const deleteRouteThunk = createAsyncThunk(
  'mapPoints/deleteRoute',
  async (routeId, { rejectWithValue }) => {
    try {
      // Получаем CSRF-токен из куки
      const csrftoken = getCookie('csrftoken');
      console.log('CSRF-токен для удаления маршрута:', csrftoken);
      
      // Отправляем запрос на удаление маршрута
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/routes/${routeId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFTOKEN': csrftoken
        },
        credentials: 'include' // Включаем куки в запрос
      });
      
      console.log('Ответ сервера при удалении:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Ошибка при удалении маршрута: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Ошибка удаления маршрута:', errorData);
        } catch (e) {}
        
        return rejectWithValue(errorMessage);
      }
      
      console.log('Маршрут успешно удален:', routeId);
      return routeId; // Возвращаем ID удаленного маршрута
    } catch (error) {
      console.error('Ошибка при удалении маршрута:', error);
      return rejectWithValue(error.message || 'Неизвестная ошибка при удалении маршрута');
    }
  }
);

const initialState = {
  points: [],
  currentRoute: null,
  userRoutes: [],
  loading: false,
  routeLoading: false,
  saveRouteLoading: false,
  userRoutesLoading: false,
  deleteRouteLoading: false,
  error: null,
  routeError: null,
  saveRouteError: null,
  userRoutesError: null,
  deleteRouteError: null,
  savedRoute: null
};

const mapPointsSlice = createSlice({
  name: 'mapPoints',
  initialState,
  reducers: {
    clearRoute: (state) => {
      state.currentRoute = null;
      state.routeError = null;
    },
    clearSavedRoute: (state) => {
      state.savedRoute = null;
      state.saveRouteError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка состояний для fetchMapPoints
      .addCase(fetchMapPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.points = action.payload;
      })
      .addCase(fetchMapPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Обработка состояний для buildRouteThunk
      .addCase(buildRouteThunk.pending, (state) => {
        state.routeLoading = true;
        state.routeError = null;
      })
      .addCase(buildRouteThunk.fulfilled, (state, action) => {
        state.routeLoading = false;
        state.currentRoute = action.payload;
      })
      .addCase(buildRouteThunk.rejected, (state, action) => {
        state.routeLoading = false;
        state.routeError = action.payload;
      })
      
      // Обработка состояний для saveRouteThunk
      .addCase(saveRouteThunk.pending, (state) => {
        state.saveRouteLoading = true;
        state.saveRouteError = null;
      })
      .addCase(saveRouteThunk.fulfilled, (state, action) => {
        state.saveRouteLoading = false;
        state.savedRoute = action.payload;
      })
      .addCase(saveRouteThunk.rejected, (state, action) => {
        state.saveRouteLoading = false;
        state.saveRouteError = action.payload;
      })
      
      // Обработка состояний для fetchUserRoutesThunk
      .addCase(fetchUserRoutesThunk.pending, (state) => {
        state.userRoutesLoading = true;
        state.userRoutesError = null;
      })
      .addCase(fetchUserRoutesThunk.fulfilled, (state, action) => {
        state.userRoutesLoading = false;
        state.userRoutes = action.payload;
      })
      .addCase(fetchUserRoutesThunk.rejected, (state, action) => {
        state.userRoutesLoading = false;
        state.userRoutesError = action.payload;
      })
      
      // Обработка состояний для deleteRouteThunk
      .addCase(deleteRouteThunk.pending, (state) => {
        state.deleteRouteLoading = true;
        state.deleteRouteError = null;
      })
      .addCase(deleteRouteThunk.fulfilled, (state, action) => {
        state.deleteRouteLoading = false;
        // Удаляем маршрут из списка маршрутов пользователя
        state.userRoutes = state.userRoutes.filter(route => route.id !== action.payload);
      })
      .addCase(deleteRouteThunk.rejected, (state, action) => {
        state.deleteRouteLoading = false;
        state.deleteRouteError = action.payload;
      });
  },
});

export const { clearRoute, clearSavedRoute } = mapPointsSlice.actions;

export default mapPointsSlice.reducer; 