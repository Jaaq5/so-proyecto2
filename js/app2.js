
let operacionesDesdeArchivo = null;

// Lista de operaciones para la simulación
const operacionesPorDefecto = [
  "new(55, 5379)", "new(8, 15656)", "new(17, 14365)", "new(22, 2065)", "new(19, 830)",
  "new(79, 1608)", "new(64, 7220)", "new(42, 14373)", "new(70, 10079)", "use(5)",
  "new(28, 11599)", "new(12, 10069)", "new(57, 5259)", "new(94, 13454)", "new(75, 10074)",
  "new(80, 7784)", "new(10, 10638)", "delete(8)", "new(61, 3102)", "use(11)",
  "new(24, 4057)", "new(82, 8884)", "new(86, 15988)", "new(7, 5431)", "new(69, 8189)",
  "new(1, 13834)", "new(65, 5643)", "new(40, 2254)", "new(21, 10209)", "new(81, 12091)",
  "new(50, 10660)", "new(29, 2828)", "use(19)", "new(53, 7408)", "new(74, 4641)",
  "new(78, 8111)", "new(89, 6522)", "new(49, 3420)", "new(62, 5532)", "use(17)",
  "new(43, 2864)", "use(27)", "new(84, 5076)", "new(30, 1559)", "new(72, 3384)",
  "new(100, 4311)", "new(85, 11177)", "new(35, 8070)", "use(33)", "new(72, 7695)",
  "new(71, 9681)", "use(23)", "new(98, 2033)", "delete(34)", "use(36)", "new(79, 2874)",
  "use(24)", "use(33)", "new(27, 11158)", "new(87, 7841)", "new(41, 7890)", "new(33, 11532)",
  "new(32, 3494)", "new(40, 6179)", "new(23, 1346)", "new(10, 6101)", "new(44, 9749)",
  "new(36, 10508)", "new(79, 5410)", "new(80, 11130)", "new(60, 556)", "new(46, 1737)",
  "new(6, 2333)", "new(48, 10182)", "delete(17)", "use(16)", "delete(4)", "use(50)",
  "use(2)", "new(92, 8512)", "new(67, 11120)", "delete(38)", "new(22, 9604)", "new(82, 8317)",
  "new(60, 9238)", "new(76, 15376)", "new(79, 1555)", "delete(7)", "new(18, 2190)",
  "delete(30)", "use(50)", "new(95, 15034)", "new(4, 15408)", "new(23, 4098)", "new(53, 12856)",
  "delete(19)", "new(97, 4506)", "new(12, 2420)", "new(62, 10218)", "new(39, 15991)",
  "new(57, 8407)", "kill(23)", "new(31, 722)", "new(44, 7096)", "new(4, 10922)", "delete(21)",
  "new(64, 2048)", "use(59)", "new(48, 2801)", "new(84, 7227)", "delete(14)", "use(54)",
  "new(75, 15595)", "delete(84)", "new(14, 7634)", "new(77, 6227)", "delete(62)", "delete(15)",
  "new(82, 8085)", "new(68, 9651)", "delete(12)", "new(56, 7391)", "new(66, 825)", "use(56)",
  "new(59, 8534)", "use(68)", "new(3, 6297)", "use(5)", "new(61, 13302)", "new(1, 3037)",
  "new(89, 1039)", "new(15, 13136)", "delete(27)", "new(13, 2230)", "new(47, 6308)", "delete(56)",
  "new(93, 6996)", "new(45, 14675)", "new(58, 5510)", "use(67)", "new(5, 15581)", "use(28)",
  "new(49, 10616)", "new(70, 8987)", "use(60)", "use(11)", "delete(54)", "new(54, 7403)",
  "delete(101)", "delete(48)", "new(51, 7833)", "new(28, 1492)", "use(65)", "delete(44)",
  "delete(46)", "new(81, 4598)", "new(99, 10708)", "new(68, 3761)", "new(88, 11048)", "new(36, 13390)",
  "new(20, 4550)", "delete(41)", "new(11, 6975)", "new(16, 13894)", "new(90, 3863)", "delete(94)",
  "new(77, 10366)", "delete(102)", "kill(97)", "kill(88)", "kill(30)"
];


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('simulation-form');
  const algorithmSelect = document.getElementById('algorithm');
  const ramTitle = document.getElementById('ram-alg');
  const resultsContainer = document.getElementById('results');
  const seedInput = document.getElementById('seed');
  const generarEscenarioBtn = document.getElementById('generarEscenario');
  const iniciarEjecucionBtn = document.getElementById('iniciarEjecucionBtn');
  const loadFileBtn = document.getElementById('cargarArchivo');
  const fileInput = document.getElementById('fileInput');

  /*

  /// Validación para habilitar/deshabilitar el botón de "Generar escenario"
  document.getElementById('seed').addEventListener('input', function () {
    const seed = this.value;
    const generarEscenarioBtn = document.getElementById('generarEscenario');

    if (seed !== "" && !isNaN(seed)) {
      generarEscenarioBtn.disabled = false;
    } else {
      generarEscenarioBtn.disabled = true;
    }
  });

  // Validación para habilitar/deshabilitar el botón de "Iniciar ejecución"
  document.getElementById('seed').addEventListener('input', function () {
    const seed = this.value;
    const iniciarEjecucionBtn = document.getElementById('iniciarEjecucionBtn');

    if (seed !== "" && !isNaN(seed)) {
      iniciarEjecucionBtn.disabled = false;
    } else {
      iniciarEjecucionBtn.disabled = true;
    }
  });

  */

  /*
  // Boton de ejecucucion
  document.getElementById('iniciarEjecucionBtn').addEventListener('click', () => {

    const iniciarEjecucionBtn = document.getElementById('iniciarEjecucionBtn');

    // Si el botón está deshabilitado, mostramos el alert
    if (iniciarEjecucionBtn.disabled) {
      alert("Por favor, genere un escenario o carge un archivo antes de iniciar la ejecucion.");
      return;  // No ejecuta más código si el botón está deshabilitado
    }

    ejecutarSimulacion();
  });

  */

  // Ui de de la RAM
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

  // Botón de "Generar escenario"
  generarEscenarioBtn.addEventListener('click', () => {
    const seed = seedInput.value.trim();
    if (seed === "" || isNaN(seed)) {
      alert("Por favor, ingrese una semilla valida (un numero)");
      return; // Detener la ejecución si la semilla no es válida
    }

    // Si la semilla es válida, entonces puedes proceder a generar el escenario
    generarEscenario();
  });


  // Botón de "Iniciar"
  iniciarEjecucionBtn.addEventListener('click', () => {
    const seed = seedInput.value.trim();
    if (operacionesDesdeArchivo !== NULL && contenidoGeneradoParaMemoria == NULL) {
      //alert("Por favor, ingrese una semilla valida (un numero)");
      return; // Detener la ejecución si la semilla no es válida
    }

    // Si la semilla es válida, entonces puedes proceder a generar el escenario
    ejecutarSimulacion();
  });


});


