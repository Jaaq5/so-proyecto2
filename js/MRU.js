class MMU_MRU {
    constructor(ramSize) {
        console.log(`🔧 Inicializando MMU con ${ramSize} páginas en memoria.`);
        this.ramSize = ramSize;
        this.ram = new Map();
        this.accessOrder = [];
        this.clock = 0;        // Tiempo total de simulación
        this.thrashing = 0;    // Tiempo perdido en fallos de páginas
        this.fragmentacion = 0; // Bytes desperdiciados por fragmentación interna
    
        //Necesitamos la misma tabla de procesos que en FIFO
        this.processTable = new Map();
    
    }

    executeOperation(operation) {
    // Mostramos la operación que llega
    console.log(`\n📝 Ejecutando operación: ${operation}`);

    // 1. Limpiamos espacios y tomamos la instrucción completa
    const command = operation.trim();

    // 2. Separamos el tipo ('new','use',etc.) de los parámetros crudos
    const [type, rawParams] = command.split("(");

    // 3. Convertimos rawParams a array de números
    const params = rawParams
      .replace(")", "")
      .split(",")
      .map(Number);

    if (type === "new") {
      // Desestructuramos pid y size de params
      const [pid, size] = params;

      // Aseguramos que exista la tabla de ese proceso
      if (!this.processTable.has(pid)) {
        this.processTable.set(pid, []);
      }

      // Asignamos la página y almacenamos el puntero
      const ptr = this.allocatePage(pid, size);
      this.processTable.get(pid).push(ptr);

    } else if (type === "use") {
      // Para usar, desestructuramos ptr de params
      const [ptrIndex] = params;
      // En MRU los punteros van con 'P' delante
      const ptr = `P${ptrIndex}`;
      this.usePage(ptr);

    } else if (type === "delete") {
      // Desestructuramos ptr
      const [ptrIndex] = params;
      const ptr = `P${ptrIndex}`;
      this.deletePage(ptr);

    } else if (type === "kill") {
      // Desestructuramos pid
      const [pid] = params;
      this.killProcess(pid);
    }

    // Imprimimos el estado tras cada operación
    this.printStatus();
  }

    allocatePage(pid, size) {
        let ptr = `P${this.ram.size + 1}`; // Generamos un puntero para la nueva página
        let desperdicio = (Math.ceil(size / 4096) * 4096) - size; // Calcular fragmentación interna
        this.fragmentacion += desperdicio;
        console.log(`🛠️ Fragmentación interna en ${ptr}: ${desperdicio} bytes.`);

        if (this.ram.size >= this.ramSize) {
            let evictedPtr = this.accessOrder.pop(); // Expulsar la más recientemente usada?
            this.ram.delete(evictedPtr);
            console.log(`🚨 MRU: Página ${evictedPtr} reemplazada.`);
        }

        this.ram.set(ptr, pid);
        this.accessOrder.push(ptr);
        console.log(`✅ MRU: Página ${ptr} asignada a proceso ${pid}.`);
        return ptr;
    }

    usePage(ptr) {
        if (this.ram.has(ptr)) {
            console.log(`🔵 HIT: Página ${ptr} está en RAM.`);
            this.clock += 1;

            // :white_check_mark: Corrección: Mover la página al FINAL como "más recientemente usada"
            this.accessOrder = this.accessOrder.filter(p => p !== ptr);
            this.accessOrder.push(ptr);

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
            this.accessOrder = this.accessOrder.filter(p => p !== ptr);
            console.log(`🗑️ MRU: Página ${ptr} eliminada.`);
        } else {
            console.log(`⚠️ MRU: Página ${ptr} no encontrada.`);
        }
    }

    killProcess(pid) {
        console.log(`☠️ Eliminando proceso ${pid} y sus páginas.`);
        let pagesToRemove = [...this.ram.entries()].filter(([ptr, p]) => p === pid);
        pagesToRemove.forEach(([ptr]) => this.deletePage(ptr));
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