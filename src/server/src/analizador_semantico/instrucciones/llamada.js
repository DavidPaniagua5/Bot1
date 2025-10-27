const Instruccion = require( '../abstract/instruccion' );

class Llamada extends Instruccion {
    constructor ( nombre, linea, columna )
    {
        super( linea, columna );
        this.nombre = nombre;
    }

    ejecutar ( entorno ) {
        let fin;
        try {
            fin = entorno.obtenerFuncion( this.nombre );
        }
        catch ( error )
        {
            throw new Error( `Error en la llamada a función '${ this.nombre }': ${ error.message } en ${ this.getPosicion() }` );
        }

        const local = entorno.crearEntornoHijo();
        try {
            fin.cuerpo.ejecutar( local );
        } catch ( error )
        {
            throw new Error( `Error al ejecutar la función '${ this.nombre }': ${ error.message } en ${ this.getPosicion() }` );
        }
    }
}

module.exports = Llamada;