class MMU_FIFO {
    constructor(ramSize) {
        console.log(`🔧 Inicializando MMU con ${ramSize} páginas en memoria.`);
        this.ramSize = ramSize;
        this.ram = new Map();   // Simulación de RAM
        this.queue = [];        // Cola FIFO para administrar páginas
        this.processTable = new Map();
        this.ptrCounter = 1;
        this.clock = 0;        // Tiempo total de simulacion
        this.thrashing = 0;    // Tiempo perdido en fallos de las pages
        this.fragmentacion = 0; // bytes desperdiciados por fragmentacion interna!!



    }

    executeOperation(operation) {

        //Esto lo dejamos
        console.log(`\n📝 Ejecutando operación: ${operation}`);
        //Limpiar espacios 
        const command = operation.trim();
        //Dabamos un error de redeclaracion , por eso se puso rawParams
        const [type, rawParams] = command.split("(");
        //Params es un numer limpio 
        const params = rawParams
            .replace(")", "")
            .split(",")
            .map(Number);
        if (type === "new") {
            //Params ya es un array de numeros como tal [pid, size]
            const [pid , size ] = params;

             // Aseguramos que exista la tabla para este PID
        if (!this.processTable.has(pid)) {
            this.processTable.set(pid, []);
        
        }
        //Asignamos la pagina y guardamos el ptr
        const ptr = this.allocatePage(pid, size);
        this.processTable.get(pid).push(ptr);
        } else if (type === "use") {
            //Params = [ptr]
            const [ptr] = params;
            this.usePage(ptr);

        } else if (type === "delete") {
            // params = [ptr]
            const [ptr] = params;
            this.deletePage(ptr);

        } else if (type === "kill") {

             // params = [pid]
            const [pid] = params;
            this.killProcess(pid);
        }
        this.printStatus();
    }

    allocatePage(pid, size) {
        console.log(`🆕 Asignando página para proceso ${pid} con tamaño ${size}B.`);
        let ptr = this.ptrCounter++; // Puntero asignado en orden
        if (!this.processTable.has(pid)) this.processTable.set(pid, []);

        if (this.queue.length >= this.ramSize) {
            let evictedPtr = this.queue.shift(); // FIFO: Expulsamos la más antigua
            this.ram.delete(evictedPtr);
            console.log(`🚨 FIFO: Página ${evictedPtr} reemplazada.`);
        }

        this.queue.push(ptr);
        this.ram.set(ptr, pid);
        console.log(`✅ FIFO: Página ${ptr} asignada a proceso ${pid}.`);

        let desperdicio = (Math.ceil(size / 4096) * 4096) - size;
        this.fragmentacion += desperdicio;
        console.log(`Fragmentacion interna en  ptr: ${desperdicio} bytes`);

        return ptr;
    }

    usePage(ptr) {
        if (this.ram.has(ptr)) {
            console.log(`🔵 FIFO: Página ${ptr} está en memoria real. (Hit)`);
            this.clock += 1;
        } else {
            console.log(`🔴 FIFO: Fallo de página ${ptr}. Está en memoria virtual.`);
            this.clock += 5;
            this.thrashing += 5;
        }
        console.log(`⏳ Tiempo total: ${this.clock}s`);
        console.log(`🔥 Thrashing acumulado: ${this.thrashing}s`);
    }

    deletePage(ptr) {
        if (this.ram.has(ptr)) {
            this.ram.delete(ptr);
            this.queue = this.queue.filter(p => p !== ptr);
            console.log(`🗑️ FIFO: Página ${ptr} eliminada.`);
        } else {
            console.log(`⚠️ FIFO: Página ${ptr} no encontrada.`);
        }
    }

    killProcess(pid) {
        if (this.processTable.has(pid)) {
            console.log(`☠️ Eliminando proceso ${pid} y sus páginas.`);
            this.processTable.get(pid).forEach(ptr => this.deletePage(ptr));
            this.processTable.delete(pid);
        } else {
            console.log(`⚠️ Proceso ${pid} no encontrado.`);
        }
    }

    printStatus() {
        console.log("\n🔍 Estado actual de la memoria:");
        console.log(`📌 Punteros en cola FIFO: ${this.queue.join(", ")}`);
        console.log(`📦 Páginas en RAM:`);
        console.table([...this.ram]); // Muestra el Map en formato tabla
        console.log(`🛠️ Fragmentación interna total: ${this.fragmentacion} bytes.`);
        console.log("--------------------------------------------------");
    }

    printFinalStats() {
        console.log("\n📊 Resumen de Simulación:");
        console.log(`⏳ Tiempo total de simulación: ${this.clock}s`);
        console.log(`🔥 Tiempo en fallos de página (thrashing): ${this.thrashing}s`);
        const pct = ((this.thrashing / this.clock) * 100).toFixed(2);
        console.log(`⚠️ Porcentaje de thrashing: ${pct}%`);
    }
}

/*
// 📜 Simulación con la secuencia EXACTA
const mmu = new MMU_FIFO(3);
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

console.log("\n🔄 Iniciando simulación con FIFO...");
operations.forEach(op => mmu.executeOperation(op));
console.log("\n✅ Simulación completada.");
*/
