// src/server/src/analizador/analizadorCompleto.js

const parser = require('../gramatica/gramatica');
const Interprete = require('../analizador_semantico/interprete');
const GeneradorInstancias = require('../analizador_semantico/generadorInstancias');
const GestorErrores = require('../Errores/GestorErrores');
const Nodo = require('../analizador_semantico/abstract/nodo');
const fs = require('fs');
const path = require('path');

class AnalizadorCompleto {
    constructor() {
        this.parser = parser;
        this.gestorErrores = new GestorErrores();
    }

    analizarYEjecutar(codigo) {
        try {
            console.log('Iniciando análisis y ejecución del código...');
            
            // Limpiar errores previos
            this.gestorErrores.limpiar();
            
            if (!this.parser.yy) {
                this.parser.yy = {};
            }
            
            this.parser.yy.gestorErrores = this.gestorErrores;
            
            // Fase 1: Análisis sintáctico
            const astNodos = this.parser.parse(codigo);
            console.log('AST generado correctamente');
            
            // Verificar si hubo errores léxicos/sintácticos
            const erroresLexSin = this.gestorErrores.obtenerErrores().filter(
                e => e.tipo === 'Léxico' || e.tipo === 'Sintáctico'
            );
            
            if (erroresLexSin.length > 0) {
                console.log(`Se encontraron ${erroresLexSin.length} errores léxicos/sintácticos`);
            }
            
            // Fase 2: Generación de instancias
            const generador = new GeneradorInstancias(this.gestorErrores);
            const astInstancias = generador.generar(astNodos);
            
            // Fase 3: Interpretación
            const interprete = new Interprete(this.gestorErrores);
            const resultado = interprete.interpretar(astInstancias);
            
            // Generar DOT del AST
            const dotAST = this.generarDotAST(astNodos);
            resultado.dotAST = dotAST;
            
            // Determinar éxito
            resultado.exito = !this.gestorErrores.obtenerErrores().some(
                e => e.tipo === 'Semántico'
            );
            
            console.log('=== ANÁLISIS COMPLETADO ===');
            console.log(`Total de errores: ${this.gestorErrores.obtenerErrores().length}`);
            
            return resultado;
            
        } catch (error) {
            console.error('Error crítico durante el análisis:', error.message);
            console.error('Stack:', error.stack);
            
            if (this.gestorErrores && typeof this.gestorErrores.agregarSemantico === 'function') {
                this.gestorErrores.agregarSemantico(error.message, 0, 0);
                
                return {
                    exito: false,
                    error: error.message,
                    resultado: null,
                    salida: [],
                    variables: new Map(),
                    errores: this.gestorErrores.generarReporte(),
                    dotAST: null
                };
            } else {
                return {
                    exito: false,
                    error: error.message,
                    resultado: null,
                    salida: [],
                    variables: new Map(),
                    errores: [{
                        '#': 1,
                        'Tipo': 'Sistema',
                        'Descripción': error.message,
                        'Línea': 0,
                        'Columna': 0
                    }],
                    dotAST: null
                };
            }
        }
    }

    generarDotAST(astNodos) {
        if (!astNodos) {
            return "digraph G {\n  // AST vacío\n}";
        }
        
        Nodo.reiniciarContador();
        
        let dot = "digraph G {\n";
        dot += "  node [shape=circle, fontname=\"Arial\"];\n";
        dot += "  edge [fontname=\"Arial\"];\n\n";
        
        try {
            dot += "  " + astNodos.graficar();
        } catch (error) {
            console.error('Error al generar grafo:', error.message);
            dot += "  // Error al generar el grafo\n";
        }
        
        dot += "}";
        
        try {
            const nombreArchivo = 'ast.dot';
            const rutaArchivo = path.join(__dirname, nombreArchivo);
            fs.writeFileSync(rutaArchivo, dot, 'utf8');
            console.log(`Archivo DOT guardado en: ${rutaArchivo}`);
        } catch (error) {
            console.error('Error al guardar el archivo DOT:', error.message);
        }
        
        return dot;
    }

    reiniciar() {
        this.gestorErrores.limpiar();
        if (this.parser.yy) {
            this.parser.yy.gestorErrores = this.gestorErrores;
        }
    }

    getErrores() {
        return this.gestorErrores ? this.gestorErrores.generarReporte() : [];
    }
}

module.exports = AnalizadorCompleto;