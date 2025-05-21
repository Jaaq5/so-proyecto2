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
        this.processTable = new Map();
        this.ptrToPages    = new Map(); 
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

      const pagesNeeded = Math.ceil(size / 4096);
      const ptr = `P${this.ptrCounter++}`;

      // registro en processTable y ptrToPages
      if (!this.processTable.has(pid)) this.processTable.set(pid, []);
      this.processTable.get(pid).push(ptr);
      this.ptrToPages.set(ptr, []);

      // fragmentación
      const wasted = pagesNeeded * 4096 - size;
      this.fragmentacion += wasted;
      console.log(`🛠️ Fragmentación interna ptr=${ptr}: ${wasted} bytes.`);

      // crear cada página
      for (let i = 0; i < pagesNeeded; i++) {
        const pageId = `${ptr}_pg${i}`;
        this.accessSequence.push(pageId);

        // si RAM llena, expulsar la que OPT diga
        if (this.ram.size >= this.ramSize) {
          const evicted = this.findOptimalReplacement();
          this.ram.delete(evicted);
          this.clock += 5;           // +5s en fallo al traer
          this.thrashing += 5;
          console.log(`🚀 OPT: expulsada página ${evicted}`);
        } else {
          this.clock += 1;           // +1s por hit
        }

        // asignar
        this.ram.set(pageId, pid);
        this.ptrToPages.get(ptr).push(pageId);
        console.log(`✅ OPT: asignada página ${pageId} a proceso ${pid}.`);
      }

      return ptr;
    }


    usePage(ptr) {
      
      // Obtiene la lista de páginas asociadas al ptr (multi-página)
      const pages = this.ptrToPages.get(ptr) || [];
      if (!pages.length) {
        console.warn(`OPT: ptr=${ptr} no existe o ya fue borrado.`);
        return;
      }

      // Localiza el PID propietario del ptr
      const pid = [...this.processTable.keys()]
        .find(p => this.processTable.get(p).includes(ptr));

      pages.forEach(pageId => {
        // Primero, quita esta página de la secuencia futura si ya estaba ahí
        const idx = this.accessSequence.indexOf(pageId);
        if (idx !== -1) this.accessSequence.splice(idx, 1);

        if (this.ram.has(pageId)) {
          // HIT
          console.log(`🔵 OPT HIT: ${pageId}`);
          this.clock += 1;
        } else {
          // FAULT
          console.log(`🔴 OPT FAULT: ${pageId}`);
          this.clock += 5;
          this.thrashing += 5;

          // Si la RAM está llena, expulsa la página que indique OPT
          if (this.ram.size >= this.ramSize) {
            const evicted = this.findOptimalReplacement();
            this.ram.delete(evicted);
            console.log(`🗑️ OPT (use): expulsada ${evicted}`);
          }

          // Recarga la página en RAM
          this.ram.set(pageId, pid);

          // ← IMPORTANTE: vuelve a añadir la página a la secuencia futura
          this.accessSequence.push(pageId);

          console.log(`   → recargada ${pageId} para proceso ${pid}`);
        }
      });

      console.log(`⏳ Tiempo total: ${this.clock}s   🔥 Thrashing: ${this.thrashing}s`);
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
      
      const pages = this.ptrToPages.get(ptr) || [];
      pages.forEach(pageId => {
        if (this.ram.delete(pageId)) {
          this.accessSequence = this.accessSequence.filter(p => p !== pageId);
          console.log(`🗑️ OPT: página ${pageId} eliminada.`);
        }
      });
      this.ptrToPages.delete(ptr);
      // eliminar ptr de processTable
      for (const arr of this.processTable.values()) {
        const i = arr.indexOf(ptr);
        if (i !== -1) { arr.splice(i,1); break; }
      }
    }


    killProcess(pid) {
      const ptrs = this.processTable.get(pid) || [];
      ptrs.forEach(ptr => this.deletePage(ptr));
      this.processTable.delete(pid);
      console.log(`☠️ OPT: proceso ${pid} eliminado.`);
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