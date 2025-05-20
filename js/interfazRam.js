/**
 * Genera un uso de RAM secuencial con los primeros N bloques usados
 * @param {number} usados - Cantidad de bloques que deben estar usados
 * @returns {boolean[]} Array de 100 valores true/false
 */
function generarUsoRamDesdeNumero(usados) {
    return Array.from({ length: 100 }, (_, i) => i < usados);
}

/**
 * Renderiza RAM en un contenedor específico
 * @param {string} containerId
 * @param {boolean[]} usageData
 */
function renderRAM(containerId, usageData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    usageData.forEach((used, i) => {
        const block = document.createElement('div');
        block.classList.add('block');

        if (used) {
            block.classList.add(i % 2 === 0 ? 'used-even' : 'used-odd');
        } else {
            block.classList.add('unused');
        }

        container.appendChild(block);
    });
}

/**
 * Cambia el título del algoritmo dinámico
 */
function setAlgoritmo(nombreAlgoritmo) {
    const title = document.getElementById('ram-alg');
    if (title) {
        title.textContent = `RAM - [${nombreAlgoritmo}]`;
    }
}

// Renderiza ambos bloques con el mismo número de bloques usados
document.addEventListener('DOMContentLoaded', () => {
    const cantidadUsada = Math.floor(Math.random() * 100) + 1;
    const usoCompartido = generarUsoRamDesdeNumero(cantidadUsada);

    renderRAM('ram-blocks-opt', usoCompartido);
    renderRAM('ram-blocks-alg', usoCompartido);
});
