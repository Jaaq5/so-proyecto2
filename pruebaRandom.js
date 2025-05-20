/**
 * Variable global que almacena el contenido generado.
 * @type {string}
 */
let contenidoGenerado = "";

/**
 * Genera una función generadora de números pseudoaleatorios
 * basada en la semilla dada (algoritmo Mulberry32).
 * @param {number} a - Semilla inicial para el generador.
 * @returns {function(): number} - Función que genera números aleatorios en [0,1).
 */
function mulberry32(a) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Selecciona un elemento aleatorio de un arreglo usando la función rand.
 * @template T
 * @param {T[]} arr - Arreglo de elementos.
 * @param {function(): number} rand - Función generadora de números aleatorios [0,1).
 * @returns {T} - Elemento aleatorio seleccionado del arreglo.
 */
function randomFromArray(arr, rand) {
    return arr[Math.floor(rand() * arr.length)];
}

/**
 * Mezcla aleatoriamente los elementos de un arreglo usando el algoritmo Fisher-Yates.
 * @template T
 * @param {T[]} array - Arreglo a mezclar.
 * @param {function(): number} rand - Función generadora de números aleatorios [0,1).
 * @returns {T[]} - Arreglo mezclado.
 */
function shuffle(array, rand) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Genera un escenario con operaciones para procesos simulados.
 * Lee parámetros desde inputs HTML, valida y genera operaciones
 * aleatorias siguiendo ciertas reglas de orden y finalización.
 *
 * Imprime el resultado completo en consola y guarda las instrucciones limpias
 * en la variable global contenidoGenerado.
 */
function generarEscenario() {
    const seed = parseInt(document.getElementById("seed").value);
    const algoritmo = document.getElementById("algorithm").value;
    const P = parseInt(document.getElementById("process-count").value);
    const N = parseInt(document.getElementById("operation-count").value);

    /** Valores válidos para la cantidad de procesos */
    const validP = [10, 50, 100];
    /** Valores válidos para la cantidad de operaciones */
    const validN = [500, 1000, 5000];

    if (!validP.includes(P)) {
        alert("P debe ser 10, 50 o 100.");
        return;
    }
    if (!validN.includes(N)) {
        alert("N debe ser 500, 1000 o 5000.");
        return;
    }

    const rand = mulberry32(seed);
    const procesos = [];
    let ptrCounter = 1;
    let totalOps = 0;
    let ultimoPidNew = 1;

    // Inicializa los procesos
    for (let i = 1; i <= P; i++) {
        procesos.push({
            pid: i,
            ops: [],
            ptrs: [], // lista de ptrs activos de este proceso
            killed: false,
        });
    }

    const operacionesGlobales = [];
    let ultimoPidKilled = 0;

    // Forzar primer new para pid = 1
    const procesoInicial = procesos.find(p => p.pid === 1);
    const sizeInicial = Math.floor(rand() * 16000) + 1;
    const ptrInicial = ptrCounter++;
    procesoInicial.ptrs.push(ptrInicial);
    procesoInicial.ops.push(`new(1,${sizeInicial}) // ptr = ${ptrInicial}`);
    operacionesGlobales.push({ pid: 1, op: `new(1,${sizeInicial}) // ptr = ${ptrInicial}` });
    ultimoPidNew = 1;
    totalOps++;

    // Generación de operaciones restantes
    while (totalOps < N) {
        const vivos = procesos.filter(p => !p.killed);
        if (vivos.length === 0) break;

        let candidatos = vivos;

        if (totalOps < N) {
            // Filtra candidatos para cumplir la condición de orden en NEW
            candidatos = vivos.filter(p =>
            p.pid === ultimoPidNew || p.pid === ultimoPidNew + 1
            );
            if (candidatos.length === 0) candidatos = vivos;
        }

        const proceso = randomFromArray(candidatos, rand);

        const puedeNew = true;
        const puedeUse = proceso.ptrs.length > 0;
        const puedeDelete = proceso.ptrs.length > 0;
        const puedeKill = totalOps >= N - vivos.length; // Solo forzar kill cuando quedan pocas ops

        let op;

        if (puedeKill) {
            op = `kill(${proceso.pid})`;
            proceso.killed = true;
            proceso.ptrs = [];
        } else {
            const opciones = [];
            if (puedeNew) opciones.push("new");
            if (puedeUse) opciones.push("use");
            if (puedeDelete) opciones.push("delete");

            const seleccionada = randomFromArray(opciones, rand);

            if (seleccionada === "new") {
                const size = Math.floor(rand() * 16000) + 1;
                const ptr = ptrCounter++;
                proceso.ptrs.push(ptr);

                if (proceso.pid === ultimoPidNew + 1) {
                    ultimoPidNew++;
                }

                op = `new(${proceso.pid},${size}) // ptr = ${ptr}`;
            } else if (seleccionada === "use") {
                const ptr = randomFromArray(proceso.ptrs, rand);
                op = `use(${ptr})`;
            } else if (seleccionada === "delete") {
                const ptr = randomFromArray(proceso.ptrs, rand);
                proceso.ptrs = proceso.ptrs.filter(p => p !== ptr);
                op = `delete(${ptr})`;
            }
        }

        proceso.ops.push(op);
        operacionesGlobales.push({ pid: proceso.pid, op });
        totalOps++;
    }

    // Forzar kill en orden de pid
    procesos
    .filter(p => !p.killed)
    .sort((a, b) => a.pid - b.pid)
    .forEach(p => {
        operacionesGlobales.push({ pid: p.pid, op: `kill(${p.pid})` });
        p.killed = true;
        p.ptrs = [];
    });

    // Opcional: mezclar instrucciones, pero de deja para un orden lógico por claridad
    // const final = shuffle(operacionesGlobales, rand);
    const final = operacionesGlobales;

    let totalSizeBytes = 0;

    // Sumar tamaños de 'new' para total
    final.forEach(({ op }) => {
        const match = op.match(/new\(\d+, (\d+)\)/);
        if (match) {
            totalSizeBytes += parseInt(match[1], 10);
        }
    });

    const totalSizeKB = (totalSizeBytes / 1024).toFixed(2);

    // Mostrar todo en consola (con numeración, algoritmo y comentario)
    const resultadoCompleto = `Algoritmo: ${algoritmo}\n\n` +
    final.map((x, i) => `${i + 1}. ${x.op}`).join("\n") +
    `\n\n🔢 Memoria total usada por 'new': ${totalSizeKB} KB de 400 KB`;

    console.log(resultadoCompleto); // Imprime todo por consola

    // Guardar solo las instrucciones limpias en memoria
    contenidoGenerado = final.map(({ op }) => {
        return op.split("//")[0].trim(); // Quita el comentario y espacios extra
    }).join("\n");

}
