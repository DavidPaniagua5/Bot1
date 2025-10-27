class Simbolo {
    constructor(id, tipo, entornoId, valor, linea, columna) {
        this.id = id;
        this.tipo = tipo;
        this.entornoId = entornoId;
        this.valor = valor;
        this.linea = linea;
        this.columna = columna;
    }
}

module.exports = Simbolo;