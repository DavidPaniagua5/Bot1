// src/analizador_semantico/instrucciones/Asignacion.js

const Instruccion = require('../abstract/instruccion');

class Asignacion extends Instruccion {
    constructor(identificador, expresion, linea, columna) {
        super(linea, columna);
        this.identificador = identificador;
        this.expresion = expresion;
    }

    ejecutar(entorno) {
        try {
            // 1. Obtener el ID: Retorna el string "contador" (gracias a Identificador.js, acceso=false)
            const id = this.identificador.ejecutar(entorno); 
            
            // 2. Evaluar la Expresión: Retorna { valor, tipo }
            const nuevoResultado = this.expresion.ejecutar(entorno); 

            // 3. Obtener el Símbolo existente (Busca en el entorno)
            // Asume que entorno.obtenerSimbolo(id) existe y lanza error si no lo encuentra.
            const simbolo = entorno.obtenerSimbolo(id);

            // 4. Verificar Tipado Estático
            if (simbolo.tipo !== nuevoResultado.tipo) {
                // TODO: Usar el gestor de errores real del proyecto
                throw new Error(`Error Semántico: No se puede asignar un valor tipo ${nuevoResultado.tipo} a la variable '${id}' tipo ${simbolo.tipo}.`);
            }
            
            // 5. Asignar el nuevo valor al Simbolo
            simbolo.valor = nuevoResultado.valor;
            
            return nuevoResultado; 

        } catch (error) {
            throw new Error(`Error en asignación: ${error.message} en ${this.getPosicion()}`);
        }
    }

    toString() {
        return `Asignacion(${this.identificador} = ${this.expresion.toString()})`;
    }
}

module.exports = Asignacion;