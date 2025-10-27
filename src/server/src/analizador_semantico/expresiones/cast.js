const Expresion = require('../abstract/expresion');
const TIPO_DATO = require('../simbolo/TipoDato'); 

class Cast extends Expresion {
    /**
     * @param {string} tipoDestino - El tipo al que se quiere convertir (Ej: TIPO_DATO.CADENA)
     * @param {Expresion} expresion - La expresión cuyo valor se va a convertir
     */
    constructor(tipoDestino, expresion, linea, columna) {
        super(linea, columna);
        this.tipoDestino = tipoDestino;
        this.expresion = expresion;
    }

    ejecutar(entorno) {
        // Ejecutar la expresión para obtener su valor y tipo original
        const resultadoOriginal = this.expresion.ejecutar(entorno);
        const valorOriginal = resultadoOriginal.valor;
        const tipoOriginal = resultadoOriginal.tipo;

        let valorCasteado = null;
        
        // 1. Verificar si el tipo original es igual al destino (no se hace nada)
        if (tipoOriginal === this.tipoDestino) {
            return resultadoOriginal;
        }

        // 2. Lógica de Casos de Casteo
        switch (this.tipoDestino) {
            
            case TIPO_DATO.CADENA:
                // Se puede castear cualquier tipo a cadena
                valorCasteado = String(valorOriginal);
                break;
                
            case TIPO_DATO.ENTERO:
                // Casteo de DECIMAL a ENTERO (truncando) o BOOLEANO a ENTERO (0/1)
                if (tipoOriginal === TIPO_DATO.DECIMAL) {
                    valorCasteado = Math.trunc(Number(valorOriginal));
                } else if (tipoOriginal === TIPO_DATO.BOOLEANO) {
                    valorCasteado = valorOriginal ? 1 : 0; // true -> 1, false -> 0
                } else {
                    // Si no es un casteo permitido
                    throw new Error(`Error Semántico: No se puede castear ${tipoOriginal} a ENTERO en ${this.getPosicion()}`);
                }
                break;
                
            case TIPO_DATO.DECIMAL:
                // Casteo de ENTERO a DECIMAL (solo convertir) o BOOLEANO a DECIMAL (0.0/1.0)
                if (tipoOriginal === TIPO_DATO.ENTERO || tipoOriginal === TIPO_DATO.BOOLEANO) {
                    valorCasteado = Number(valorOriginal);
                } else {
                    throw new Error(`Error Semántico: No se puede castear ${tipoOriginal} a DECIMAL en ${this.getPosicion()}`);
                }
                break;
                
            case TIPO_DATO.BOOLEANO:
                // Casteo a BOOLEANO (0/1 a false/true)
                if (tipoOriginal === TIPO_DATO.ENTERO || tipoOriginal === TIPO_DATO.DECIMAL) {
                    // Cualquier valor numérico distinto de 0 es true
                    valorCasteado = Number(valorOriginal) !== 0;
                } else {
                    throw new Error(`Error Semántico: No se puede castear ${tipoOriginal} a BOOLEANO en ${this.getPosicion()}`);
                }
                break;
                
            default:
                throw new Error(`Error Semántico: Casteo a tipo ${this.tipoDestino} no soportado en ${this.getPosicion()}`);
        }

        // 3. Retornar el resultado con el nuevo tipo
        return {
            valor: valorCasteado,
            tipo: this.tipoDestino,
        };
    }
}

module.exports = Cast;