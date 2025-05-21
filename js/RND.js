class MMU_RND {
    constructor(ramSize) {
        console.log(`🔧 Inicializando MMU con ${ramSize} páginas en memoria.`);
        this.ramSize = ramSize;
        this.ram = new Map();
        this.clock = 0;        // Tiempo total de simulación
        this.thrashing = 0;    // Tiempo perdido en fallos de páginas
        this.fragmentacion = 0; // Bytes desperdiciados por fragmentación interna
        this.processTable = new Map();

        //ESTO ES NUEVO PARA MULTIPAGINA

        this.ptrCounter   = 1;
        this.ptrToPages   = new Map();


        //hice un mapa para guarda la frafmentacion de cada ptr

        this.ptrToWasted = new Map();


    
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

  //ANTES ERA SOLO PTR Y UNA PAGINA 
  //ESTO ES LO NUEVO



    allocatePage(pid, size) {

        const pagesNeeded = Math.ceil(size / 4096);
        const ptr = `P${this.ptrCounter++}`;

        // Aseguramos el registro en processTable y ptrToPages
        if (!this.processTable.has(pid)) this.processTable.set(pid, []);
        this.processTable.get(pid).push(ptr);
        this.ptrToPages.set(ptr, []);

        // Fragmentacion
        const wasted = pagesNeeded*4096 - size;


        this.fragmentacion += wasted;
        console.log(` Fragmentación interna ptr=${ptr}: ${wasted} bytes.`);

        // Guardar el wasted asociado al ptr
        this.ptrToWasted.set(ptr, wasted);

        // Crear cada subpagina
        for (let i = 0; i < pagesNeeded; i++) {


            const pageId = `${ptr}_pg${i}`;

            // Si RAM llena  , hay expulsion aleatoria
            if (this.ram.size >= this.ramSize) {
                const keys = Array.from(this.ram.keys());
                const ev = keys[Math.floor(Math.random()*keys.length)];
                this.ram.delete(ev);
                this.clock += 5;
                this.thrashing += 5;
                console.log(` RND: expulsada página ${ev}`);
            } else {

                this.clock += 1;
            }

            // Asignar la subpagina

            this.ram.set(pageId, pid);
            this.ptrToPages.get(ptr).push(pageId);
            console.log(` RND: asignada subpágina ${pageId} a proceso ${pid}`);
            }

            return ptr;
    }

    //ANTE SOLO SE MIRA UN PTR


    usePage(ptr) {


        const pages = this.ptrToPages.get(ptr) || [];

        if (!pages.length) {

            console.warn(`RND: ptr=${ptr} no existe o ya fue borrado.`);
            return;
        }

        // Determinar PID para recarga en fallo
        const pid = [...this.processTable.entries()]
                        .find(([, arr]) => arr.includes(ptr))?.[0];

        pages.forEach(pageId => {
            if (this.ram.has(pageId)) {
            console.log(` HIT: subpágina ${pageId}`);
            this.clock += 1;
            } else {
            console.log(` FAULT: subpágina ${pageId}`);
            this.clock += 5;
            this.thrashing += 5;

            // expulsion aleatoria si se encuentra full 
            if (this.ram.size >= this.ramSize) {
                const keys = Array.from(this.ram.keys());
                const ev = keys[Math.floor(Math.random()*keys.length)];
                this.ram.delete(ev);
                console.log(` RND (use): expulsada ${ev}`);
            }
            // recarga
            this.ram.set(pageId, pid);
            console.log(`   → recargada ${pageId} para proceso ${pid}`);
            }
        });

        console.log(`⏳ Tiempo: ${this.clock}s  🔥 Thrashing: ${this.thrashing}s`);
    }


    deletePage(ptr) {

        // Antes de eliminar paginas , restar la fragmentacion de este ptr
        const wasted = this.ptrToWasted.get(ptr) || 0;
        this.fragmentacion -= wasted;
        this.ptrToWasted.delete(ptr)

        // Se elimina todas las subpagines de RAM
        const pages = this.ptrToPages.get(ptr) || [];
        pages.forEach(pageId => {
            if (this.ram.delete(pageId)) {
            console.log(`🗑️ RND: subpágina ${pageId} eliminada.`);
            }
        });

        // se quita este ptr de EL ptrToPages
        this.ptrToPages.delete(ptr);


        // Se encuentra al proceso dueño de este ptr y lo eliminaa de su listaa
        const owner = [...this.processTable.entries()]
            .find(([pid, ptrs]) => ptrs.includes(ptr));
        if (owner) {

            const [pid, ptrs] = owner;
            const i = ptrs.indexOf(ptr);
            ptrs.splice(i, 1);
        }
    }


    killProcess(pid) {


    // Se clona la lista de ptrs
        const ptrs = this.processTable.get(pid) || [];
        const clone = [...ptrs];

    // Se Borra cada ptr sin miedo a mutar el original
        clone.forEach(ptr => this.deletePage(ptr));

    // Al final se elimina la entrada del proceso
        this.processTable.delete(pid);
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