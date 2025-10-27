const Instruccion = require( '../abstract/instruccion' );

class Funcion extends Instruccion {

    constructor ( nombre, cuerpo, linea, columna )
    {
        super( linea, columna );
        this.nombre = nombre;
        this.cuerpo = cuerpo;
    }

    ejecutar ( entorno ) {
        try {
            if ( entorno.funciones.has( this.nombre ) ) {
                throw new Error( `La función '${ this.nombre }' ya está definida en este ámbito` );

            }
            entorno.definirFuncion( this.nombre, this);
        } catch ( error )
        {
            throw new Error( `Error al definir la función '${ this.nombre }': ${ error.message } en ${ this.getPosicion() }` );
        }
    }
}

module.exports = Funcion;