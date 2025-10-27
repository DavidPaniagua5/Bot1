class ErrorL {
    constructor(tipo, descripcion, linea, columna) {
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.linea = linea || 0;
        this.columna = columna || 0;
    }

    toString() {
        return `[${this.tipo}] Línea ${this.linea}, Columna ${this.columna}: ${this.descripcion}`;
    }

    toJSON() {
        return {
            tipo: this.tipo,
            descripcion: this.descripcion,
            linea: this.linea,
            columna: this.columna
        };
    }
}

module.exports = ErrorL;