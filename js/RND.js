class MMU_RND {
    constructor(ramSize) {
        console.log(`🔧 Inicializando MMU con ${ramSize} páginas en memoria.`);
        this.ramSize = ramSize;
        this.ram = new Map();
        this.clock = 0;        // Tiempo total de simulación
        this.thrashing = 0;    // Tiempo perdido en fallos de páginas
        this.fragmentacion = 0; // Bytes desperdiciados por fragmentación interna
        this.processTable = new Map();

    
    }

    executeOperation(operation) {


        console.log(`\n📝 Ejecutando operación: ${operation}`);

        //SE ELIMINA ESE NUMERO QUE VENIA AL PRINCIPIO
        const command = operation.trim();
        const [type, rawParams] = command.split("(");
        const params = rawParams
        .replace(")", "")
        .split(",")
        .map(Number);


    if (type === "new") {

      const [pid, size] = params;

      // Asignamos pagina
      const ptr = this.allocatePage(pid, size);

      if (!this.processTable.has(pid)) this.processTable.set(pid, []);
      this.processTable.get(pid).push(ptr);

    } else if (type === "use") {
      //  formateamos con P como los demas
      const [ptrIndex] = params;
      const ptr = `P${ptrIndex}`;
      this.usePage(ptr);

    } else if (type === "delete") {
      const [ptrIndex] = params;
      const ptr = `P${ptrIndex}`;
      this.deletePage(ptr);

    } else if (type === "kill") {
      const [pid] = params;
      this.killProcess(pid);
    }

    this.printStatus();
  }

    allocatePage(pid, size) {
        let ptr = `P${this.ram.size + 1}`; // Generamos un puntero para la nueva página
        let desperdicio = (Math.ceil(size / 4096) * 4096) - size; // Calcular fragmentación interna
        this.fragmentacion += desperdicio;
        console.log(`🛠️ Fragmentación interna en ${ptr}: ${desperdicio} bytes.`);

        if (this.ram.size >= this.ramSize) {
            let keys = Array.from(this.ram.keys());
            let evictedPtr = keys[Math.floor(Math.random() * keys.length)]; // Selección aleatoria
            this.ram.delete(evictedPtr);
            console.log(`🎲 RND: Página ${evictedPtr} reemplazada al azar.`);
        }

        this.ram.set(ptr, pid);
        console.log(`✅ RND: Página ${ptr} asignada a proceso ${pid}.`);
        return ptr;
    }

    usePage(ptr) {
        if (this.ram.has(ptr)) {
            console.log(`🔵 HIT: Página ${ptr} está en RAM.`);
            this.clock += 1;
        } else {
            console.log(`🔴 FAULT: Página ${ptr} no está en RAM.`);
            this.clock += 5;
            this.thrashing += 5;
        }

        console.log(`⏳ Tiempo total: ${this.clock}s`);
        console.log(`🔥 Thrashing acumulado: ${this.thrashing}s`);
    }

    deletePage(ptr) {
        if (this.ram.has(ptr)) {
            this.ram.delete(ptr);
            console.log(`🗑️ RND: Página ${ptr} eliminada.`);
        } else {
            console.log(`⚠️ RND: Página ${ptr} no encontrada.`);
        }
    }

    killProcess(pid) {
        console.log(`☠️ Eliminando proceso ${pid} y sus páginas.`);
        let pagesToRemove = [...this.ram.entries()].filter(([ptr, p]) => p === pid);
        pagesToRemove.forEach(([ptr]) => this.deletePage(ptr));
    }

    printStatus() {
        console.log("\n🔍 Estado actual de la memoria:");
        console.table([...this.ram]);
        console.log(`🛠️ Fragmentación interna total: ${this.fragmentacion} bytes.`);
        console.log("--------------------------------------------------");
    }

    printFinalStats() {
        console.log("\n📊 Resumen de Simulación:");
        console.log(`⏳ Tiempo total de simulación: ${this.clock}s`);
        console.log(`🔥 Tiempo en fallos de página (thrashing): ${this.thrashing}s`);
        console.log(`🛠️ Fragmentación interna total: ${this.fragmentacion} bytes`);
        const pct = ((this.thrashing / this.clock) * 100).toFixed(2);
        console.log(`⚠️ Porcentaje de thrashing: ${pct}%`);
    }
}window.RND = MMU_RND;

/*
// 📜 Simulación con RND
const mmu = new MMU_RND(3);
const operations = [
    "1 new(1,500)",
    "2 use(1)",
    "3 new(1,1000)",
    "4 use(1)",
    "5 use(2)",
    "6 new(2,500)",
    "7 use(3)",
    "8 use(1)",
    "9 new(2,50)",
    "10 use(4)",
    "11 delete(1)",
    "12 use(2)",
    "13 use(3)",
    "14 delete(2)",
    "15 kill(1)",
    "16 kill(2)"
];

console.log("\n🔄 Iniciando simulación con RND...");
operations.forEach(op => mmu.executeOperation(op));
mmu.printFinalStats(); // 🎯 Mostrar métricas finales
console.log("\n✅ Simulación completada.");
*/
