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
        this.historialPaginas = new Set(); // historial total de páginas creadas




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
            const ptr = this.allocatePage(pid, size);

        } else if (type === "use") {
            const [idx] = params;
            const ptr = `P${idx}`;
            this.usePage(ptr);


        } else if (type === "delete") {

            const [idx] = params;
            const ptr = `P${idx}`;
            this.deletePage(ptr);

        } else if (type === "kill") {

             // params = [pid]
            const [pid] = params;
            this.killProcess(pid);
        }
        this.printStatus();
    }



    allocatePage(pid, size) {


        const pagesNeeded = Math.ceil(size/4096);
        const ptr = `P${this.ptrCounter++}`;



        // registro unico del ptr
        if (!this.processTable.has(pid)) this.processTable.set(pid, []);
        this.processTable.get(pid).push(ptr);

        // Se inicializa la lista de paginas
        if (!this.ptrToPages) this.ptrToPages = new Map();
        this.ptrToPages.set(ptr, []);

        console.log(`🆕 new(${pid}, ${size}B) → creando ${pagesNeeded} páginas…`);
        for (let i = 0; i < pagesNeeded; i++) {
            if (this.queue.length >= this.ramSize) {
            const evicted = this.queue.shift();
            this.ram.delete(evicted);
            console.log(`🚨 FIFO: expulsada página ${evicted}`);
            // ↪️ no borramos ptrToPages aqui, para poder faultear mas despues
            }
            const pageId = `${ptr}_pg${i}`;
            this.queue.push(pageId);
            this.ram.set(pageId, pid);
            this.ptrToPages.get(ptr).push(pageId);
            console.log(`   → asignada página física ${pageId}`);
            this.historialPaginas.add(pageId);

        }

        const wasted = pagesNeeded*4096 - size;
        this.fragmentacion += wasted;
        console.log(` Fragmentación interna ptr=${ptr}: ${wasted} bytes\n`);

        return ptr;
}






    usePage(ptr) {


        const pages = this.ptrToPages.get(ptr);
        if (!pages) {

            console.warn(`FIFO: ptr=${ptr} nunca existió.`);
            return;
        }
        if (pages.length === 0) {
            console.warn(`FIFO: ptr=${ptr} ya fue borrado.`);
            return;
        }
        pages.forEach(pageId => {
            if (this.ram.has(pageId)) {
            console.log(`FIFO: Página ${pageId} (de ${ptr}) está en RAM (Hit)`);
            this.clock += 1;
            } else {
            console.log(`FIFO: Página ${pageId} (de ${ptr}) no está en RAM (Fault)`);
            this.clock += 5;
            this.thrashing += 5;
            }
        });
        console.log(`Tiempo total: ${this.clock}s`);
        console.log(`Thrashing acumulado: ${this.thrashing}s`);
    }



    deletePage(ptr) {


        const pages = this.ptrToPages.get(ptr) || [];
        pages.forEach(pageId => {
            if (this.ram.delete(pageId)) {
            this.queue = this.queue.filter(p => p !== pageId);
            console.log(`FIFO: Página ${pageId} eliminada.`);
            } else {
            console.log(`FIFO: Página ${pageId} ya estaba en swap.`);
            }
        });

        // marcamos las páginas como eliminadas pero no borramos el registro
        this.ptrToPages.set(ptr, []);

    }


    killProcess(pid) {

        const ptrs = this.processTable.get(pid) || [];

        // borra todos los ptrs y sus paginas
        ptrs.forEach(ptr => this.deletePage(ptr));
        this.processTable.delete(pid);
        console.log(`FIFO: Proceso ${pid} y todas sus páginas eliminados.`);
    }


    fueEliminada(pageId) {
    for (const [ptr, pages] of this.ptrToPages.entries()) {
        if (pages.includes(pageId)) return false; // aún existe
    }
    return true; // no está en ninguna lista activa
}




    printStatus() {
        console.log("\n Estado actual de la memoria:");
        console.log(` Punteros en cola FIFO: ${this.queue.join(", ")}`);
        console.log(` Páginas en RAM:`);
        console.table([...this.ram]); // Muestra el Map en formato tabla
        console.log(` Fragmentación interna total: ${this.fragmentacion} bytes.`);
        console.log("--------------------------------------------------");


        const tabla = document.getElementById("tablaMemoria").querySelector("tbody");
        tabla.innerHTML = ""; // limpia contenido anterior

        const todasLasPaginas = new Set();
        for (const [ptr, pages] of this.ptrToPages.entries()) {
            pages.forEach(p => todasLasPaginas.add(p));
        }

        this.historialPaginas.forEach(pageId => {
            const fila = document.createElement("tr");

            const celdaPagina = document.createElement("td");
            celdaPagina.textContent = pageId;

            const celdaProceso = document.createElement("td");
            celdaProceso.textContent = this.obtenerProcesoDePtr(pageId);

            const celdaEstado = document.createElement("td");

            if (this.ram.has(pageId)) {
                celdaEstado.textContent = "✅ En RAM";
            } else if (this.fueEliminada(pageId)) {
                celdaEstado.textContent = "⚫ Eliminada";
            } else {
                celdaEstado.textContent = "❌ Swap";
            }

            fila.appendChild(celdaPagina);
            fila.appendChild(celdaProceso);
            fila.appendChild(celdaEstado);
            tabla.appendChild(fila);
        });



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

    printFinalStats() {
        console.log("\n Resumen de Simulación:");
        console.log(` Tiempo total de simulación: ${this.clock}s`);
        console.log(` Tiempo en fallos de página (thrashing): ${this.thrashing}s`);
        const pct = ((this.thrashing / this.clock) * 100).toFixed(2);
        console.log(` Porcentaje de thrashing: ${pct}%`);
    }
}window.FIFO = MMU_FIFO;
