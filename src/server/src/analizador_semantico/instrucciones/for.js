const Instruccion = require( '../abstract/instruccion' );

class For extends Instruccion {
    
    constructor ( init, condicion, update, sentencia, linea, columna )
    {
        super( linea, columna );
        this.init = init;
        this.condicion = condicion;
        this.update = update;
        this.sentencia = sentencia;
    }

    ejecutar ( entorno , errores = null) {
        try {
            // Crear un nuevo entorno para el for
            const local = entorno.crearEntornoHijo();
            
            // Ejecutar la inicialización
            if ( this.init ) {
                this.init.ejecutar( local );
            }


            let iteraciones = 0;
            const MAX_ITERACIONES = 10000;

            while ( !this.condicion || this.esVerdadero( this.condicion.ejecutar( local ) ) )
            {
                // Protección contra bucles infinitos
                if ( iteraciones >= MAX_ITERACIONES )
                {
                    throw new Error( `Posible bucle infinito detectado (${ MAX_ITERACIONES } iteraciones) en ${ this.getPosicion() }` );
                }


                this.sentencia.ejecutar( local );
                if ( this.update ) this.update.ejecutar( local );
                iteraciones++;
            }

            return;
        } catch ( error )
        {
            throw new Error( `Error en while: ${ error.message } en ${ this.getPosicion() }` );
        }
    }

    esVerdadero( valor )
    {
        if ( typeof valor === 'boolean' ) return valor;
        if ( typeof valor === 'number' ) return valor !== 0;
        if ( typeof valor === 'string' ) return valor !== '';
        if ( valor === null || valor === undefined ) return false;
        return true;
    }

    toString()
    {
        const condStr = this.condicion ? this.condicion.toString() : 'true';
        return `For(${ this.init ? this.init.toString() : '' }; ${ condStr }; ${ this.update ? this.update.toString() : '' })`;
    }
}

module.exports = For;