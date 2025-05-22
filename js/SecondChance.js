class MMU_SC {
    constructor(ramSize) {
        console.log(`Inicializando MMU con ${ramSize} páginas en memoria.`);
        this.ramSize = ramSize;
        this.ram = new Map();
        this.queue = [];
        this.references = new Map();
        this.clock = 0;
        this.thrashing = 0;
        this.fragmentacion = 0;
        this.processTable = new Map();

        // para numerar los ptrs
        this.ptrCounter   = 1;
        // para mapear cada ptr
        this.ptrToPages   = new Map();
        // para restar correctamente frag al borrar
        this.ptrToWasted  = new Map();
        this.historialPaginas = new Set(); // historial total de páginas creadas







    }
    executeOperation(operation) {

        //MISMO PROCESO DE LO DEMAS


        console.log(`\n Ejecutando operacion: ${operation}`);

        const command = operation.trim();
        const [type, rawParams] = command.split("(");
        const params = rawParams
        .replace(")", "")
        .split(",")
        .map(Number);

        if (type === "new") {

            const [pid, size] = params;

            if (!this.processTable.has(pid)) this.processTable.set(pid, []);
            const ptr = this.allocatePage(pid, size);
            this.processTable.get(pid).push(ptr);

            //this.references.set(ptr, true); //Alparecer nunca se usa

        } else if (type === "use") {


            const [ptrIndex] = params;
            const ptr = `P${ptrIndex}`;
            this.usePage(ptr);

        } else if (type === "delete") {

            const [ptrIndex] = params;
            const ptr = `P${ptrIndex}`;
            this.deletePage(ptr);

        } else if (type === "kill") {
            const [pid] = params;

            if (this.processTable.has(pid)) {
                this.processTable.get(pid).forEach(ptr => this.deletePage(ptr));
                this.processTable.delete(pid);
            }
        }

        this.printStatus();
    }


    allocatePage(pid, size) {

        const pagesNeeded = Math.ceil(size / 4096);
        const ptr = `P${this.ptrCounter++}`;

        // Registro
        if (!this.processTable.has(pid)) this.processTable.set(pid, []);
        this.processTable.get(pid).push(ptr);
        this.ptrToPages.set(ptr, []);

        // Frag
        const wasted = pagesNeeded * 4096 - size;
        this.fragmentacion += wasted;
        this.ptrToWasted.set(ptr, wasted);
        console.log(` Fragmentación interna ptr=${ptr}: ${wasted} bytes.`);

        for (let i = 0; i < pagesNeeded; i++) {
            const pageId = `${ptr}_pg${i}`;

            if (this.queue.length >= this.ramSize) {
                // Second chance: ciclar hasta expulsar una referencia = false
                while (true) {
                    const cand = this.queue.shift();
                    if (this.references.get(cand)) {
                        this.references.set(cand, false);
                        this.queue.push(cand);
                    } else {
                        this.ram.delete(cand);
                        console.log(`SC: expulsada pagina ${cand}`);
                        this.clock += 5;
                        this.thrashing += 5;
                        break;
                    }
                }
            } else {
                this.clock += 1;
            }

            // Asignar la subp
            this.ram.set(pageId, pid);
            this.queue.push(pageId);
            this.references.set(pageId, true);
            this.ptrToPages.get(ptr).push(pageId);
            console.log(` SC: asignada subpágina ${pageId} a proceso ${pid}`);
            this.historialPaginas.add(pageId);
        }

        return ptr;
    }

        fueEliminada(pageId) {
        for (const [ptr, pages] of this.ptrToPages.entries()) {
            if (pages.includes(pageId)) return false; // aún existe
        }
        return true; // no está en ninguna lista activa
    }    




    usePage(ptr) {

        const pages = this.ptrToPages.get(ptr) || [];
        if (!pages.length) {
            console.warn(`SC: ptr=${ptr} no existe o ya fue borrado.`);
            return;
        }

        const pid = [...this.processTable.entries()]
        .find(([, arr]) => arr.includes(ptr))?.[0];

        pages.forEach(pageId => {

            if (this.ram.has(pageId)) {
                console.log(` SC HIT: ${pageId}`);
                this.clock += 1;
                this.references.set(pageId, true);
            } else {
                console.log(` SC FAULT: ${pageId}`);
                this.clock += 5;
                this.thrashing += 5;

                // expl Second-Chance urgente
                while (this.queue.length >= this.ramSize) {

                    const cand = this.queue.shift();
                    if (this.references.get(cand)) {
                        this.references.set(cand, false);
                        this.queue.push(cand);
                    } else {
                        this.ram.delete(cand);
                        console.log(` SC (use): expulsada ${cand}`);
                        break;
                    }
                }

                this.ram.set(pageId, pid);
                this.queue.push(pageId);
                this.references.set(pageId, true);
                console.log(`recargada ${pageId} para proceso ${pid}`);
            }
        });

        console.log(`Tiempo: ${this.clock}s   Thrashing: ${this.thrashing}s`);
    }


    deletePage(ptr) {
        // Se Resta la frag  de este ptr
        const wasted = this.ptrToWasted.get(ptr) || 0;
        this.fragmentacion -= wasted;
        this.ptrToWasted.delete(ptr);

        // Eliminar todas sus subpages de RAM, cola y referencias
        const pages = this.ptrToPages.get(ptr) || [];
        pages.forEach(pageId => {
            if (this.ram.delete(pageId)) {
                console.log(`🗑️ SC: subpágina ${pageId} eliminada.`);
            }
            this.queue = this.queue.filter(p => p !== pageId);
            this.references.delete(pageId);
        });

        // Limpiar estructuras
        this.ptrToPages.delete(ptr);
        for (const [pid, arr] of this.processTable.entries()) {
            const idx = arr.indexOf(ptr);
            if (idx !== -1) {
                arr.splice(idx, 1);
                break;
            }
        }
    }

    killProcess(pid) {

        console.log(` SC: eliminando proceso ${pid} y todas sus páginas.`);

        // Recuperar TODOS los ptrs de este PID
        const ptrs = this.processTable.get(pid) || [];
        // Eliminar cada ptr (y sus subs) usando deletePage
        ptrs.forEach(ptr => this.deletePage(ptr));
        // Borrar entrada del proceso
        this.processTable.delete(pid);
    }


    printStatus() {
        console.log("\nEstado actual de la memoria:");
        console.table([...this.ram]);
        console.log(`Fragmentación interna total: ${this.fragmentacion} bytes.`);
        console.log("--------------------------------------------------");
    }


            // Función auxiliar
    obtenerProcesoDePtr(pageId) {
        for (const [ptr, pages] of this.ptrToPages.entries()) {
            if (pages.includes(pageId)) {
                for (const [pid, ptrs] of this.processTable.entries()) {
                    if (ptrs.includes(ptr)) {
                        return pid;
                    }
                }
            }
        }
        return "?";
    }

    getMemoryTableData() {
        const data = [];
        this.historialPaginas.forEach(pageId => {
            let estado = "";
            let procesoOriginal = "?"; // Para el caso de páginas eliminadas

            // Primero, intenta obtener el proceso si la página aún está activa
            procesoOriginal = this.obtenerProcesoDePtr(pageId);

            if (this.ram.has(pageId)) {
                estado = "✅ En RAM";
                // Si está en RAM, el PID almacenado en this.ram es el actual dueño
                procesoOriginal = this.ram.get(pageId);
            } else if (this.fueEliminada(pageId)) {
                estado = "⚫ Eliminada";
                // Si fue eliminada, obtenerProcesoDePtr podría devolver "?"
                // Si quisiéramos el último proceso conocido, necesitaríamos más tracking.
            } else {
                estado = "❌ Swap";
                // Si está en Swap, obtenerProcesoDePtr debería dar el PID del proceso al que pertenece.
            }
            data.push({
                pagina: pageId,
                proceso: procesoOriginal, // Usamos el proceso determinado
                estado: estado
            });
        });
        return data;
    }

    printFinalStats() {
        console.log("\nResumen de Simulación:");
        console.log(`Tiempo total de simulación: ${this.clock}s`);
        console.log(`Tiempo en fallos de página (thrashing): ${this.thrashing}s`);
        console.log(`Fragmentación interna total: ${this.fragmentacion} bytes`);
        const pct = ((this.thrashing / this.clock) * 100).toFixed(2);
        console.log(`Porcentaje de thrashing: ${pct}%`);
    }
}window.SC = MMU_SC;

/*
// 📜 Simulación con SC
const mmu = new MMU_SC(3);
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

console.log("\n🔄 Iniciando simulación con SC...");
operations.forEach(op => mmu.executeOperation(op));
mmu.printFinalStats(); // 🎯 Mostrar métricas finales
console.log("\n✅ Simulación completada.");
*/
