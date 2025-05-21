class MMU_MRU {
  constructor(ramSize) {
    console.log(`🔧 Inicializando MMU con ${ramSize} páginas en memoria.`);
    this.ramSize = ramSize;
    this.ram = new Map();
    this.accessOrder = []; //IGUAL QUE FIFO TODAS ESTAS VARIABLESSS
    this.clock = 0;        // Tiempo total de simulacion
    this.thrashing = 0;    // Tiempo perdido en fallos de paginas
    this.fragmentacion = 0; // Bytes desperdiciados por frag interna

    //Necesitamos la misma tabla de procesos que en FIFO
    this.processTable = new Map();

    //Esto se necesita para implementar multipagina

    this.ptrToPages    = new Map();
    this.ptrCounter    = 1;

    this.ptrToWasted = new Map(); // Para frag por ptr

  }

  executeOperation(operation) {



    // Mostramos la operación que llega
    console.log(`\n📝 Ejecutando operación: ${operation}`);

    // 1 Pirmero limpiamos espacios y tomamos la instruccion completa
    const command = operation.trim();

    // 2 Separamos el tipo de los Parametros crudos
    const [type, rawParams] = command.split("(");

    // 3 Convertimos rawParams a array de numeros
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

      // Asignamos la page y almacenamos el puntero
      const ptr = this.allocatePage(pid, size);
      this.processTable.get(pid).push(ptr);

    } else if (type === "use") {
      // Para usar, desestructuramos ptr de params
      const [ptrIndex] = params;
      // En MRU los punteros van con 'P' delante3
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



    const pagesNeeded = Math.ceil(size / 4096);
    const ptr = `P${this.ptrCounter++}`;

    // Registro del ptr en el proceso
    if (!this.processTable.has(pid)) this.processTable.set(pid, []);
    this.processTable.get(pid).push(ptr);

    // Inicializar lista de páginas
    this.ptrToPages.set(ptr, []);

    // frag interna
    const wasted = pagesNeeded * 4096 - size;
    this.fragmentacion += wasted;

    this.ptrToWasted.set(ptr, wasted);

    console.log(`Fragmentación interna ptr=${ptr}: ${wasted} bytes.`);

    for (let i = 0; i < pagesNeeded; i++) {
      const pageId = `${ptr}_pg${i}`;

      if (this.accessOrder.length >= this.ramSize) {

        const evicted = this.accessOrder.pop();
        this.ram.delete(evicted);
        this.clock += 5;
        this.thrashing += 5;
        console.log(`MRU: expulsada página ${evicted}`);


      } else {

        this.clock += 1;
      }

      // Asignar y trackear
      this.ram.set(pageId, pid);
      this.accessOrder.push(pageId);
      this.ptrToPages.get(ptr).push(pageId);



      console.log(`MRU: asignada pagina ${pageId} a proceso ${pid}`);
    }

    return ptr;
  }




  usePage(ptr) {



    const pages = this.ptrToPages.get(ptr) || [];
    if (!pages.length) {
      console.warn(`MRU: ptr=${ptr} no existe o ya fue borrado.`);
      return;
    }

    const pid = [...this.processTable.keys()]

    .find(p => this.processTable.get(p).includes(ptr));


    if (pid === undefined) {

      console.warn(`MRU: ptr=${ptr} sin proceso asociado.`);
      return;
    }
    pages.forEach(pageId => {
      if (this.ram.has(pageId)) {
        console.log(` MRU HIT: ${pageId}`);
        this.clock += 1;

        // Mover al final (mas reciente)
        this.accessOrder = this.accessOrder.filter(p => p !== pageId);
        this.accessOrder.push(pageId);
      } else {
        console.log(` MRU FAULT: ${pageId}`);
        this.clock += 5;
        this.thrashing += 5;
        // Expulsar MRU si hace falta
        if (this.accessOrder.length >= this.ramSize) {
          const evicted = this.accessOrder.pop();
          this.ram.delete(evicted);
          console.log(`MRU (use): expulsada ${evicted}`);
        }
        // Recargar
        this.ram.set(pageId, pid);
        this.accessOrder.push(pageId);
        console.log(`recargada ${pageId} para proceso ${pid}`);
      }
    });

    console.log(`Tiempo: ${this.clock}s  Thrashing: ${this.thrashing}s`);
  }


  deletePage(ptr) {

    const wasted = this.ptrToWasted.get(ptr) || 0;
    this.fragmentacion -= wasted;
    this.ptrToWasted.delete(ptr);


    const pages = this.ptrToPages.get(ptr) || [];
    pages.forEach(pageId => {

      if (this.ram.delete(pageId)) {
        this.accessOrder = this.accessOrder.filter(p => p !== pageId);
        console.log(` MRU: página ${pageId} eliminada`);
      }
    });
    this.ptrToPages.delete(ptr);
    // también quitar ptr de processTable
    for (const arr of this.processTable.values()) {
      const idx = arr.indexOf(ptr);
      if (idx !== -1) { arr.splice(idx,1); break; }
    }
  }


  killProcess(pid) {
    const ptrs = this.processTable.get(pid) || [];
    ptrs.forEach(ptr => this.deletePage(ptr));
    this.processTable.delete(pid);
    console.log(`MRU: proceso ${pid} eliminado`);
  }


  printStatus() {
    console.log("\nEstado actual de la memoria:");
    console.table([...this.ram]);
    console.log(`Fragmentacion interna total: ${this.fragmentacion} bytes.`);
    console.log("--------------------------------------------------");
  }

  printFinalStats() {
    console.log("\nResumen de Simulacion:");
    console.log(`Tiempo total de simulacion: ${this.clock}s`);
    console.log(`Tiempo en fallos de oaguba (thrashing): ${this.thrashing}s`);
    console.log(`Fragmentación interna total: ${this.fragmentacion} bytes`);
    const pct = ((this.thrashing / this.clock) * 100).toFixed(2);
    console.log(`Porcentaje de thrashing: ${pct}%`);
  }
}window.MRU = MMU_MRU;
