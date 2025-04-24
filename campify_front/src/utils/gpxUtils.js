// Утилиты для работы с GPX

/**
 * Создает GPX-строку из массива координат маршрута
 * @param {Array} coordinates - Массив координат в формате [[lng, lat], [lng, lat], ...]
 * @param {string} routeName - Название маршрута
 * @returns {string} - GPX строка
 */
export const createGPXFromCoordinates = (coordinates, routeName) => {
    const header = `<?xml version="1.0" encoding="UTF-8"?>
  <gpx version="1.1" creator="Campify App" xmlns="http://www.topografix.com/GPX/1/1">
    <metadata>
      <name>${routeName}</name>
      <time>${new Date().toISOString()}</time>
    </metadata>
    <trk>
      <name>${routeName}</name>
      <trkseg>`;
  
    const footer = `
      </trkseg>
    </trk>
  </gpx>`;
  
    const waypoints = coordinates.map(coord => {
      return `
        <trkpt lat="${coord[1]}" lon="${coord[0]}">
          ${coord[2] ? `<ele>${coord[2]}</ele>` : ''}
          <time>${new Date().toISOString()}</time>
        </trkpt>`;
    }).join('');
  
    return header + waypoints + footer;
  };
  
  /**
   * Преобразует GPX-строку в Blob для передачи на сервер
   * @param {string} gpxString - GPX строка
   * @returns {Blob} - Blob объект
   */
  export const gpxStringToBlob = (gpxString) => {
    return new Blob([gpxString], { type: 'application/gpx+xml' });
  };