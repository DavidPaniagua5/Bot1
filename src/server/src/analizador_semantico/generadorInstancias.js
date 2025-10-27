// === IMPORTACIONES NECESARIAS ===
const TIPO_DATO = require('./simbolo/TipoDato');

// Abstractas
const Instruccion = require('./abstract/instruccion');
const Expresion = require('./abstract/expresion');

// Instrucciones
const Bloque = require('./instrucciones/Bloque');
const Declaracion = require('./instrucciones/Declaracion');
const Asignacion = require('./instrucciones/Asignacion');
const Imprimir = require('./instrucciones/Imprimir');

// Expresiones
const Literal = require('./expresiones/Literal');
const Identificador = require('./expresiones/Identificador');
const OperacionBinaria = require('./expresiones/operacionBinaria');
const OperacionUnaria = require('./expresiones/operacionUnaria'); // NUEVO
const Cast = require('./expresiones/cast'); // NUEVO
// ================================


class GeneradorInstancias {
    constructor() {
        // ... puede haber otras propiedades
    }

    /**
     * Método auxiliar para mapear el string del tipo de la gramática 
     * al enum TIPO_DATO que usan las clases semánticas.
     */
    mapTipoDato(tipoString) {
        if (!tipoString) return TIPO_DATO.NULO;
        switch (tipoString.toLowerCase()) {
            case 'entero': return TIPO_DATO.ENTERO;
            case 'decimal': return TIPO_DATO.DECIMAL;
            case 'booleano': return TIPO_DATO.BOOLEANO;
            case 'caracter': return TIPO_DATO.CARACTER;
            case 'cadena': return TIPO_DATO.CADENA;
            case 'verdadero': return TIPO_DATO.BOOLEANO; // Para los literales
            case 'falso': return TIPO_DATO.BOOLEANO; // Para los literales
            default: return TIPO_DATO.NULO;
        }
    }

    generar(ast) {
        return this.procesarNodo(ast);
    }

    procesarNodo(nodo) {
        if (!nodo || !nodo.tipo) {
            throw new Error(`Tipo de nodo no reconocido o nulo.`);
        }

        switch (nodo.tipo) {
            // === PROGRAMA / BLOQUE ===
            case 'PROGRAMA':
            case 'BLOQUE':
                return this.generarBloque(nodo);

            // === DECLARACIONES E INSTRUCCIONES ===
            case 'DECLARACION_ASIGNACION':
            case 'DECLARACION':
                return this.generarDeclaracion(nodo);

            case 'ASIGNACION':
                return this.generarAsignacion(nodo);
                
            case 'IMPRIMIR':
                return this.generarImprimir(nodo);

            // === EXPRESIONES UNARIAS Y CASTEO ===
            case 'OPERACION_UNARIA': // Maneja el operador '!' (NOT)
                return new OperacionUnaria(
                    nodo.operador, // Debe ser 'NOT' o 'MENOS_UNARIO'
                    this.procesarNodo(nodo.operando),
                    nodo.linea,
                    nodo.columna
                );
            
            case 'CASTEO_EXPLICITO': // Maneja (tipo) expresion
                return new Cast(
                    this.mapTipoDato(nodo.tipo_destino), // Obtiene TIPO_DATO.CADENA, etc.
                    this.procesarNodo(nodo.expresion),
                    nodo.linea,
                    nodo.columna
                );

            // === EXPRESIONES BINARIAS ===
            case 'MAS':
            case 'MENOS':
            case 'MULTIPLICACION':
            case 'DIVISION':
            case 'MODULO':
            case 'POTENCIA': // NUEVO, si el parser lo genera separado
            case 'IGUAL_IGUAL':
            case 'DIFERENTE':
            case 'MENOR_QUE':
            case 'MAYOR_QUE':
            case 'MENOR_IGUAL':
            case 'MAYOR_IGUAL':
            case 'AND':
            case 'OR':
                return this.generarOperacionBinaria(nodo);

            // === EXPRESIONES SIMPLES (LITERALES) ===
            case 'NUMERO':
                // Nota: Literal.js debe manejar si es entero o decimal
                return new Literal(nodo.valor, 'NUMERO', nodo.linea, nodo.columna);
                
            case 'CADENA_LITERAL': 
                return new Literal(nodo.valor, 'CADENA', nodo.linea, nodo.columna);
                
            case 'CARACTER_LITERAL': 
                return new Literal(nodo.valor, 'CARACTER', nodo.linea, nodo.columna);
                
            case 'BOOLEANO_LITERAL': 
                return new Literal(nodo.valor, 'BOOLEANO', nodo.linea, nodo.columna);

            case 'IDENTIFICADOR':
                // Se asume que el AST tiene una propiedad 'acceso' si se usa en la izq de asignación
                const acceso = nodo.acceso !== undefined ? nodo.acceso : true;
                return new Identificador(nodo.valor, acceso, nodo.linea, nodo.columna);
            
            case 'VERDADERO':
                return new Literal(true, 'BOOLEANO', nodo.linea, nodo.columna);

            case 'FALSO':
                return new Literal(false, 'BOOLEANO', nodo.linea, nodo.columna);

            default:
                // TODO: Registrar un error semántico aquí
                throw new Error(`Tipo de nodo no reconocido: ${nodo.tipo} en línea ${nodo.linea}, columna ${nodo.columna}`);
        }
    }
    
