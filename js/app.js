
// 1. Cajon para el archivo cargado
let operacionesDesdeArchivo = null;

// 2. Cajon para tu lista fijaaaa
const operacionesPorDefecto = [
         "new(1,500)",    // Puntero P1 asignado
            "new(1,1000)",   // Puntero P2 asignado
            "new(1,2000)",   // Puntero P3 asignado
            "use(1)",        // :white_check_mark: HIT (Página P1 en RAM)
            "use(2)",        // :white_check_mark: HIT (Página P2 en RAM)
            "use(3)",        // :white_check_mark: HIT (Página P3 en RAM)
            "new(2,500)",    // :rotating_light: FIFO reemplaza P1 (Memoria llena)
            "use(1)",        // :red_circle: FAULT (Página P1 fue expulsada)
            "use(4)",        // :red_circle: FAULT (Página P4 no existe en RAM)
            "new(2,50)",    // :rotating_light: FIFO reemplaza otra página
            "use(2)",       // :white_check_mark: HIT (Página P2 en RAM)
            "use(3)",       // :white_check_mark: HIT (Página P3 en RAM)
            "use(5)",       // :red_circle: FAULT (Página P5 no existe)
            "delete(2)",    // Página P2 eliminada
            "use(2)",       // :red_circle: FAULT (Página P2 eliminada)
            "kill(1)",      // Todas las páginas del proceso 1 eliminadas
            "new(3,700)",   // :rotating_light: FIFO reemplaza P3
            "use(3)",       // :red_circle: FAULT (Página P3 eliminada)
            "new(4,900)",   // :rotating_light: FIFO reemplaza otra página
            "use(1)",       // :red_circle: FAULT (Página P1 ya no está en memoria
            "use(6)",       // :red_circle: FAULT (Página P6 no existe)
            "delete(3)",    // Eliminación de P3
            "new(5,600)",   // :rotating_light: FIFO reemplaza una página más
            "use(4)",       // :white_check_mark: HIT (Página P4 en RAM)
            "use(7)",       // :red_circle: FAULT (Página P7 no existe en RAM)
            "delete(4)",    // Página eliminada
            "use(5)",       // :white_check_mark: HIT (Página P5 en RAM)
            "use(8)",       // :red_circle: FAULT (Página P8 no está en RAM)
            "new(6,300)",   // :rotating_light: FIFO reemplaza otra página
            "kill(2)"       // Todas las páginas del proceso 2 eliminadas
];



document.addEventListener('DOMContentLoaded', () => {
    const updateBtn = document.getElementById('updateBtn');
    const botonSecondChance = document.getElementById('botonSecondChance');
    const botonMRU = document.getElementById('botonMRU');
    const botonRND = document.getElementById('botonRND');
    const botonOPT = document.getElementById('botonOPT');


    const fileInput = document.getElementById("fileInput");
    const botonCargar = document.getElementById("cargarArchivo");

    botonCargar.addEventListener("click", () => {
        const archivo = fileInput.files[0];
        if (!archivo) {
        alert("❗ Selecciona primero un archivo .txt");
        return;
        }
        const lector = new FileReader();
        lector.onload = e => {
        operacionesDesdeArchivo = e.target.result
            .split("\n")
            .map(l => l.trim())
            .filter(l => l);
        console.log("📂 Archivo cargado:", operacionesDesdeArchivo);
        };
        lector.readAsText(archivo);
    });

    updateBtn.addEventListener("click", () => {
    const ops = operacionesDesdeArchivo || operacionesPorDefecto;
    runSimulation(ops, MMU_FIFO);
    });



    botonSecondChance.addEventListener("click", () => {
    const ops = operacionesDesdeArchivo || operacionesPorDefecto;
    runSimulation(ops, MMU_SC);
    });

    botonMRU.addEventListener("click", () => {
    const ops = operacionesDesdeArchivo || operacionesPorDefecto;
    runSimulation(ops, MMU_MRU);
    });

    botonRND.addEventListener("click", () => {
    const ops = operacionesDesdeArchivo || operacionesPorDefecto;
    runSimulation(ops, MMU_RND);
    });

    botonOPT.addEventListener("click", () => {
    const ops = operacionesDesdeArchivo || operacionesPorDefecto;
    runSimulation(ops, MMU_OPT);
    });


});

function runSimulation(ops, MMUClass) {
  let seqOpt = [];



  if (MMUClass === MMU_OPT) {
    const ptrToPages = new Map();
    let ptrCounter = 1;

    // 1) Generar ptr → [subpáginas]
    ops.forEach(op => {
      if (op.startsWith("new(")) {
        // extraigo pid y size correctamente:
        const [, pidStr, sizeStr] = op.match(/new\((\d+),\s*(\d+)\)/);
        const size = Number(sizeStr);
        const pagesNeeded = Math.ceil(size / 4096);

        const ptr = `P${ptrCounter++}`;
        const pages = Array.from(
          { length: pagesNeeded },
          (_, i) => `${ptr}_pg${i}`
        );
        ptrToPages.set(ptr, pages);
      }
    });

    // 2) A partir de los use(...) construyo la secuencia de page-ids
    seqOpt = [];
    ops.forEach(op => {
      if (op.startsWith("use(")) {
        const ptr = "P" + op.match(/use\((\d+)\)/)[1];
        const pages = ptrToPages.get(ptr) || [];
        seqOpt.push(...pages);
      }
    });
  }


  const mmu = MMUClass === MMU_OPT
    ? new MMU_OPT(3, seqOpt)
    : new MMUClass(3);

  console.log(`\n🔄 Simulación con ${MMUClass.name}...`);
  ops.forEach(op => mmu.executeOperation(op));
  mmu.printFinalStats();
  console.log("✅ Simulación completada.");
}