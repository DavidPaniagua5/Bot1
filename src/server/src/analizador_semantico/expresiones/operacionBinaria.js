// src/analizador_semantico/expresiones/OperacionBinaria.js

const Expresion = require('../abstract/expresion');
const TIPO_DATO = require('../simbolo/TipoDato'); // Importar tipos de datos

class OperacionBinaria extends Expresion {
    /**
     * @param {Expresion} operandoIzquierdo - Expresión izquierda
     * @param {string} operador - El operador (Ej: 'MAS', 'IGUAL_IGUAL')
     * @param {Expresion} operandoDerecho - Expresión derecha
     * @param {number} linea
     * @param {number} columna
     */
    constructor(operandoIzquierdo, operador, operandoDerecho, linea, columna) {
        super(linea, columna);
        this.operandoIzquierdo = operandoIzquierdo;
        this.operador = operador;
        this.operandoDerecho = operandoDerecho;
    }

    ejecutar(entorno) {
        // 1. Ejecutar operandos (deben retornar { valor, tipo })
        const resIzq = this.operandoIzquierdo.ejecutar(entorno);
        const resDer = this.operandoDerecho.ejecutar(entorno);

        let valorFinal = null;
        let tipoFinal = TIPO_DATO.NULO;
        
        const valIzq = resIzq.valor;
        const valDer = resDer.valor;
        const tipoIzq = resIzq.tipo;
        const tipoDer = resDer.tipo;

        if (['MAS', 'MENOS', 'MULTIPLICACION', 'DIVISION', 'MODULO', 'POTENCIA'].includes(this.operador)) {
            
            // Lógica de la SUMA (concatenación de cadenas)
            if (this.operador === 'MAS' && (tipoIzq === TIPO_DATO.CADENA || tipoDer === TIPO_DATO.CADENA)) {
                tipoFinal = TIPO_DATO.CADENA;
                valorFinal = String(valIzq) + String(valDer);
            } 
            
            // Lógica para todas las operaciones NUMÉRICAS
            else if ((tipoIzq === TIPO_DATO.ENTERO || tipoIzq === TIPO_DATO.DECIMAL) &&
                     (tipoDer === TIPO_DATO.ENTERO || tipoDer === TIPO_DATO.DECIMAL)) {
                
                // Determinación del tipo resultante (coerción)
                tipoFinal = (tipoIzq === TIPO_DATO.DECIMAL || tipoDer === TIPO_DATO.DECIMAL) 
                            ? TIPO_DATO.DECIMAL 
                            : TIPO_DATO.ENTERO;
                
                // Operaciones
                switch (this.operador) {
                    case 'MAS': valorFinal = Number(valIzq) + Number(valDer); break;
                    case 'MENOS': valorFinal = Number(valIzq) - Number(valDer); break;
                    case 'MULTIPLICACION': valorFinal = Number(valIzq) * Number(valDer); break;
                    
                    case 'DIVISION': 
                        if (Number(valDer) === 0) {
                            throw new Error(`Error Semántico: División por cero en ${this.getPosicion()}`);
                        }
                        tipoFinal = TIPO_DATO.DECIMAL; // La división siempre produce decimal
                        valorFinal = Number(valIzq) / Number(valDer);
                        break;
                        
                    case 'MODULO': 
                        valorFinal = Number(valIzq) % Number(valDer); 
                        // El residuo de enteros es entero
                        tipoFinal = TIPO_DATO.ENTERO; 
                        break;
                    
                    case 'POTENCIA': // ^
                        valorFinal = Math.pow(Number(valIzq), Number(valDer));
                        break; // El tipo ya se determinó arriba (ENTERO o DECIMAL)
                }
            } else {
                 throw new Error(`Error Semántico: Tipos incompatibles para la operación aritmética '${this.operador}': ${tipoIzq} y ${tipoDer} en ${this.getPosicion()}`);
            }
        }
        
        else if (['IGUAL_IGUAL', 'DIFERENTE', 'MENOR_QUE', 'MAYOR_QUE', 'MENOR_IGUAL', 'MAYOR_IGUAL'].includes(this.operador)) {
            
            // Asignación de tipo: Una operación relacional SIEMPRE devuelve BOOLEANO.
            tipoFinal = TIPO_DATO.BOOLEANO;
            
            // Regla de compatibilidad simplificada: Permite comparar tipos iguales o numéricos
            if ((tipoIzq === tipoDer) || 
                (tipoIzq === TIPO_DATO.ENTERO && tipoDer === TIPO_DATO.DECIMAL) ||
                (tipoIzq === TIPO_DATO.DECIMAL && tipoDer === TIPO_DATO.ENTERO)) {

                switch (this.operador) {
                    case 'IGUAL_IGUAL': // ==
                        valorFinal = valIzq == valDer;
                        break;
                    case 'DIFERENTE': // !=
                        valorFinal = valIzq != valDer;
                        break;
                    case 'MENOR_QUE': // <
                        valorFinal = valIzq < valDer;
                        break;
                    case 'MAYOR_QUE': // >
                        valorFinal = valIzq > valDer;
                        break;
                    case 'MENOR_IGUAL': // <=
                        valorFinal = valIzq <= valDer;
                        break;
                    case 'MAYOR_IGUAL': // >=
                        valorFinal = valIzq >= valDer;
                        break;
                }
            } else {
                 throw new Error(`Error Semántico: Comparación relacional incompatible entre tipos ${tipoIzq} y ${tipoDer} en ${this.getPosicion()}`);
            }
        }
        
        else if (['AND', 'OR'].includes(this.operador)) {
            
            tipoFinal = TIPO_DATO.BOOLEANO;
            
            if (tipoIzq === TIPO_DATO.BOOLEANO && tipoDer === TIPO_DATO.BOOLEANO) {
                 switch (this.operador) {
                    case 'AND': // &&
                        valorFinal = valIzq && valDer;
                        break;
                    case 'OR': // ||
                        valorFinal = valIzq || valDer;
                        break;
                }
            } else {
                 throw new Error(`Error Semántico: Operación lógica '${this.operador}' solo permitida entre booleanos en ${this.getPosicion()}`);
            }
        }
        
        else {
            throw new Error(`Operador binario '${this.operador}' no reconocido o implementado en ${this.getPosicion()}`);
        }

        // 3. Retornar el resultado completo: { valor, tipo }
        return {
            valor: valorFinal,
            tipo: tipoFinal,
        };
    }
}

module.exports = OperacionBinaria;