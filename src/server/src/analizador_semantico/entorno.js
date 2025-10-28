class Entorno {
    constructor(entornoAnterior = null) {
        this.variables = new Map();
        this.entornoAnterior = entornoAnterior;
        this.salida = [];
        this.funciones = new Map();
    }

    definir(nombre, valor) {
        this.variables.set(nombre, valor);
    }

    // Asigna un valor a una variable existente
    asignar(nombre, valor) {
        if (this.variables.has(nombre)) {
            this.variables.set(nombre, valor);
            return;
        }

        if (this.entornoAnterior !== null) {
            this.entornoAnterior.asignar(nombre, valor);
            return;
        }

        throw new Error(`Variable '${nombre}' no declarada`);
    }

    // Obtiene el valor de una variable
    obtener(nombre) {
        if (this.variables.has(nombre)) {
            return this.variables.get(nombre);
        }

        if (this.entornoAnterior !== null) {
            return this.entornoAnterior.obtener(nombre);
        }

        throw new Error(`Variable '${nombre}' no declarada`);
    }

    // Verifica si una variable existe en el entorno actual o en alguno anterior
    existe(nombre) {
        if (this.variables.has(nombre)) {
            return true;
        }

        if (this.entornoAnterior !== null) {
            return this.entornoAnterior.existe(nombre);
        }

        return false;
    }

    getVariables() {
        const todas = new Map();
        let actual = this;
        while (actual !== null) {
            for (const [nombre, simbolo] of actual.variables) {
                if (!todas.has(nombre)) {
                    todas.set(nombre, {
                        id: simbolo.id,
                        tipo: simbolo.tipo,
                        valor: simbolo.valor,
                        linea: simbolo.linea,
                        columna: simbolo.columna
                    });
                }
            }
            actual = actual.entornoAnterior;
        }
        return todas;
    }

    crearEntornoHijo() {
        const entornoHijo = new Entorno(this);
        return entornoHijo;
    }

    // Esto busca el entorno global y agrega la salida ahí
    agregarSalida(texto) {
        let global = this;
        while (global.entornoAnterior !== null) {
            global = global.entornoAnterior;
        }
        global.salida.push(texto);
    }

    definirFuncion( nombre, funcionInstancia )
    {
        this.funciones.set( nombre, funcionInstancia );
    }

    obtenerFuncion( nombre ){
        if ( this.funciones.has( nombre ) ) {
            return this.funciones.get( nombre );
        }

        if ( this.entornoAnterior !== null ) {
            return this.entornoAnterior.obtenerFuncion( nombre );
        }

        throw new Error(`Función '${nombre}' no declarada`);
    }

    existeFuncion( nombre ){
        if ( this.funciones.has( nombre ) ) {
            return true;
        }

        if ( this.entornoAnterior !== null ) {
            return this.entornoAnterior.existeFuncion( nombre );
        }

        return false;

    }}

module.exports = Entorno;