const Expresion = require('../abstract/expresion');

class Ternario extends Expresion {
    constructor(condicion, verdadero, falso, linea, columna) {
        super(linea, columna);
        this.condicion = condicion;
        this.verdadero = verdadero;
        this.falso = falso;
    }

    ejecutar(entorno) {
        const cond = this.condicion.ejecutar(entorno);
        
        if (typeof cond.valor !== 'boolean') {
            throw new Error(`La condición del operador ternario debe ser booleana, se recibió: ${typeof cond.valor}`);
        }

        if (cond.valor) {
            return this.verdadero.ejecutar(entorno);
        } else {
            return this.falso.ejecutar(entorno);
        }
    }

    toString() {
        return `(${this.condicion.toString()} ? ${this.verdadero.toString()} : ${this.falso.toString()})`;
    }
}

module.exports = Ternario;