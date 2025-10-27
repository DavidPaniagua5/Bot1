class Entorno {
    constructor(entornoAnterior = null) {
        this.variables = new Map();
        this.entornoAnterior = entornoAnterior;
        this.salida = []; // Se inicializa en el entorno global y se comparte implícitamente
        this.funciones = new Map();
    }

    definir(nombre, simbolo) { // Acepta el ID y el objeto Simbolo
            if (this.variables.has(nombre)) {
                throw new Error(`Error Semántico: La variable '${nombre}' ya ha sido declarada en este ámbito.`);
            }
            this.variables.set(nombre, simbolo);
        }
    asignar(nombre, nuevoResultado) {
    let entornoActual = this;
    while (entornoActual !== null) {
        if (entornoActual.variables.has(nombre)) {
            const simbolo = entornoActual.variables.get(nombre);

            if (simbolo.tipo !== nuevoResultado.tipo) {
                throw new Error(`Error Semántico: No se puede asignar un valor tipo ${nuevoResultado.tipo} a la variable '${nombre}' tipo ${simbolo.tipo}.`);
            }

            simbolo.valor = nuevoResultado.valor;
            return;
        }
        entornoActual = entornoActual.entornoAnterior;
    }

    throw new Error(`Variable '${nombre}' no declarada`);
}

    // Obtiene el objeto Simbolo completo
obtenerSimbolo(nombre) { 
    if (this.variables.has(nombre)) {
        return this.variables.get(nombre);
    }

    if (this.entornoAnterior !== null) {
        return this.entornoAnterior.obtenerSimbolo(nombre);
    }

    throw new Error(`Variable '${nombre}' no declarada`);
}

    obtener(nombre) {
        const simbolo = this.obtenerSimbolo(nombre);
        return simbolo.valor;
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
        return new Map(this.variables);
    }

    crearEntornoHijo() {
        const entornoHijo = new Entorno(this);
        return entornoHijo;
    }

    // Esto busca el entorno global y agrega la salida ahí
agregarSalida(texto) {
        // Si NO tengo un entorno anterior, soy el Entorno Global.
        if (this.entornoAnterior === null) { 
            this.salida.push(texto);
            return;
        }
        
        // Si tengo un padre, delego la tarea hacia arriba.
        this.entornoAnterior.agregarSalida(texto);
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