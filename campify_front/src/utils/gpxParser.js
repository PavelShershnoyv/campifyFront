/**
 * Парсинг GPX-данных и преобразование в массив координат для MapBox
 * 
 * @param {string} gpxData - Строка с GPX данными
 * @returns {Object} Объект с массивом coordinates и centerCoordinate для MapBox
 */
export const parseGpxToCoordinates = (gpxData) => {
  try {
    // Создаем DOM-парсер для работы с XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxData, "text/xml");
    
    // Получаем все точки трека (trkpt)
    const trackPoints = xmlDoc.getElementsByTagName("trkpt");
    
    if (!trackPoints || trackPoints.length === 0) {
      console.error("Не найдены точки трека в GPX файле");
      return { coordinates: [], centerCoordinate: null };
    }
    
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
      coordinates,
      centerCoordinate
    };
  } catch (error) {
    console.error("Ошибка при парсинге GPX файла:", error);
    return { coordinates: [], centerCoordinate: null };
  }
};

/**
 * Загрузка GPX-файла по URL и преобразование в координаты для MapBox
 * 
 * @param {string} gpxUrl - URL GPX файла
 * @returns {Promise<Object>} Promise с объектом, содержащим массив coordinates и centerCoordinate
 */
export const fetchAndParseGpx = async (gpxUrl) => {
  try {
    const response = await fetch(gpxUrl);
    
    if (!response.ok) {
      throw new Error(`Ошибка загрузки GPX: ${response.status}`);
    }
    
    const gpxData = await response.text();
    return parseGpxToCoordinates(gpxData);
  } catch (error) {
    console.error("Ошибка при загрузке GPX файла:", error);
    return { coordinates: [], centerCoordinate: null };
  }
}; 