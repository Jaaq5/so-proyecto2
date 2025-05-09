document.addEventListener('DOMContentLoaded', () => {
    const updateBtn = document.getElementById('updateBtn');
    const botonSecondChance = document.getElementById('botonSecondChance');
    const botonMRU = document.getElementById('botonMRU');
    const botonRND = document.getElementById('botonRND');
    const botonOPT = document.getElementById('botonOPT');




    updateBtn.addEventListener('click', () => {
        // Crear un nuevo estudiante
        const estudiante = new Estudiante(
            'Juan Pérez',
            '2020-12345',
            'Ingeniería en Sistemas'
        );

        // Mostrar info en consola
        estudiante.mostrarInfo();

        // Actualizar la tabla en el HTML
        const info = estudiante.getInfo();
        document.getElementById('nombre').textContent = info.nombre;
        document.getElementById('carne').textContent = info.carne;
        document.getElementById('carrera').textContent = info.carrera;

        // 📜 Simulación con la secuencia EXACTA
        const mmu = new MMU_FIFO(3);

        /*
        const operations = [
            "1 new(1,500)",   // Puntero 1 asignado
            "2 new(1,1000)",  // Puntero 2 asignado
            "3 new(1,2000)",  // Puntero 3 asignado
            "4 use(1)",      //  HIT (Página 1 en RAM)
            "5 use(2)",       //  HIT (Página 2 en RAM)
            "6 use(3)",      //  HIT (Página 3 en RAM)
            "7 new(2,500)",   //  FIFO reemplaza Puntero 1 (Memoria llena)
            "8 use(1)",       //  FAULT (Página 1 fue expulsada, fallo de página)
            "9 use(4)",       //  FAULT (Página 4 no existe en RAM, fallo de página)
            "10 new(2,50)",   //  FIFO reemplaza otra página
            "11 use(2)",      //  HIT (Página 2 en RAM)
            "12 use(3)",      //  HIT (Página 3 en RAM)
            "13 use(5)",      //  FAULT (Página 5 no existe, fallo de página)
            "14 delete(2)",   // Página 2 eliminada
            "15 use(2)",      //  FAULT (Página 2 eliminada, fallo de página)
            "16 kill(1)"     // Todas las páginas del proceso 1 eliminadas
        ];
        */
        const operations = [
            "1 new(1,500)",    // Puntero P1 asignado
            "2 new(1,1000)",   // Puntero P2 asignado
            "3 new(1,2000)",   // Puntero P3 asignado
            "4 use(1)",        // :white_check_mark: HIT (Página P1 en RAM)
            "5 use(2)",        // :white_check_mark: HIT (Página P2 en RAM)
            "6 use(3)",        // :white_check_mark: HIT (Página P3 en RAM)
            "7 new(2,500)",    // :rotating_light: FIFO reemplaza P1 (Memoria llena)
            "8 use(1)",        // :red_circle: FAULT (Página P1 fue expulsada)
            "9 use(4)",        // :red_circle: FAULT (Página P4 no existe en RAM)
            "10 new(2,50)",    // :rotating_light: FIFO reemplaza otra página
            "11 use(2)",       // :white_check_mark: HIT (Página P2 en RAM)
            "12 use(3)",       // :white_check_mark: HIT (Página P3 en RAM)
            "13 use(5)",       // :red_circle: FAULT (Página P5 no existe)
            "14 delete(2)",    // Página P2 eliminada
            "15 use(2)",       // :red_circle: FAULT (Página P2 eliminada)
            "16 kill(1)",      // Todas las páginas del proceso 1 eliminadas
            "17 new(3,700)",   // :rotating_light: FIFO reemplaza P3
            "18 use(3)",       // :red_circle: FAULT (Página P3 eliminada)
            "19 new(4,900)",   // :rotating_light: FIFO reemplaza otra página
            "20 use(1)",       // :red_circle: FAULT (Página P1 ya no está en memoria
            "21 use(6)",       // :red_circle: FAULT (Página P6 no existe)
            "22 delete(3)",    // Eliminación de P3
            "23 new(5,600)",   // :rotating_light: FIFO reemplaza una página más
            "24 use(4)",       // :white_check_mark: HIT (Página P4 en RAM)
            "25 use(7)",       // :red_circle: FAULT (Página P7 no existe en RAM)
            "26 delete(4)",    // Página eliminada
            "27 use(5)",       // :white_check_mark: HIT (Página P5 en RAM)
            "28 use(8)",       // :red_circle: FAULT (Página P8 no está en RAM)
            "29 new(6,300)",   // :rotating_light: FIFO reemplaza otra página
            "30 kill(2)"       // Todas las páginas del proceso 2 eliminadas
        ];


        console.log("\n🔄 Iniciando simulación con FIFO...");
        operations.forEach(op => mmu.executeOperation(op));
        mmu.printFinalStats(); // 🎯 Mostrar métricas al final
        console.log("\n✅ Simulación completada.");

    });

    botonSecondChance.addEventListener('click', () => {
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
    });

    botonMRU.addEventListener('click', () => {
        // 📜 Simulación con MRU
        const mmu = new MMU_MRU(3);
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

        console.log("\n🔄 Iniciando simulación con MRU...");
        operations.forEach(op => mmu.executeOperation(op));
        mmu.printFinalStats(); // 🎯 Mostrar métricas finales
        console.log("\n✅ Simulación completada.");

    });

    botonRND.addEventListener('click', () => {
        // 📜 Simulación con RND
        const mmu = new MMU_RND(3);
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

        console.log("\n🔄 Iniciando simulación con RND...");
        operations.forEach(op => mmu.executeOperation(op));
        mmu.printFinalStats(); // 🎯 Mostrar métricas finales
        console.log("\n✅ Simulación completada.");
    });

    botonOPT.addEventListener('click', () => {
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
    });

});
