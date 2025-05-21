
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
      showError('Por favor, ingrese un valor para la semilla');
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

    operacionesDesdeArchivo = null; // Limpiar archivo cargado si se genera nuevo escenario
    // Si la semilla es válida, entonces puedes proceder a generar el escenario
    generarEscenario();
    alert("Escenario generado, puede descargarlo o iniciar la ejecucion");
  });


  // Botón de "Iniciar"
  iniciarEjecucionBtn.addEventListener('click', () => {

    if (!operacionesDesdeArchivo && !contenidoGeneradoParaMemoria) {
      alert("Por favor, cargue un archivo o genere un escenario antes de iniciar la ejecucion");
      return; // Detener ejecución si no hay datos
    }

    ejecutarSimulacion(); // Ejecutar si hay datos
  });


});

function ejecutarSimulacion() {
    const ops = operacionesDesdeArchivo || contenidoGeneradoParaMemoria || operacionesPorDefecto;
    console.log("Operaciones a ejecutar:", ops);
    const algorithmSelect = document.getElementById('algorithm').value;

    // Asegúrate de que las clases de los algoritmos estén cargadas y disponibles en window
    if (typeof window.OPT === 'undefined' || typeof window[algorithmSelect] === 'undefined') {
        console.error('Error: Clase OPT o la clase del algoritmo seleccionado no está definida. Asegúrate de que los scripts se carguen correctamente.');
        alert('Error al cargar los algoritmos. Revisa la consola.');
        return;
    }

    const ventanaRam = window.open("", "_blank", "width=800,height=700,scrollbars=yes,resizable=yes");
    if (!ventanaRam) {
        alert("No se pudo abrir la ventana emergente. Por favor, deshabilita el bloqueador de pop-ups.");
        return;
    }

    ventanaRam.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Simulación Detallada - ${algorithmSelect}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 15px; line-height: 1.6; }
            h2, h3 { text-align: center; color: #333; }
            .main-container { display: flex; flex-direction: column; align-items: center; }
            .stats-flex-container { display: flex; justify-content: space-around; width: 100%; max-width: 1200px; margin-bottom: 20px; flex-wrap: wrap; }
            table.stats-table { width: 48%; min-width: 350px; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            table.memory-details-table { width: 80%; max-width: 800px; border-collapse: collapse; margin: 20px auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
            td span { font-weight: normal; }
            .memory-table-container { width: 100%; margin-top: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="main-container">
            <h2>Comparación de Rendimiento: ${algorithmSelect} vs. OPT</h2>
            
            <div class="stats-flex-container">
                <table class="stats-table">
                    <thead><tr><th>OPT (Óptimo)</th></tr></thead>
                    <tbody>
                        <tr><td><strong>Procesos Activos:</strong> <span id="processOpt">0</span></td></tr>
                        <tr><td><strong>Sim-Time:</strong> <span id="simTimeOpt">0s</span></td></tr>
                        <tr><td><strong>Uso de RAM:</strong> <span id="ramOptUsage">0%</span></td></tr>
                        <tr><td><strong>Fallos de Página:</strong> <span id="pageFaultsOpt">0</span></td></tr>
                        <tr><td><strong>Fragmentación:</strong> <span id="fragmentOpt">0B</span></td></tr>
                        <tr><td><strong>Thrashing (%):</strong> <span id="thrashingOpt">0%</span></td></tr>
                        <tr><td><strong>Tiempo Total en Thrashing:</strong> <span id="thrashingTimeOpt">0s</span></td></tr>
                    </tbody>
                </table>

                <table class="stats-table">
                    <thead><tr><th>${algorithmSelect}</th></tr></thead>
                    <tbody>
                        <tr><td><strong>Procesos Activos:</strong> <span id="processSelected">0</span></td></tr>
                        <tr><td><strong>Sim-Time:</strong> <span id="simTimeSelected">0s</span></td></tr>
                        <tr><td><strong>Uso de RAM:</strong> <span id="ramSelectedUsage">0%</span></td></tr>
                        <tr><td><strong>Fallos de Página:</strong> <span id="pageFaultsSelected">0</span></td></tr>
                        <tr><td><strong>Fragmentación:</strong> <span id="fragmentSelected">0B</span></td></tr>
                        <tr><td><strong>Thrashing (%):</strong> <span id="thrashingSelected">0%</span></td></tr>
                        <tr><td><strong>Tiempo Total en Thrashing:</strong> <span id="thrashingTimeSelected">0s</span></td></tr>
                    </tbody>
                </table>
            </div>

            <div class="memory-table-container">
                <h3>Estado Detallado de la Memoria (${algorithmSelect})</h3>
                <table class="memory-details-table" id="tablaMemoriaAlgoritmo">
                    <thead>
                        <tr>
                            <th>Página</th>
                            <th>Proceso</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        </tbody>
                </table>
            </div>
        </div>

        <script>
            function updateStatsDisplay(data) {
                if (!data) return;
                document.getElementById("processOpt").textContent = data.optProcesses;
                document.getElementById("processSelected").textContent = data.selectedProcesses;
                document.getElementById("simTimeOpt").textContent = data.optTime + "s";
                document.getElementById("simTimeSelected").textContent = data.selectedTime + "s";
                document.getElementById("ramOptUsage").textContent = data.optRamUsage + "%";
                document.getElementById("ramSelectedUsage").textContent = data.selectedRamUsage + "%";
                document.getElementById("pageFaultsOpt").textContent = data.optFaults;
                document.getElementById("pageFaultsSelected").textContent = data.selectedFaults;
                document.getElementById("fragmentOpt").textContent = data.optFragment + "B";
                document.getElementById("fragmentSelected").textContent = data.selectedFragment + "B";
                document.getElementById("thrashingOpt").textContent = data.optThrashing + "%";
                document.getElementById("thrashingSelected").textContent = data.selectedThrashing + "%";
                document.getElementById("thrashingTimeOpt").textContent = data.optThrashingTime + "s";
                document.getElementById("thrashingTimeSelected").textContent = data.selectedThrashingTime + "s";
            }

            function actualizarTablaMemoriaDetallada(datosTabla) {
                const tablaBody = document.getElementById("tablaMemoriaAlgoritmo").querySelector("tbody");
                if (!tablaBody) {
                    console.error("tbody de tablaMemoriaAlgoritmo no encontrado en la nueva ventana.");
                    return;
                }
                tablaBody.innerHTML = ""; // Limpiar contenido anterior

                if (datosTabla && datosTabla.length > 0) {
                    datosTabla.forEach(dato => {
                        const fila = document.createElement("tr");
                        const celdaPagina = document.createElement("td");
                        celdaPagina.textContent = dato.pagina;
                        const celdaProceso = document.createElement("td");
                        celdaProceso.textContent = dato.proceso;
                        const celdaEstado = document.createElement("td");
                        celdaEstado.textContent = dato.estado;
                        fila.appendChild(celdaPagina);
                        fila.appendChild(celdaProceso);
                        fila.appendChild(celdaEstado);
                        tablaBody.appendChild(fila);
                    });
                } else {
                    const fila = document.createElement("tr");
                    const celdaUnica = document.createElement("td");
                    celdaUnica.colSpan = 3;
                    celdaUnica.textContent = "No hay datos de páginas para mostrar o el algoritmo no proporciona esta información.";
                    celdaUnica.style.textAlign = "center";
                    fila.appendChild(celdaUnica);
                    tablaBody.appendChild(fila);
                }
            }

            window.addEventListener("message", (event) => {
                if (event.source !== window.opener) return; // Security: only accept messages from the window that opened this one
                if (event.data) {
                    updateStatsDisplay(event.data); // Actualiza las estadísticas generales
                    if (event.data.memoryTableDataSelected) {
                        actualizarTablaMemoriaDetallada(event.data.memoryTableDataSelected);
                    } else {
                        // Si no hay datos de tabla, podrías limpiar la tabla o mostrar un mensaje
                         actualizarTablaMemoriaDetallada([]); // Llama con array vacío para limpiar/mostrar mensaje
                    }
                }
            });
        <\/script> 
    </body>
    </html>
    `);
    ventanaRam.document.close(); // Es importante cerrar el document después de escribir en él.

        // Crear la secuencia futura de accesos para el algoritmo OPT
  const ptrToPages = new Map();
  let ptrCounter = 1;
  const seqOpt = [];

  // Paso 1: detectar las páginas que se van a crear
  ops.forEach(op => {
    if (op.startsWith("new(")) {
      const match = op.match(/new\((\d+),\s*(\d+)\)/);
      if (!match) return;
      const size = Number(match[2]);
      const pages = Math.ceil(size / 4096);
      const ptr = `P${ptrCounter++}`;
      const subpages = Array.from({ length: pages }, (_, i) => `${ptr}_pg${i}`);
      ptrToPages.set(ptr, subpages);
    }
  });

  // Paso 2: detectar las páginas que se van a usar en orden
  ops.forEach(op => {
    if (op.startsWith("use(")) {
      const match = op.match(/use\((\d+)\)/);
      if (!match) return;
      const ptr = `P${match[1]}`;
      const subpages = ptrToPages.get(ptr) || [];
      seqOpt.push(...subpages);
    }
  });    

    
    const mmuOPT = new window.OPT(10, ops); // OPT podría necesitar las operaciones de antemano
    const mmuSelected = new window[algorithmSelect](10); // Tamaño de RAM, por ejemplo 10 páginas

    let index = 0;
    function ejecutarPaso() {
        if (index < ops.length) {
            const op = ops[index++];
            
            // Ejecutar operación en ambos MMUs
            if(mmuOPT.executeOperation) mmuOPT.executeOperation(op); // OPT puede tener una lógica diferente
            mmuSelected.executeOperation(op);

            // Preparar payload para postMessage
            const messagePayload = {
                optProcesses: mmuOPT.processTable ? mmuOPT.processTable.size : 0,
                selectedProcesses: mmuSelected.processTable.size,
                optTime: mmuOPT.clock,
                selectedTime: mmuSelected.clock,
                optFaults: mmuOPT.thrashing / 5, // Asumiendo que cada fallo cuesta 5s
                selectedFaults: mmuSelected.thrashing / 5,
                optFragment: mmuOPT.fragmentacion,
                selectedFragment: mmuSelected.fragmentacion,
                optThrashing: ((mmuOPT.thrashing / (mmuOPT.clock || 1)) * 100).toFixed(2),
                selectedThrashing: ((mmuSelected.thrashing / (mmuSelected.clock || 1)) * 100).toFixed(2),
                optRamUsage: mmuOPT.ramSize > 0 ? ((mmuOPT.ram.size / mmuOPT.ramSize) * 100).toFixed(2) : "0.00",
                selectedRamUsage: mmuSelected.ramSize > 0 ? ((mmuSelected.ram.size / mmuSelected.ramSize) * 100).toFixed(2) : "0.00",
                optThrashingTime: mmuOPT.thrashing,
                selectedThrashingTime: mmuSelected.thrashing,
                memoryTableDataSelected: [] // Por defecto, un array vacío
            };

            if (typeof mmuSelected.getMemoryTableData === 'function') {
                messagePayload.memoryTableDataSelected = mmuSelected.getMemoryTableData();
            }

            if (ventanaRam && !ventanaRam.closed) {
                ventanaRam.postMessage(messagePayload, "*"); // El target origin '*' es por simplicidad, en producción se debe especificar.
            }

            setTimeout(ejecutarPaso, 200); // Ajusta el tiempo para la velocidad de simulación (ej. 200ms)
        } else {
            // Simulación completada
            if(mmuOPT.printFinalStats) mmuOPT.printFinalStats();
            mmuSelected.printFinalStats();
            
            // Enviar una última actualización de datos a la ventana emergente
            const finalMessagePayload = {
                optProcesses: mmuOPT.processTable ? mmuOPT.processTable.size : 0,
                selectedProcesses: mmuSelected.processTable.size,
                optTime: mmuOPT.clock,
                selectedTime: mmuSelected.clock,
                optFaults: mmuOPT.thrashing / 5,
                selectedFaults: mmuSelected.thrashing / 5,
                optFragment: mmuOPT.fragmentacion,
                selectedFragment: mmuSelected.fragmentacion,
                optThrashing: ((mmuOPT.thrashing / (mmuOPT.clock || 1)) * 100).toFixed(2),
                selectedThrashing: ((mmuSelected.thrashing / (mmuSelected.clock || 1)) * 100).toFixed(2),
                optRamUsage: mmuOPT.ramSize > 0 ? ((mmuOPT.ram.size / mmuOPT.ramSize) * 100).toFixed(2) : "0.00",
                selectedRamUsage: mmuSelected.ramSize > 0 ? ((mmuSelected.ram.size / mmuSelected.ramSize) * 100).toFixed(2) : "0.00",
                optThrashingTime: mmuOPT.thrashing,
                selectedThrashingTime: mmuSelected.thrashing,
                memoryTableDataSelected: []
            };
            if (typeof mmuSelected.getMemoryTableData === 'function') {
                finalMessagePayload.memoryTableDataSelected = mmuSelected.getMemoryTableData();
            }
            if (ventanaRam && !ventanaRam.closed) {
                ventanaRam.postMessage(finalMessagePayload, "*");
            }
            console.log("Simulación finalizada.");
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

  contenidoGeneradoParaMemoria = null; // Limpiar escenario generado si se carga archivo

  // Mostrar en consola
  console.log("📂 Archivo cargado:", operacionesDesdeArchivo);

  document.getElementById('iniciarEjecucionBtn').disabled = false;
}


//
function descargarArchivo() {
  if (!contenidoGeneradoParaArchivo) {
    alert("Primero genere  el escenario para descargarlo.");
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

// No se usa, era una tabla de Joseph pero no se pudo poner
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

