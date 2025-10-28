const Expresion = require('../abstract/expresion');
const TIPO_DATO = require('../simbolo/TipoDato');

class Literal extends Expresion {
    constructor(valor, tipoSemantico, linea, columna) {
        super(linea, columna);
        this.valor = valor;
        this.tipo = this.mapTipo(tipoSemantico).toUpperCase(); // ← CORRECCIÓN: Unificar a MAYÚSCULAS
    }
    
    mapTipo(tipoSemantico) {
        switch (tipoSemantico) {
            case 'NUMERO':
            case 'NUMERO_LITERAL':
                return (Number.isInteger(this.valor) ? TIPO_DATO.ENTERO : TIPO_DATO.DECIMAL);
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
        return {
            valor: this.valor,
            tipo: this.tipo,
        };
    }
}

module.exports = Literal;