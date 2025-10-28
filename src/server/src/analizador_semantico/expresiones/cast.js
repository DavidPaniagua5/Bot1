// src/analizador_semantico/expresiones/cast.js
const Expresion = require('../abstract/expresion');
const TIPO_DATO = require('../simbolo/TipoDato');

class Casteo extends Expresion {
    constructor(tipoDestino, expresion, linea, columna) {
        super(linea, columna);
        this.tipoDestino = tipoDestino;
        this.expresion = expresion;
    }

    ejecutar(entorno) {
        const resultadoOriginal = this.expresion.ejecutar(entorno);
        const valorOriginal = resultadoOriginal.valor;
        const tipoOriginal = resultadoOriginal.tipo;

        // Si ya es del tipo destino, devolver sin cambios
        if (tipoOriginal === this.tipoDestino) {
            return resultadoOriginal;
        }

        let valorCasteado = null;

        switch (this.tipoDestino) {
            case TIPO_DATO.CADENA:
                valorCasteado = String(valorOriginal);
                break;

            case TIPO_DATO.ENTERO:
                if (tipoOriginal === TIPO_DATO.DECIMAL) {
                    valorCasteado = Math.trunc(Number(valorOriginal));
                } else if (tipoOriginal === TIPO_DATO.BOOLEANO) {
                    valorCasteado = valorOriginal ? 1 : 0;
                } else {
                    throw new Error(`No se puede castear ${tipoOriginal} a ENTERO en ${this.getPosicion()}`);
                }
                break;

            case TIPO_DATO.DECIMAL:
                if (tipoOriginal === TIPO_DATO.ENTERO || tipoOriginal === TIPO_DATO.BOOLEANO) {
                    valorCasteado = Number(valorOriginal);
                } else {
                    throw new Error(`No se puede castear ${tipoOriginal} a DECIMAL en ${this.getPosicion()}`);
                }
                break;

            case TIPO_DATO.BOOLEANO:
                if (tipoOriginal === TIPO_DATO.ENTERO || tipoOriginal === TIPO_DATO.DECIMAL) {
                    valorCasteado = Number(valorOriginal) !== 0;
                } else {
                    throw new Error(`No se puede castear ${tipoOriginal} a BOOLEANO en ${this.getPosicion()}`);
                }
                break;

            case TIPO_DATO.CARACTER:
                if (tipoOriginal === TIPO_DATO.ENTERO) {
                    const code = Math.trunc(Number(valorOriginal));
                    if (code >= 0 && code <= 255) {
                        valorCasteado = String.fromCharCode(code);
                    } else {
                        throw new Error(`Código de carácter fuera de rango (0-255): ${code} en ${this.getPosicion()}`);
                    }
                } else {
                    throw new Error(`Solo se puede castear ENTERO a CARACTER en ${this.getPosicion()}`);
                }
                break;

            default:
                throw new Error(`Casteo a tipo ${this.tipoDestino} no soportado en ${this.getPosicion()}`);
        }

        return {
            valor: valorCasteado,
            tipo: this.tipoDestino
        };
    }
}

module.exports = Casteo;