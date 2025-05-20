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


        const pagesNeeded = Math.ceil(size / 4096);
        const ptr = `P${this.ptrCounter++}`;

        // Registro del ptr en su proceso
        if (!this.processTable.has(pid)) this.processTable.set(pid, []);
        this.processTable.get(pid).push(ptr);

        // Inicializar lista de páginas para este ptr
        if (!this.ptrToPages) this.ptrToPages = new Map();

        this.ptrToPages.set(ptr, []);

        console.log(`🆕 new(${pid}, ${size}B) → creando ${pagesNeeded} páginas…`);

        for (let i = 0; i < pagesNeeded; i++) {

            const pageId = `${ptr}_pg${i}`;

            if (this.queue.length >= this.ramSize) {


            // SI FALLA: expulsar la primera de la cola
            const evicted = this.queue.shift();
            this.ram.delete(evicted);
            this.clock += 5;           // +5s por   fallo al traer
            this.thrashing += 5;
            console.log(`🚨 FIFO: expulsada página ${evicted}`);
            } else {
            // ÉXITO: hay espacio libre
            this.clock += 1;           // +1 s por hit
            }

            // Asignar la nueva page
            this.queue.push(pageId);
            this.ram.set(pageId, pid);
            this.ptrToPages.get(ptr).push(pageId);
            console.log(`   → asignada página física ${pageId}`);
        }

        // frag interna
        const wasted = pagesNeeded * 4096 - size;
        this.fragmentacion += wasted;
        console.log(` Fragmentación interna ptr=${ptr}: ${wasted} bytes\n`);

        return ptr;
    }

        





usePage(ptr) {

        
    // Primero es obtener el PID de este ptr
    let pid = null;
    for (const [p, ptrs] of this.processTable) {
        if (ptrs.includes(ptr)) { pid = p; break; }
    }

    const pages = this.ptrToPages.get(ptr);
    if (!pages || pages.length === 0) {
        console.warn(`FIFO: ptr=${ptr} no existe o ya fue borrado.`);
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

        if (this.queue.length >= this.ramSize) {
            const evicted = this.queue.shift();
            this.ram.delete(evicted);
            console.log(`FIFO (use): expulsada página ${evicted}`);
        }

        // aqui se recarga con el PID correcto
        this.queue.push(pageId);
        this.ram.set(pageId, pid);
        console.log(`   → cargada página ${pageId} en RAM`);
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

        // limpia la lista de paginas del ptr
        this.ptrToPages.delete(ptr);

    }


    killProcess(pid) {

        const ptrs = this.processTable.get(pid) || [];

        // borra todos los ptrs y sus paginas
        ptrs.forEach(ptr => this.deletePage(ptr));
        this.processTable.delete(pid);
        console.log(`FIFO: Proceso ${pid} y todas sus páginas eliminados.`);
    }



    printStatus() {
        console.log("\n Estado actual de la memoria:");
        console.log(` Punteros en cola FIFO: ${this.queue.join(", ")}`);
        console.log(` Páginas en RAM:`);
        console.table([...this.ram]); // Muestra el Map en formato tabla
        console.log(` Fragmentación interna total: ${this.fragmentacion} bytes.`);
        console.log("--------------------------------------------------");
    }

    printFinalStats() {
        console.log("\n Resumen de Simulación:");
        console.log(` Tiempo total de simulación: ${this.clock}s`);
        console.log(` Tiempo en fallos de página (thrashing): ${this.thrashing}s`);
        const pct = ((this.thrashing / this.clock) * 100).toFixed(2);
        console.log(` Porcentaje de thrashing: ${pct}%`);
    }
}
