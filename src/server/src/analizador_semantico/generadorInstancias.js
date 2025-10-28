
const Nodo = require('./abstract/nodo');

// Importar todas las clases de expresiones e instrucciones
const Literal = require('./expresiones/literal');
const Identificador = require('./expresiones/identificador');
const OperacionBinaria = require('./expresiones/operacionBinaria');
const OperacionUnaria = require('./expresiones/operacionUnaria');
const Declaracion = require('./instrucciones/declaracion');
const Casteo = require('./expresiones/cast');
const Incremento = require('./instrucciones/Incremento');
const Decremento = require('./instrucciones/Decremento');

const Asignacion = require('./instrucciones/asignacion');
const Bloque = require('./instrucciones/bloque');
const If = require('./instrucciones/if');
const Imprimir = require('./instrucciones/imprimir');
const While = require('./instrucciones/while');
const For = require('./instrucciones/for');
const Llamada = require('./instrucciones/llamada');
const Funcion = require('./instrucciones/funcion');

const Ternario = require('./expresiones/ternario');
/**
 * Generador de instancias que convierte un AST de nodos genéricos
 * en instancias específicas de expresiones e instrucciones
 */
class GeneradorInstancias {
    constructor() {
        this.errores = [];
    }

    // Genera las instancias específicas a partir del AST de nodos
    generar(nodo) {
        this.errores = [];
        try {
            return this.procesarNodo(nodo);
        } catch (error) {
            this.errores.push(error.message);
            throw error;
        }
    }

    procesarNodo(nodo) {
        if (!nodo || !(nodo instanceof Nodo)) {
            throw new Error(`Nodo inválido: ${nodo}`);
        }

        switch (nodo.tipo) {
            // PROGRAMA
            case 'PROGRAMA':
                return this.generarPrograma(nodo);

            // EXPRESIONES
            case 'NUMERO':
                return new Literal(nodo.valor, 'NUMERO', nodo.linea, nodo.columna);
            
            case 'CADENA':
                return new Literal(nodo.valor, 'CADENA', nodo.linea, nodo.columna);
            case 'CARACTER':
                return new Literal(nodo.valor, 'CARACTER', nodo.linea, nodo.columna);

            case 'BOOLEANO':
                return new Literal(nodo.valor, 'BOOLEANO', nodo.linea, nodo.columna);
            
            case 'IDENTIFICADOR':
                return new Identificador(nodo.valor, true, nodo.linea, nodo.columna);

            case 'CASTEO':
                return this.generarCasteo(nodo);
            case 'TERNARIO':
                return this.generarTernario(nodo);
              
            case 'INCREMENTO':
                return this.generarIncremento(nodo);

            case 'DECREMENTO':
                return this.generarDecremento(nodo);
            // OPERACIONES BINARIAS
            case 'POTENCIA':    
            case 'MAS':
            case 'MENOS':
            case 'MULTIPLICACION':
            case 'DIVISION':
            case 'MODULO':
            case 'IGUAL':
            case 'DIFERENTE':
            case 'MENOR':
            case 'MAYOR':
            case 'MENOR_IGUAL':
            case 'MAYOR_IGUAL':
            case 'AND':
            case 'OR':
                return this.generarOperacionBinaria(nodo);

            // OPERACIONES UNARIAS
            case 'MENOS_UNARIO':
            case 'NOT':
                return this.generarOperacionUnaria(nodo);

            // INSTRUCCIONES
            case 'ASIGNACION':
                return this.generarAsignacion(nodo);
            
            case 'BLOQUE':
                return this.generarBloque(nodo);
            
            case 'IF':
                return this.generarIf(nodo);
            
            case 'IF_ELSE':
                return this.generarIfElse(nodo);
            
            case 'WHILE':
                return this.generarWhile(nodo);
            
            case 'IMPRIMIR':
                return this.generarImprimir(nodo);
            case 'DECLARACION':
                return this.generarDeclaracion(nodo);
            case 'FOR':
                return this.generarFor(nodo);

            case 'FUNCTION':
                return this.generarFuncion(nodo);

            case 'LLAMADA':
                return this.generarLlamada(nodo);

            default:
                throw new Error(`Tipo de nodo no reconocido: ${nodo.tipo} en ${nodo.getPosicion()}`);
        }
    }

    generarPrograma(nodo) {
        const sentencias = nodo.hijos.map(hijo => this.procesarNodo(hijo));
        return new Bloque(sentencias, nodo.linea, nodo.columna);
    }

    generarOperacionBinaria(nodo) {
        if (nodo.hijos.length !== 2) {
            throw new Error(`Operación binaria ${nodo.tipo} debe tener exactamente 2 hijos en ${nodo.getPosicion()}`);
        }

        const izquierda = this.procesarNodo(nodo.hijos[0]);
        const derecha = this.procesarNodo(nodo.hijos[1]);
        
        return new OperacionBinaria(izquierda, nodo.tipo, derecha, nodo.linea, nodo.columna);
    }

