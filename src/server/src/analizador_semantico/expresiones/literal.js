// src/analizador_semantico/expresiones/Literal.js (Modificar)

const Expresion = require('../abstract/expresion'); // Asumo que tienes una clase base Expresion
const TIPO_DATO = require('../simbolo/TipoDato'); // Importar para retornar el tipo

class Literal extends Expresion {
    // El constructor ya recibe el valor y el tipo semántico (NUMERO, CADENA, etc.)
    constructor(valor, tipoSemantico, linea, columna) {
        super(linea, columna);
        this.valor = valor;
        // Mapea los tipos del generador de instancias a los tipos semánticos
        this.tipo = this.mapTipo(tipoSemantico); 
    }
    
    mapTipo(tipoSemantico) {
        // Asegúrate de que este mapeo sea correcto
        switch (tipoSemantico) {
            case 'NUMERO': return (Number.isInteger(this.valor) ? TIPO_DATO.ENTERO : TIPO_DATO.DECIMAL);
            case 'CADENA': 
            case 'CADENA_LITERAL': return TIPO_DATO.CADENA;
            case 'CARACTER':
            case 'CARACTER_LITERAL': return TIPO_DATO.CARACTER;
            case 'BOOLEANO':
            case 'BOOLEANO_LITERAL': return TIPO_DATO.BOOLEANO;
            default: return TIPO_DATO.NULO;
        }
    }

    ejecutar(entorno) {
        // CORRECCIÓN CLAVE: Retorna el valor Y el tipo.
        return {
            valor: this.valor,
            tipo: this.tipo,
        };
    }
}
module.exports = Literal;