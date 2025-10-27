// src/analizador_semantico/instrucciones/Declaracion.js

const Instruccion = require('../abstract/instruccion');
const Simbolo = require('../simbolo/Simbolo');
const TIPO_DATO = require('../simbolo/TipoDato'); 

class Declaracion extends Instruccion {
    constructor(tipo, identificador, expresion, linea, columna) {
        super(linea, columna);
        this.tipo = tipo;               
        this.identificador = identificador; 
        this.expresion = expresion;     
    }

    ejecutar(entorno) {
        let valorInicial = null;
        let tipoAsignado = this.tipo; 

        // 1. EVALUAR LA EXPRESIÓN DE INICIALIZACIÓN
        if (this.expresion) {
            const resultadoExpresion = this.expresion.ejecutar(entorno);
            valorInicial = resultadoExpresion.valor;
            tipoAsignado = resultadoExpresion.tipo;

            // 2. VERIFICACIÓN DE TIPADO ESTÁTICO (Declaración con asignación)
            if (this.tipo !== tipoAsignado) {
                throw new Error(`Error Semántico: El tipo declarado (${this.tipo}) no coincide con el tipo de la expresión (${tipoAsignado}) en ${this.getPosicion()}.`);
            }
        
        } else {
            // 3. DECLARACIÓN SIMPLE: ASIGNAR VALOR POR DEFECTO
            switch(this.tipo) {
                case TIPO_DATO.ENTERO:
                case TIPO_DATO.DECIMAL:
                    valorInicial = 0;
                    break;
                case TIPO_DATO.BOOLEANO:
                    valorInicial = false;
                    break;
                case TIPO_DATO.CADENA:
                case TIPO_DATO.CARACTER:
                    valorInicial = "";
                    break;
                default:
                    valorInicial = null;
            }
        }

        // 4. CREAR EL SÍMBOLO Y REGISTRAR
        const nuevoSimbolo = new Simbolo(
            this.identificador,
            this.tipo,             
            entorno.id || 'GLOBAL', 
            valorInicial,
            this.linea,
            this.columna
        );

        // Usar el método 'definir' de Entorno para registrar el símbolo
        entorno.definir(this.identificador, nuevoSimbolo);
    }
}

module.exports = Declaracion;