document.addEventListener('DOMContentLoaded', function () {
    // Agrega un evento click al botón de exportar a CSV
    document.getElementById('exportCsv').addEventListener('click', exportToCsv);
    
    // Agrega un evento click al botón de exportar a JSON
    document.getElementById('exportJson').addEventListener('click', exportToJson);

    function exportToCsv() {
      const data = getDataFromTable();
      const csvContent = convertToCsv(data);
      downloadFile(csvContent, 'export.csv', 'text/csv');
    }

    function exportToJson() {
      const data = getDataFromTable();
      const jsonContent = JSON.stringify(data, null, 2);
      downloadFile(jsonContent, 'export.json', 'application/json');
    }

    function getDataFromTable() {
      const data = [];
      const rows = document.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        const coin = row.getAttribute('data-coin');
        const price = row.querySelector(`.price-cell-${coin}`).textContent;
        const estimate = row.querySelector(`.estimate-cell-${coin}`).textContent;
        data.push({ Coin: coin, Price: price, Estimate: estimate });
      });

      return data;
    }

    function convertToCsv(data) {
      const header = Object.keys(data[0]).join(',');
      const rows = data.map(obj => Object.values(obj).join(','));
      return `${header}\n${rows.join('\n')}`;
    }

    function downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
      // Mostrar la hora actual al lado de los botones
  const currentTimeDiv = document.getElementById('current-time');
  
  function updateCurrentTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('es-MX');
    currentTimeDiv.textContent = `Hora actual: ${formattedTime}`;
  }

  // Actualizar la hora cada segundo
  setInterval(updateCurrentTime, 1000);
  });
