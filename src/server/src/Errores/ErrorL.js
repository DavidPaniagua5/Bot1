class ErrorL {
    constructor(tipo, descripcion, linea, columna) {
        this.tipo = tipo;          // "Léxico" o "Sintáctico"
        this.descripcion = descripcion;
        this.linea = linea || 0;
        this.columna = columna || 0;
    }
}

module.exports = ErrorL;
