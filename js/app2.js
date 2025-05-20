document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('simulation-form');
  const algorithmSelect = document.getElementById('algorithm');
  const ramTitle = document.getElementById('ram-alg');
  const resultsContainer = document.getElementById('results');

  const loadFileBtn = document.getElementById('cargarArchivo');
  const fileInput = document.getElementById('fileInput');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const seed = document.getElementById('seed').value.trim();
    const algorithm = algorithmSelect.value;
    const processCount = document.getElementById('process-count').value;
    const operationCount = document.getElementById('operation-count').value;

    if (!seed) {
      showError('Por favor ingrese un valor para la semilla');
      return;
    }

    // Actualiza el título dinámicamente con el algoritmo seleccionado
    ramTitle.textContent = `RAM - [${algorithm}]`;

    // Simular uso de RAM
    const cantidadUsada = Math.floor(Math.random() * 100) + 1;
    const usoCompartido = generarUsoRamDesdeNumero(cantidadUsada);
    renderRAM('ram-blocks-opt', usoCompartido);
    renderRAM('ram-blocks-alg', usoCompartido);



    // Simula procesamiento (puedes conectar con la lógica que tengas)
    //simulateProcessing(seed, algorithm, processCount, operationCount);
  });


  //
  loadFileBtn.addEventListener('click', () => {
    fileInput.click(); // Abre el selector de archivos
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const contenido = e.target.result;
      procesarArchivo(contenido);
    };

    reader.readAsText(file);
  });




});

/**
 * Procesa el contenido del archivo cargado
 * @param {string} contenido - Texto leído del archivo
 */
function procesarArchivo(contenido) {
  // Divide el contenido en líneas, elimina espacios y filtra vacíos
  const operacionesDesdeArchivo = contenido
  .split("\n")
  .map(linea => linea.trim())
  .filter(linea => linea.length > 0);

  // Mostrar en consola
  console.log("📂 Archivo cargado:", operacionesDesdeArchivo);

  // Aquí podrías hacer algo con las operaciones, como mostrarlas o procesarlas
  // Por ejemplo, mostrar en un alert:
  alert("Operaciones cargadas:\n\n" + operacionesDesdeArchivo.join("\n"));
}

//
function descargarArchivo() {
  if (!contenidoGenerado) {
    alert("Primero genera el escenario antes de descargar.");
    return;
  }

  const blob = new Blob([contenidoGenerado], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "escenario.txt";
  enlace.click();
  URL.revokeObjectURL(url);
}



function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;

  const button = document.getElementById('generate-btn');
  button.parentElement.insertBefore(errorElement, button);

  setTimeout(() => errorElement.classList.add('show'), 10);
  setTimeout(() => {
    errorElement.classList.remove('show');
    setTimeout(() => errorElement.remove(), 300);
  }, 3000);
}

function simulateProcessing(seed, algorithm, processCount, operationCount) {
  console.log('Simulación:', { seed, algorithm, processCount, operationCount });

  // Aquí podrías agregar más lógica real o async

  setTimeout(() => {
    showResults(seed, algorithm, processCount, operationCount);
  }, 2000);
}

function showResults(seed, algorithm, processCount, operationCount) {
  const resultsContainer = document.getElementById('results');

  resultsContainer.innerHTML = `
  <h3>Resultados de la simulación</h3>
  <p><strong>Semilla:</strong> ${seed}</p>
  <p><strong>Algoritmo:</strong> ${algorithm}</p>
  <p><strong>Número de procesos:</strong> ${processCount}</p>
  <p><strong>Número de operaciones:</strong> ${operationCount}</p>
  <p>Los resultados de la simulación se mostrarán aquí...</p>
  `;

  resultsContainer.classList.remove('hidden');
  resultsContainer.scrollIntoView({ behavior: 'smooth' });
}


function renderSummary(summary, containerId) {

  const c = document.getElementById(containerId);
  if (!c) return;

  c.innerHTML = `
  <!-- Tabla de Processes / Sim-Time -->
  <table class="summary-table">
  <tr><th>Processes</th><th>Sim-Time</th></tr>
  <tr><td>${summary.processes}</td><td>${summary.simTime}</td></tr>
  </table>

  <!-- Tabla de RAM / V-RAM -->
  <table class="summary-table">
  <tr>
  <th>RAM KB</th><th>RAM %</th>
  <th>V-RAM KB</th><th>V-RAM %</th>
  </tr>
  <tr>
  <td>${summary.ramKB}</td><td>${summary.ramPct}%</td>
  <td>${summary.vRamKB}</td><td>${summary.vRamPct}%</td>
  </tr>
  </table>

  <!-- Tabla de Pages / Thrashing / Fragmentación -->
  <table class="summary-table">
  <tr>
  <th colspan="2">PAGES</th>
  <th colspan="2">Thrashing</th>
  <th>Fragmentación</th>
  </tr>
  <tr>
  <td>Loaded</td><td>Unloaded</td>
  <td>${summary.thrashingTime}</td><td>${summary.thrashingPct}%</td>
  <td>${summary.fragmentation}</td>
  </tr>
  <tr>
  <td>${summary.pagesLoaded}</td><td>${summary.pagesUnloaded}</td>
  <td colspan="2"></td><td></td>
  </tr>
  </table>
  `;
}

