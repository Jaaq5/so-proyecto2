document.addEventListener('DOMContentLoaded', () => {
    const updateBtn = document.getElementById('updateBtn');

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
    });
});
