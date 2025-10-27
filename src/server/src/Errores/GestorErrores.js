const ErrorL = require('./ErrorL');

class GestorErrores {
    constructor() {
        this.errores = [];
    }

    agregar(tipo, descripcion, linea, columna) {
        const error = new ErrorL(tipo, descripcion, linea, columna);
        this.errores.push(error);
        //console.error(error.toString());
    }

    agregarLexico(descripcion, linea, columna) {
        this.agregar('Léxico', descripcion, linea, columna);
    }

    agregarSintactico(descripcion, linea, columna) {
        this.agregar('Sintáctico', descripcion, linea, columna);
    }

    agregarSemantico(descripcion, linea, columna) {
        this.agregar('Semántico', descripcion, linea, columna);
    }

    obtenerErrores() {
        return this.errores;
    }

    hayErrores() {
        return this.errores.length > 0;
    }

    limpiar() {
        this.errores = [];
    }

    generarReporte() {
        return this.errores.map((error, index) => ({
            '#': index + 1,
            'Tipo': error.tipo,
            'Descripción': error.descripcion,
            'Línea': error.linea,
            'Columna': error.columna
        }));
    }
}

module.exports = GestorErrores;