// src/analizador_semantico/interprete.js
const Entorno = require('./entorno');

class Interprete {
    constructor(gestorErrores) {
        this.gestorErrores = gestorErrores;
        this.entornoGlobal = new Entorno();
    }

    interpretar(programa) {
        try {
            console.log('=== INICIANDO INTERPRETACIÓN ===');

            if (programa && programa.hijos) {
                for (const instruccion of programa.hijos) {
                    try {
                        instruccion.ejecutar(this.entornoGlobal);
                    } catch (error) {
                        this.gestorErrores.agregarSemantico(
                            error.message,
                            instruccion.linea || 0,
                            instruccion.columna || 0
                        );
                    }
                }
            }

            // ASIGNAR AL FINAL
            const salidaFinal = this.entornoGlobal.salida;
            const variablesFinales = this.entornoGlobal.getVariables();

            console.log('Salida capturada:', salidaFinal);
            console.log('Variables:', variablesFinales);

            return {
                exito: !this.gestorErrores.hayErrores(),
                resultado: null,
                salida: salidaFinal,
                variables: variablesFinales,
                errores: this.gestorErrores.generarReporte()
            };

        } catch (error) {
            const salidaFinal = this.entornoGlobal.salida;
            const variablesFinales = this.entornoGlobal.getVariables();

            this.gestorErrores.agregarSemantico(error.message, 0, 0);
            return {
                exito: false,
                resultado: null,
                salida: salidaFinal,
                variables: variablesFinales,
                errores: this.gestorErrores.generarReporte()
            };
        }
    }
}

module.exports = Interprete;