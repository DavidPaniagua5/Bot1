// src/analizador_semantico/instrucciones/decremento.js
const Instruccion = require('../abstract/instruccion');

class Decremento extends Instruccion {
    constructor(identificador, linea, columna) {
        super(linea, columna);
        this.identificador = identificador;
    }

    ejecutar(entorno) {
        try {
            const id = this.identificador.ejecutar(entorno);
            const simbolo = entorno.obtener(id);

            if (simbolo.tipo !== 'entero' && simbolo.tipo !== 'decimal') {
                throw new Error(`Decremento solo aplica a tipos numéricos. Variable '${id}' es ${simbolo.tipo}`);
            }

            simbolo.valor = Number(simbolo.valor) - 1;
            entorno.asignar(id, simbolo);

            return { valor: simbolo.valor, tipo: simbolo.tipo };
        } catch (error) {
            throw new Error(`Error en decremento: ${error.message} en ${this.getPosicion()}`);
        }
    }
}

module.exports = Decremento;