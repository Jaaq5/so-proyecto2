class Estudiante {
    constructor(nombre, carne, carrera) {
        this.nombre = nombre;
        this.carne = carne;
        this.carrera = carrera;
    }

    mostrarInfo() {
        console.log(`Nombre: ${this.nombre}`);
        console.log(`Carné: ${this.carne}`);
        console.log(`Carrera: ${this.carrera}`);
    }

    getInfo() {
        return {
            nombre: this.nombre,
            carne: this.carne,
            carrera: this.carrera
        };
    }
}
