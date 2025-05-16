
// 1. Cajon para el archivo cargado
let operacionesDesdeArchivo = null;

// 2. Cajon para tu lista fijaaaa
const operacionesPorDefecto = [
         "1 new(1,500)",    // Puntero P1 asignado
            "2 new(1,1000)",   // Puntero P2 asignado
            "3 new(1,2000)",   // Puntero P3 asignado
            "4 use(1)",        // :white_check_mark: HIT (Página P1 en RAM)
            "5 use(2)",        // :white_check_mark: HIT (Página P2 en RAM)
            "6 use(3)",        // :white_check_mark: HIT (Página P3 en RAM)
            "7 new(2,500)",    // :rotating_light: FIFO reemplaza P1 (Memoria llena)
            "8 use(1)",        // :red_circle: FAULT (Página P1 fue expulsada)
            "9 use(4)",        // :red_circle: FAULT (Página P4 no existe en RAM)
            "10 new(2,50)",    // :rotating_light: FIFO reemplaza otra página
            "11 use(2)",       // :white_check_mark: HIT (Página P2 en RAM)
            "12 use(3)",       // :white_check_mark: HIT (Página P3 en RAM)
            "13 use(5)",       // :red_circle: FAULT (Página P5 no existe)
            "14 delete(2)",    // Página P2 eliminada
            "15 use(2)",       // :red_circle: FAULT (Página P2 eliminada)
            "16 kill(1)",      // Todas las páginas del proceso 1 eliminadas
            "17 new(3,700)",   // :rotating_light: FIFO reemplaza P3
            "18 use(3)",       // :red_circle: FAULT (Página P3 eliminada)
            "19 new(4,900)",   // :rotating_light: FIFO reemplaza otra página
            "20 use(1)",       // :red_circle: FAULT (Página P1 ya no está en memoria
            "21 use(6)",       // :red_circle: FAULT (Página P6 no existe)
            "22 delete(3)",    // Eliminación de P3
            "23 new(5,600)",   // :rotating_light: FIFO reemplaza una página más
            "24 use(4)",       // :white_check_mark: HIT (Página P4 en RAM)
            "25 use(7)",       // :red_circle: FAULT (Página P7 no existe en RAM)
            "26 delete(4)",    // Página eliminada
            "27 use(5)",       // :white_check_mark: HIT (Página P5 en RAM)
            "28 use(8)",       // :red_circle: FAULT (Página P8 no está en RAM)
            "29 new(6,300)",   // :rotating_light: FIFO reemplaza otra página
            "30 kill(2)"       // Todas las páginas del proceso 2 eliminadas
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
    seqOpt = ops
      .filter(l => l.includes("use("))
      .map(l => "P" + l.match(/use\((\d+)\)/)[1]);
  }

  const mmu = MMUClass === MMU_OPT
    ? new MMU_OPT(3, seqOpt)
    : new MMUClass(3);

  console.log(`\n🔄 Simulación con ${MMUClass.name}...`);
  ops.forEach(op => mmu.executeOperation(op));
  mmu.printFinalStats();
  console.log("✅ Simulación completada.");
}