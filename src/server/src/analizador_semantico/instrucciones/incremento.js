// src/analizador_semantico/instrucciones/incremento.js
const Instruccion = require('../abstract/instruccion');

class Incremento extends Instruccion {
    constructor(identificador, linea, columna) {
        super(linea, columna);
        this.identificador = identificador;
    }

    ejecutar(entorno) {
        try {
            const id = this.identificador.ejecutar(entorno); // Obtiene el string del ID
            const simbolo = entorno.obtener(id);

            if (simbolo.tipo !== 'entero' && simbolo.tipo !== 'decimal') {
                throw new Error(`Incremento solo aplica a tipos numéricos. Variable '${id}' es ${simbolo.tipo}`);
            }

            simbolo.valor = Number(simbolo.valor) + 1;
            entorno.asignar(id, simbolo); // Actualiza en el entorno

            return { valor: simbolo.valor, tipo: simbolo.tipo };
        } catch (error) {
            throw new Error(`Error en incremento: ${error.message} en ${this.getPosicion()}`);
        }
    }
}

module.exports = Incremento;
