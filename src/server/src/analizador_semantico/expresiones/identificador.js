// src/analizador_semantico/expresiones/Identificador.js

const Expresion = require('../abstract/expresion');
const TIPO_DATO = require('../simbolo/TipoDato'); 

class Identificador extends Expresion {
    /**
     * @param {string} id - El nombre del identificador.
     * @param {boolean} acceso - true si se usa como valor (derecha); false si se usa para asignación (izquierda).
     */
    constructor(id, acceso = true, linea, columna) {
        super(linea, columna);
        this.id = id;
        this.acceso = acceso;
    }

    ejecutar(entorno) {
        // Caso 1: Se usa en el lado IZQUIERDO de una asignación (Asignacion.js llama a ejecutar).
        // Debe retornar el nombre (string) para que Asignacion.js pueda buscarlo.
        if (!this.acceso) { 
            return this.id; 
        }

        const simbolo = entorno.obtener(this.id);
        
        // Retorna el resultado completo: { valor, tipo }
        return {
            valor: simbolo.valor,
            tipo: simbolo.tipo,
        };
    }
}

module.exports = Identificador;