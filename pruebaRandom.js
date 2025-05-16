function mulberry32(a) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function randomFromArray(arr, rand) {
    return arr[Math.floor(rand() * arr.length)];
}

function shuffle(array, rand) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generarEscenario() {
    const seed = parseInt(document.getElementById("seedInput").value);
    const algoritmo = document.getElementById("algorithmSelect").value;
    const P = parseInt(document.getElementById("processCount").value);
    const N = parseInt(document.getElementById("operationCount").value);

    const validP = [10, 50, 100];
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

    for (let i = 1; i <= P; i++) {
        procesos.push({
            pid: i,
            ops: [],
            ptrs: [], // lista de ptrs activos de este proceso
            killed: false,
        });
    }

    const operacionesGlobales = [];

    while (totalOps < N) {
        const vivos = procesos.filter(p => !p.killed);
        if (vivos.length === 0) break;

        const proceso = randomFromArray(vivos, rand);
        const puedeNew = true;
        const puedeUse = proceso.ptrs.length > 0;
        const puedeDelete = proceso.ptrs.length > 0;
        const puedeKill = proceso.ops.length >= 2 && !proceso.killed && rand() < 0.03;

        let op;

        if (puedeKill || totalOps >= N - vivos.length) {
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
                op = `new(${proceso.pid}, ${size}) // ptr = ${ptr}`;
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

    // Forzar kill si queda algún proceso vivo
    procesos.forEach(p => {
        if (!p.killed) {
            operacionesGlobales.push({ pid: p.pid, op: `kill(${p.pid})` });
            p.killed = true;
            p.ptrs = [];
        }
    });

    // Opcional: mezclar instrucciones, pero aquí dejamos orden lógico por claridad
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

    const resultado = `Algoritmo: ${algoritmo}\n\n` +
    final.map((x, i) => `${i + 1}. ${x.op}`).join("\n") +
    `\n\n🔢 Memoria total usada por 'new': ${totalSizeKB} KB de 400 KB`;

    document.getElementById("output").textContent = resultado;
}
