// src/analizador_semantico/expresiones/OperacionUnaria.js

const Expresion = require('../abstract/expresion');
const TIPO_DATO = require('../simbolo/TipoDato'); // Importar tipos de datos

class OperacionUnaria extends Expresion {
    /**
     * @param {string} operador - El operador (Ej: 'NOT', 'MENOS_UNARIO')
     * @param {Expresion} operando - La expresión a evaluar
     * @param {number} linea
     * @param {number} columna
     */
    constructor(operador, operando, linea, columna) {
        super(linea, columna);
        this.operador = operador;
        this.operando = operando;
    }

    ejecutar(entorno) {
        // Ejecutar el operando (debe retornar { valor, tipo })
        const res = this.operando.ejecutar(entorno);

        let valorFinal = null;
        let tipoFinal = TIPO_DATO.NULO;

        // Lógica para el NOT Lógico (!)
        if (this.operador === 'NOT') {
            
            // La negación lógica solo se permite en booleanos
            if (res.tipo === TIPO_DATO.BOOLEANO) {
                tipoFinal = TIPO_DATO.BOOLEANO;
                valorFinal = !res.valor; // Se niega el valor booleano
            } else {
                // TODO: Usar gestor de errores.
                throw new Error(`Error Semántico: El operador NOT (!) solo se puede aplicar a expresiones de tipo BOOLEANO. Tipo encontrado: ${res.tipo} en ${this.getPosicion()}`);
            }
        } 
        // Lógica para el MENOS Unario (-)
        else if (this.operador === 'MENOS_UNARIO') {
            
            // El menos unario solo se permite en tipos numéricos
            if (res.tipo === TIPO_DATO.ENTERO || res.tipo === TIPO_DATO.DECIMAL) {
                tipoFinal = res.tipo; // Mantiene el tipo (entero o decimal)
                valorFinal = -Number(res.valor);
            } else {
                 throw new Error(`Error Semántico: El operador MENOS UNARIO (-) solo se puede aplicar a tipos numéricos. Tipo encontrado: ${res.tipo} en ${this.getPosicion()}`);
            }
        } else {
             throw new Error(`Operador unario '${this.operador}' no reconocido o implementado en ${this.getPosicion()}`);
        }

        // Retornar el resultado completo: { valor, tipo }
        return {
            valor: valorFinal,
            tipo: tipoFinal,
        };
    }
}

module.exports = OperacionUnaria;