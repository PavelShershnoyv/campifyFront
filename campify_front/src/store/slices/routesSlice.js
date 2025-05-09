import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAndParseGpx } from '../../utils/gpxParser';

const apiUrl = process.env.REACT_APP_API_URL;

// Функция для форматирования времени из формата "HH:MM:SS" в "X ч Y мин"
const formatDuration = (duration) => {
  if (!duration) return "Неизвестно";
  
  const parts = duration.split(':');
  if (parts.length !== 3) return duration;
  
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  
  if (hours === 0) {
    return `${minutes} мин`;
  } else if (minutes === 0) {
    return `${hours} ч`;
  } else {
    return `${hours} ч ${minutes} мин`;
  }
};

// Асинхронный action для загрузки маршрутов с бэкенда
export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/routes/`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Трансформируем данные в нужный формат для фронтенда
      return data.map(route => ({
        id: route.id.toString(),
        title: route.name,
        description: route.description,
        country: 'Россия', // Устанавливаем страну как Россия
        region: route.location_area.replace('Россия ', ''), // Убираем 'Россия ' из начала строки, если она есть
        distance: `${parseFloat(route.length_in_km).toFixed(2)} км`,
        time: formatDuration(route.duration),
        rating: route.average_rating ? route.average_rating.toFixed(1) : '0.0', // Используем average_rating из API
        difficulty: route.difficulty,
        type: route.type === 2 ? 'wild' : 'equipped', // Предполагаем, что 2 - дикие, 1 - обустроенные
        height: `${route.height} м`,
        gpxUrl: route.gpx_url,
        author: route.author,
        createdAt: route.created_at,
        views: route.views
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный action для загрузки конкретного маршрута по ID
export const fetchRouteById = createAsyncThunk(
  'routes/fetchRouteById',
  async (routeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/routes/${routeId}/`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const route = await response.json();
      
      // Трансформируем данные в нужный формат
      return {
        id: route.id.toString(),
        title: route.name,
        description: route.description,
        country: 'Россия', // Устанавливаем страну как Россия
        region: route.location_area.replace('Россия ', ''), // Убираем 'Россия ' из начала строки, если она есть
        distance: `${parseFloat(route.length_in_km).toFixed(2)} км`,
        time: formatDuration(route.duration),
        rating: route.average_rating ? route.average_rating.toFixed(1) : '0.0',
        difficulty: route.difficulty,
        type: route.type === 2 ? 'wild' : 'equipped',
        height: `${route.height} м`,
        gpxUrl: route.gpx_url,
        author: route.author,
        createdAt: route.created_at,
        views: route.views,
        details: {
          distance: parseFloat(route.length_in_km).toFixed(2),
          duration: formatDuration(route.duration),
          height: `${route.height} м`,
          routeType: route.type === 2 ? 'Дикий' : 'Обустроенный',
          difficulty: route.difficulty
        },
        comments: [] // В API пока нет комментариев, добавим пустой массив
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный action для загрузки фотографий маршрута по ID
export const fetchRoutePhotos = createAsyncThunk(
  'routes/fetchRoutePhotos',
  async (routeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/routes/${routeId}/photos/`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const photos = await response.json();
      return { 
        routeId, 
        photos 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный action для загрузки GPX файла маршрута по ID
export const fetchRouteGpx = createAsyncThunk(
  'routes/fetchRouteGpx',
  async (routeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/routes/${routeId}/gpx/`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const gpxData = await response.text();
      
      // Парсим GPX в массив координат для MapBox
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxData, "text/xml");
      
      // Получаем все точки трека (trkpt)
      const trackPoints = xmlDoc.getElementsByTagName("trkpt");
      
      // Преобразуем точки в массив координат в формате [longitude, latitude]
      const coordinates = [];
      for (let i = 0; i < trackPoints.length; i++) {
        const point = trackPoints[i];
        const lat = parseFloat(point.getAttribute("lat"));
        const lon = parseFloat(point.getAttribute("lon"));
        
        if (!isNaN(lat) && !isNaN(lon)) {
          coordinates.push([lon, lat]); // MapBox использует формат [longitude, latitude]
        }
      }

      
      // Вычисляем центральную точку для карты
      let centerCoordinate = null;
      if (coordinates.length > 0) {
        const centerIndex = Math.floor(coordinates.length / 2);
        centerCoordinate = coordinates[centerIndex];
      }
      
      return { 
        routeId, 
        coordinates,
        centerCoordinate
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный action для скачивания GPX файла маршрута по ID
export const downloadRouteGpx = createAsyncThunk(
  'routes/downloadRouteGpx',
  async (routeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/routes/${routeId}/download/gpx/`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      // Получаем файл как Blob
      const blob = await response.blob();
      
      // Создаем временную ссылку для скачивания файла
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `route-${routeId}.gpx`;
      document.body.appendChild(a);
      a.click();
      
      // Очищаем ресурсы
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный action для обновления статуса публичности маршрута
export const updateRoutePublicStatus = createAsyncThunk(
  'routes/updateRoutePublicStatus',
  async ({ routeId, isPublic }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/routes/${routeId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важно для работы с куками
        body: JSON.stringify({
          is_public: isPublic
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const updatedRoute = await response.json();
      return {
        routeId: updatedRoute.id.toString(),
        isPublic: updatedRoute.is_public
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный action для скачивания чек-листа маршрута по ID
export const downloadRouteChecklist = createAsyncThunk(
  'routes/downloadRouteChecklist',
  async (routeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${apiUrl}/api/routes/${routeId}/checklist/`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      // Получаем файл как Blob
      const blob = await response.blob();
      
      // Создаем временную ссылку для скачивания файла
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `checklist-route-${routeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Очищаем ресурсы
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  routes: [],
  wildRoutes: [],
  equippedRoutes: [],
  currentRoute: null,
  routePhotos: {}, // Словарь для хранения фотографий маршрутов по их ID
  routeGpxData: {}, // Словарь для хранения GPX-данных маршрутов по их ID
  loading: false,
  photosLoading: false, // Отдельное состояние загрузки для фотографий
  gpxLoading: false, // Отдельное состояние загрузки для GPX-данных
  downloadLoading: false, // Состояние загрузки для скачивания GPX файла
  error: null,
  photosError: null, // Отдельное состояние ошибки для фотографий
  gpxError: null, // Отдельное состояние ошибки для GPX-данных
  downloadError: null, // Состояние ошибки для скачивания GPX файла
  checklistDownloadLoading: false, // Состояние загрузки для скачивания чек-листа
  checklistDownloadError: null, // Состояние ошибки для скачивания чек-листа
};

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setCurrentRoute: (state, action) => {
      state.currentRoute = action.payload;
    },
    filterRoutes: (state, action) => {
      // Пример фильтрации по критериям
      const { difficulty, distance } = action.payload;
      if (difficulty) {
        state.routes = state.routes.filter(route => route.difficulty === difficulty);
      }
      // Другие фильтры могут быть добавлены здесь
    },
    addComment: (state, action) => {
      const { routeId, comment } = action.payload;
      if (state.currentRoute && state.currentRoute.id === routeId) {
        if (!state.currentRoute.comments) {
          state.currentRoute.comments = [];
        }
        state.currentRoute.comments.push(comment);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработчики для fetchRoutes
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.routes = action.payload;
        // Разделяем маршруты на дикие и обустроенные
        state.wildRoutes = action.payload.filter(route => route.type === 'wild');
        state.equippedRoutes = action.payload.filter(route => route.type === 'equipped');
        state.loading = false;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Обработчики для fetchRouteById
      .addCase(fetchRouteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRouteById.fulfilled, (state, action) => {
        state.currentRoute = action.payload;
        state.loading = false;
      })
      .addCase(fetchRouteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Обработчики для fetchRoutePhotos
      .addCase(fetchRoutePhotos.pending, (state) => {
        state.photosLoading = true;
        state.photosError = null;
      })
      .addCase(fetchRoutePhotos.fulfilled, (state, action) => {
        const { routeId, photos } = action.payload;
        state.routePhotos[routeId] = photos;
        state.photosLoading = false;
      })
      .addCase(fetchRoutePhotos.rejected, (state, action) => {
        state.photosLoading = false;
        state.photosError = action.payload;
      })
      
      // Обработчики для fetchRouteGpx
      .addCase(fetchRouteGpx.pending, (state) => {
        state.gpxLoading = true;
        state.gpxError = null;
      })
      .addCase(fetchRouteGpx.fulfilled, (state, action) => {
        const { routeId, coordinates, centerCoordinate } = action.payload;
        state.routeGpxData[routeId] = { coordinates, centerCoordinate };
        state.gpxLoading = false;
      })
      .addCase(fetchRouteGpx.rejected, (state, action) => {
        state.gpxLoading = false;
        state.gpxError = action.payload;
      })
      
      // Обработчики для downloadRouteGpx
      .addCase(downloadRouteGpx.pending, (state) => {
        state.downloadLoading = true;
        state.downloadError = null;
      })
      .addCase(downloadRouteGpx.fulfilled, (state) => {
        state.downloadLoading = false;
      })
      .addCase(downloadRouteGpx.rejected, (state, action) => {
        state.downloadLoading = false;
        state.downloadError = action.payload;
      })
      
      // Обработчики для updateRoutePublicStatus
      .addCase(updateRoutePublicStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoutePublicStatus.fulfilled, (state, action) => {
        state.currentRoute = {
          ...state.currentRoute,
          isPublic: action.payload.isPublic
        };
        state.loading = false;
      })
      .addCase(updateRoutePublicStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Обработчики для downloadRouteChecklist
      .addCase(downloadRouteChecklist.pending, (state) => {
        state.checklistDownloadLoading = true;
        state.checklistDownloadError = null;
      })
      .addCase(downloadRouteChecklist.fulfilled, (state) => {
        state.checklistDownloadLoading = false;
      })
      .addCase(downloadRouteChecklist.rejected, (state, action) => {
        state.checklistDownloadLoading = false;
        state.checklistDownloadError = action.payload;
      });
  },
});

export const { setCurrentRoute, filterRoutes, addComment } = routesSlice.actions;

export default routesSlice.reducer; 