//////////////////////////////////////////////////////////////////////////////////////////////////////
function ejecutarSimulacion() {
  // contenidoGenerado esta en pruebaRandom.js
  const ops =  operacionesDesdeArchivo || contenidoGeneradoParaMemoria || operacionesPorDefecto;
  console.log(ops);
  const algorithmSelect = document.getElementById('algorithm').value;

  /*
  // Verificar que OPT existe
  if (typeof OPT === 'undefined') {
    console.error('Error: Clase OPT no está definida');
    return;
  }
  */

  const ventanaRam = window.open("", "_blank", "width=500,height=400");

  ventanaRam.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Comparación de RAM - ${algorithmSelect}</title>
            <style>
                .status-container { display: flex; justify-content: space-between; margin-top: 15px; }
                table { width: 48%; border-collapse: collapse; text-align: center; }
                th, td { border: 1px solid #bbb; padding: 8px; }
                th { background-color: #ddd; }
            </style>
        </head>
        <body>
            <h2>Comparación de RAM - ${algorithmSelect}</h2>
            <h3>Hola</h3>
            <h3>Estado de la Simulación</h3>
            <div class="status-container">
                <table>
                    <thead>
                        <tr><th>OPT (Óptimo)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Procesos Activos:</strong> <span id="processOpt">0</span></td></tr>
                        <tr><td><strong>Sim-Time:</strong> <span id="simTimeOpt">0s</span></td></tr>
                        <tr><td><strong>Uso de RAM:</strong> <span id="ramOptUsage">0%</span></td></tr>
                        <tr><td><strong>Fallos de Página:</strong> <span id="pageFaultsOpt">0</span></td></tr>
                        <tr><td><strong>Fragmentación:</strong> <span id="fragmentOpt">0B</span></td></tr>
                        <tr><td><strong>Thrashing:</strong> <span id="thrashingOpt">0%</span></td></tr>
                    </tbody>
                </table>

                <table>
                    <thead>
                        <tr><th>${algorithmSelect}</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Procesos Activos:</strong> <span id="processSelected">0</span></td></tr>
                        <tr><td><strong>Sim-Time:</strong> <span id="simTimeSelected">0s</span></td></tr>
                        <tr><td><strong>Uso de RAM:</strong> <span id="ramSelectedUsage">0%</span></td></tr>
                        <tr><td><strong>Fallos de Página:</strong> <span id="pageFaultsSelected">0</span></td></tr>
                        <tr><td><strong>Fragmentación:</strong> <span id="fragmentSelected">0B</span></td></tr>
                        <tr><td><strong>Thrashing:</strong> <span id="thrashingSelected">0%</span></td></tr>
                    </tbody>
                </table>
                <!-- TABLA DE ESTADO DE MEMORIA -->
                <h3>Estado final de la Memoria</h3>
                <table id="tablaMemoria" border="1">
                <thead>
                <tr>
                <th>Página</th>
                <th>Proceso</th>
                <th>Estado</th>
                </tr>
                </thead>
                <tbody>
                <!-- Aquí se insertarán dinámicamente las filas -->
                </tbody>
                </table>
            </div>

            <script>
                function updateStats(optProcesses, selectedProcesses, optTime, selectedTime, optFaults, selectedFaults, optFragment, selectedFragment, optThrashing, selectedThrashing, optRamUsage, selectedRamUsage) {
                    document.getElementById("processOpt").textContent = optProcesses;
                    document.getElementById("processSelected").textContent = selectedProcesses;
                    document.getElementById("simTimeOpt").textContent = optTime + "s";
                    document.getElementById("simTimeSelected").textContent = selectedTime + "s";
                    document.getElementById("ramOptUsage").textContent = optRamUsage + "%";
                    document.getElementById("ramSelectedUsage").textContent = selectedRamUsage + "%";
                    document.getElementById("pageFaultsOpt").textContent = optFaults;
                    document.getElementById("pageFaultsSelected").textContent = selectedFaults;
                    document.getElementById("fragmentOpt").textContent = optFragment + "B";
                    document.getElementById("fragmentSelected").textContent = selectedFragment + "B";
                    document.getElementById("thrashingOpt").textContent = optThrashing + "%";
                    document.getElementById("thrashingSelected").textContent = selectedThrashing + "%";
                }

                window.addEventListener("message", (event) => {
                    const { optProcesses, selectedProcesses, optTime, selectedTime, optFaults, selectedFaults, optFragment, selectedFragment, optThrashing, selectedThrashing, optRamUsage, selectedRamUsage } = event.data;
                    updateStats(optProcesses, selectedProcesses, optTime, selectedTime, optFaults, selectedFaults, optFragment, selectedFragment, optThrashing, selectedThrashing, optRamUsage, selectedRamUsage);
                });
            </script>
        </body>
        </html>
    `);

  const mmuOPT = new OPT(100, []);
  const mmuSelected = new (window[algorithmSelect])(100);

  let index = 0;
  function ejecutarPaso() {
    if (index < ops.length) {
      const op = ops[index++];
      mmuOPT.executeOperation(op);
      mmuSelected.executeOperation(op);

      ventanaRam.postMessage({
        optProcesses: mmuOPT.processTable.size,
        selectedProcesses: mmuSelected.processTable.size,
        optTime: mmuOPT.clock,
        selectedTime: mmuSelected.clock,
        optFaults: mmuOPT.thrashing / 5,
        selectedFaults: mmuSelected.thrashing / 5,
        optFragment: mmuOPT.fragmentacion,
        selectedFragment: mmuSelected.fragmentacion,
        optThrashing: ((mmuOPT.thrashing / mmuOPT.clock) * 100).toFixed(2),
                             selectedThrashing: ((mmuSelected.thrashing / mmuSelected.clock) * 100).toFixed(2),
                             optRamUsage: ((mmuOPT.queue?.length || 0) / (mmuOPT.ramSize || 1) * 100).toFixed(2),
                             selectedRamUsage: ((mmuSelected.queue?.length || 0) / (mmuSelected.ramSize || 1) * 100).toFixed(2)
      }, "*");

      setTimeout(ejecutarPaso, 5);
    } else {
      mmuOPT.printFinalStats();
      mmuSelected.printFinalStats();
    }
  }

  ejecutarPaso();
}

/**
 * Procesa el contenido del archivo cargado
 * @param {string} contenido - Texto leído del archivo
 */
function procesarArchivo(contenido) {
  // Divide el contenido en líneas y filtra vacías (sin recortar espacios internos)
  operacionesDesdeArchivo = contenido
  .split("\n")
  .filter(linea => linea.trim().length > 0); // Filtra líneas vacías pero mantiene espacios internos

  // Mostrar en consola
  console.log("📂 Archivo cargado:", operacionesDesdeArchivo);

  document.getElementById('iniciarEjecucionBtn').disabled = false;
}


//
function descargarArchivo() {
  if (!contenidoGeneradoParaArchivo) {
    alert("Primero genera el escenario antes de descargar.");
    return;
  }

  const blob = new Blob([contenidoGeneradoParaArchivo], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "Escenario.txt";
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

