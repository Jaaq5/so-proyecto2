class MMU_OPT {
    constructor(ramSize, accessSequence) {
        console.log(`🔧 Inicializando MMU con ${ramSize} páginas en memoria.`);
        this.ramSize = ramSize;
        this.ram = new Map();
        this.ptrCounter = 1;
        this.accessSequence = accessSequence; // Secuencia futura de accesos
        this.clock = 0;        // Tiempo total de simulación
        this.thrashing = 0;    // Tiempo perdido en fallos de páginas
        this.fragmentacion = 0; // Bytes desperdiciados por fragmentación interna
    }

    executeOperation(operation) {
        console.log(`\n📝 Ejecutando operación: ${operation}`);
        let [index, command] = operation.split(" ");
        let [type, params] = command.split("(");
        params = params.replace(")", "").split(",");

        if (type === "new") {
            let [pid, size] = params.map(Number);
            let ptr = this.allocatePage(pid, size);
        } else if (type === "use") {
            let ptr = `P${params[0]}`;
            this.usePage(ptr);
        } else if (type === "delete") {
            let ptr = `P${params[0]}`;
            this.deletePage(ptr);
        } else if (type === "kill") {
            let pid = Number(params[0]);
            this.killProcess(pid);
        }

        this.printStatus();
    }

    allocatePage(pid, size) {
        let ptr = `P${this.ptrCounter++}`; // NUEVO: Siempre crea P1, P2, P3… sin repetir
        this.accessSequence.push(ptr); //NUEVO: PUNTEROS NUEVOS
        
        let desperdicio = (Math.ceil(size / 4096) * 4096) - size; // Calcular fragmentación interna
        this.fragmentacion += desperdicio;
        console.log(`🛠️ Fragmentación interna en ${ptr}: ${desperdicio} bytes.`);

        if (this.ram.size >= this.ramSize) {
            let evictedPtr = this.findOptimalReplacement();
            this.ram.delete(evictedPtr);
            console.log(`🚀 OPT: Página ${evictedPtr} reemplazada utilizando algoritmo óptimo.`);
        }

        this.ram.set(ptr, pid);
        console.log(`✅ OPT: Página ${ptr} asignada a proceso ${pid}.`);
        return ptr;
    }

    usePage(ptr) {


        const index = this.accessSequence.indexOf(ptr);
        if (index !== -1) this.accessSequence.splice(index, 1);

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

    findOptimalReplacement() {
        let futureAccesses = new Map();

        this.ram.forEach((_, ptr) => {
            let nextUse = this.accessSequence.indexOf(ptr);
            futureAccesses.set(ptr, nextUse === -1 ? Infinity : nextUse);
        });

        let evictedPtr = [...futureAccesses.entries()].sort((a, b) => b[1] - a[1])[0][0];
        return evictedPtr;
    }

    deletePage(ptr) {
        if (this.ram.has(ptr)) {
            this.ram.delete(ptr);
            console.log(`🗑️ OPT: Página ${ptr} eliminada.`);
        } else {
            console.log(`⚠️ OPT: Página ${ptr} no encontrada.`);
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
}

/*
// 📜 Simulación con OPT
const accessSequence = ["P1", "P2", "P3", "P4", "P1", "P3", "P5", "P2"]; // Secuencia futura de accesos

const mmu = new MMU_OPT(3, accessSequence);
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

console.log("\n🔄 Iniciando simulación con OPT...");
operations.forEach(op => mmu.executeOperation(op));
mmu.printFinalStats(); // 🎯 Mostrar métricas finales
console.log("\n✅ Simulación completada.");
*/