    // === MÉTODOS DE GENERACIÓN DE INSTRUCCIONES COMPLEJAS ===

    generarBloque(nodo) {
    // CORRECCIÓN CLAVE: Verifica que nodo.instrucciones exista, si no, usa un array vacío [].
    // Si su parser usa otro nombre (ej. nodo.cuerpo), reemplace 'instrucciones' por ese nombre.
    const listaInstrucciones = nodo.instrucciones || []; 
    //const listaInstrucciones = nodo.sentencias || [];
    const instrucciones = listaInstrucciones.map(inst => this.procesarNodo(inst));
    return new Bloque(instrucciones, nodo.linea, nodo.columna);
}
    
    // Se actualiza para manejar la sintaxis "entero a con valor 10;"
    generarDeclaracion(nodo) {
        // El tipo del nodo es 'DECLARACION_ASIGNACION' o 'DECLARACION'
        
        // 1. Mapear el tipo de dato
        const tipoSemantico = this.mapTipoDato(nodo.tipo_dato); 

        // 2. Obtener el identificador (asumiendo que es un nodo hijo simple)
        const identificador = nodo.identificador.valor; // Se asume nodo.identificador es {tipo:'IDENTIFICADOR', valor: 'a'}

        // 3. Obtener la expresión de inicialización
        let expresion = null;
        if (nodo.expresion_inicial) {
            expresion = this.procesarNodo(nodo.expresion_inicial);
        }

        return new Declaracion(
            tipoSemantico, 
            identificador, 
            expresion, 
            nodo.linea, 
            nodo.columna
        );
    }

    generarAsignacion(nodo) {
        // 1. Obtener el identificador (el lado izquierdo)
        // Se asume que el parser usa una propiedad 'acceso: false' aquí para Identificador.js
        const identificador = this.procesarNodo(nodo.identificador); 
        
        // 2. Obtener la expresión (el lado derecho)
        const expresion = this.procesarNodo(nodo.expresion);

        return new Asignacion(
            identificador,
            expresion,
            nodo.linea,
            nodo.columna
        );
    }
    
    generarImprimir(nodo) {
        // Se asume que nodo.expresiones es un arreglo de nodos de expresión
        const expresiones = nodo.expresiones.map(exp => this.procesarNodo(exp));
        return new Imprimir(expresiones, nodo.linea, nodo.columna);
    }
    
    generarOperacionBinaria(nodo) {
        // Se asume que todos los nodos binarios tienen operandoIzq y operandoDer
        return new OperacionBinaria(
            this.procesarNodo(nodo.operando_izquierdo),
            nodo.tipo, // El tipo del nodo (ej: 'MAS', 'IGUAL_IGUAL') es el operador
            this.procesarNodo(nodo.operando_derecho),
            nodo.linea,
            nodo.columna
        );
    }

}

module.exports = GeneradorInstancias;