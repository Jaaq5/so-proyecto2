class MMU_OPT {
    constructor(ramSize, accessSequence = []) {
        console.log(`🔧 Inicializando MMU con ${ramSize} páginas en memoria.`);
        this.ramSize = ramSize;
        this.ram = new Map();
        this.ptrCounter = 1;
        this.accessSequence = accessSequence; // Secuencia futura de accesos
        this.clock = 0;        // Tiempo total de simulación
        this.thrashing = 0;    // Tiempo perdido en fallos de páginas
        this.fragmentacion = 0; // Bytes desperdiciados por fragmentación interna
        this.processTable = new Map();

    
    }

    executeOperation(operation) {
    // mostramos por consola la operación entrante
    console.log(`\n📝 Ejecutando operación: ${operation}`);

    // Primero quitamos los espacios sobrantes
    const command = operation.trim();

    // Luego igualq q los demas separamos tipo (“new”,“use) de sus parametros “crudos”
    const [type, rawParams] = command.split("(");

    // ya luego ,  convertimos rawParams “1,500)” → [1, 500]
    const params = rawParams
      .replace(")", "")
      .split(",")
      .map(Number);

    if (type === "new") {
      // params = [pid, size]
      const [pid, size] = params;

      // aseguramos que exista la lista para este PID
      if (!this.processTable.has(pid)) {
        this.processTable.set(pid, []);
      }

      // asignamos la pagina y guardamos su ptr
      const ptr = this.allocatePage(pid, size);
      this.processTable.get(pid).push(ptr);

    } else if (type === "use") {
      // params = [ptrIndex]
      const [ptrIndex] = params;

      //Preguntar esta vr
      // en OPT, igual que MRU, los punteros tienen P adelante 
      const ptr = `P${ptrIndex}`;
      this.usePage(ptr);

    } else if (type === "delete") {
      // params = [ptrIndex]
      const [ptrIndex] = params;
      const ptr = `P${ptrIndex}`;
      this.deletePage(ptr);

    } else if (type === "kill") {
      // params = [pid]
      const [pid] = params;
      // matamos el proceso y todas sus páginas
      if (this.processTable.has(pid)) {
        this.processTable.get(pid).forEach(p => this.deletePage(p));
        this.processTable.delete(pid);
      }
    }

    // mostramos estado tras cada operación
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
            this.accessSequence = this.accessSequence.filter(p => p !== ptr);
            console.log(`🗑️ OPT: Página ${ptr} eliminada.`);
        } else {
            console.log(`⚠️ OPT: Página ${ptr} no encontrada.`);
        }
    }

    killProcess(pid) {

        // Primero Sacamos solo los ptr (como P3 y P5 por ejemplo)
        const pagesToRemove = [...this.ram.entries()]
        .filter(([ptr,p]) => p === pid)
        .map(([ptr]) => ptr);

        // luego borramos cada pagina y la quitamos de accessSequence
        pagesToRemove.forEach(ptr => this.deletePage(ptr));
        this.accessSequence = this.accessSequence.filter(p => !pagesToRemove.includes(p));

        // Alfinal borramos el registro del proceso
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
}window.OPT = MMU_OPT;