    generarOperacionUnaria(nodo) {
        if (nodo.hijos.length !== 1) {
            throw new Error(`Operación unaria ${nodo.tipo} debe tener exactamente 1 hijo en ${nodo.getPosicion()}`);
        }

        const operando = this.procesarNodo(nodo.hijos[0]);
        const operador = nodo.tipo === 'MENOS_UNARIO' ? 'MENOS' : nodo.tipo;
        
        return new OperacionUnaria(operador, operando, nodo.linea, nodo.columna);
    }
    generarIncremento(nodo) {
    if (nodo.hijos.length !== 1) {
        throw new Error(`Incremento debe tener 1 hijo en ${nodo.getPosicion()}`);
    }
    const identificador = this.procesarNodo(nodo.hijos[0]);
    return new Incremento(identificador, nodo.linea, nodo.columna);
}

generarDecremento(nodo) {
    if (nodo.hijos.length !== 1) {
        throw new Error(`Decremento debe tener 1 hijo en ${nodo.getPosicion()}`);
    }
    const identificador = this.procesarNodo(nodo.hijos[0]);
    return new Decremento(identificador, nodo.linea, nodo.columna);
}
    generarDeclaracion(nodo) {
    if (nodo.hijos.length !== 2) {
        throw new Error(`Declaración debe tener exactamente 2 hijos en ${nodo.getPosicion()}`);
    }

    const tipo = nodo.valor; // 'entero', 'decimal', etc.
    const idNodo = nodo.hijos[0]; // Nodo IDENTIFICADOR
    const exprNodo = nodo.hijos[1]; // Expresión

    const identificador = this.procesarNodo(idNodo);
    const expresion = this.procesarNodo(exprNodo);

    return new Declaracion(tipo, identificador, expresion, nodo.linea, nodo.columna);
}


    generarAsignacion(nodo) {
        if (nodo.hijos.length !== 2) {
            throw new Error(`Asignación debe tener exactamente 2 hijos en ${nodo.getPosicion()}`);
        }

        const identificador = this.procesarNodo(nodo.hijos[0]);
        const expresion = this.procesarNodo(nodo.hijos[1]);

        identificador.acceso = false;
        
        return new Asignacion(identificador, expresion, nodo.linea, nodo.columna);
    }

    generarBloque(nodo) {
        const sentencias = nodo.hijos.map(hijo => this.procesarNodo(hijo));
        return new Bloque(sentencias, nodo.linea, nodo.columna);
    }

    generarTernario(nodo) {
    if (nodo.hijos.length !== 3) {
        throw new Error(`Operador ternario debe tener 3 hijos en ${nodo.getPosicion()}`);
    }

    const condicion = this.procesarNodo(nodo.hijos[0]);
    const verdadero = this.procesarNodo(nodo.hijos[1]);
    const falso = this.procesarNodo(nodo.hijos[2]);

    return new Ternario(condicion, verdadero, falso, nodo.linea, nodo.columna);
}

    generarIf(nodo) {
        if (nodo.hijos.length !== 2) {
            throw new Error(`IF debe tener exactamente 2 hijos en ${nodo.getPosicion()}`);
        }

        const condicion = this.procesarNodo(nodo.hijos[0]);
        const sentenciaVerdadera = this.procesarNodo(nodo.hijos[1]);
        
        return new If(condicion, sentenciaVerdadera, null, nodo.linea, nodo.columna);
    }

    generarIfElse(nodo) {
        if (nodo.hijos.length !== 3) {
            throw new Error(`IF-ELSE debe tener exactamente 3 hijos en ${nodo.getPosicion()}`);
        }

        const condicion = this.procesarNodo(nodo.hijos[0]);
        const sentenciaVerdadera = this.procesarNodo(nodo.hijos[1]);
        const sentenciaFalsa = this.procesarNodo(nodo.hijos[2]);
        
        return new If(condicion, sentenciaVerdadera, sentenciaFalsa, nodo.linea, nodo.columna);
    }

    generarWhile(nodo) {
        if (nodo.hijos.length !== 2) {
            throw new Error(`WHILE debe tener exactamente 2 hijos en ${nodo.getPosicion()}`);
        }

        const condicion = this.procesarNodo(nodo.hijos[0]);
        const sentencia = this.procesarNodo(nodo.hijos[1]);
        
        return new While(condicion, sentencia, nodo.linea, nodo.columna);
    }

    generarCasteo(nodo) {
    if (nodo.hijos.length !== 1) {
        throw new Error(`Casteo debe tener exactamente 1 hijo en ${nodo.getPosicion()}`);
    }

    const tipoDestino = nodo.valor; // 'entero', 'decimal', etc.
    const expresion = this.procesarNodo(nodo.hijos[0]);

    return new Casteo(tipoDestino, expresion, nodo.linea, nodo.columna);
}

    generarImprimir(nodo) {
        const expresiones = nodo.hijos.map(hijo => this.procesarNodo(hijo));
        return new Imprimir(expresiones, nodo.linea, nodo.columna);
    }

    generarFor(nodo) {
        if (nodo.hijos.length !== 4) {
            throw new Error(`FOR debe tener exactamente 4 hijos en ${nodo.getPosicion()}`);
        }

        const init = this.procesarNodo(nodo.hijos[0]);
        const condicion = this.procesarNodo(nodo.hijos[1]);
        const update = this.procesarNodo(nodo.hijos[2]);
        const sentencia = this.procesarNodo(nodo.hijos[3]);

        return new For(init, condicion, update, sentencia, nodo.linea, nodo.columna);
    }

    generarFuncion(nodo) {
        const cuerpo = this.procesarNodo(nodo.hijos[0]);

        return new Funcion(nodo.valor, cuerpo, nodo.linea, nodo.columna);
    }

    generarLlamada(nodo) {
        const args = nodo.hijos.slice(1).map(hijo => this.procesarNodo(hijo));
        return new Llamada(nodo.valor, nodo.linea, nodo.columna, args);
    }
    getErrores() {
        return this.errores;
    }

    limpiarErrores() {
        this.errores = [];
    }
}

module.exports = GeneradorInstancias;
    