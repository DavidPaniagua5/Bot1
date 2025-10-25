ace.define("ace/mode/custom_highlight_rules", function(require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var CustomHighlightRules = function() {
        this.$rules = {
            "start": [
                // 1. COMENTARIO MULTILÍNEA (/* ... */)
                {
                    token: "comment.block",
                    regex: "/\\*",
                    next: "comment_multi" // Transiciona al estado de comentario multilínea
                },
                // 2. COMENTARIO DE LÍNEA ÚNICA (//)
                {
                    token: "comment.line",
                    regex: "//.*$"
                },
                // 3. PALABRAS CLAVE: Control de Flujo (if, while, for, etc.)
                {
                    token: "keyword.control",
                    regex: "\\b(si|de lo contrario|mientras|para|hacer|hasta que|detener|continuar|retornar|ejecutar|while)\\b"
                },
                // 4. PALABRAS CLAVE: Tipos de Almacenamiento/Datos (entero, cadena, objeto)
                {
                    token: "storage.type",
                    regex: "\\b(entero|decimal|caracter|cadena|char|objeto)\\b"
                },
                // 5. PALABRAS CLAVE: Funciones/Procedimientos y Métodos Integrados
                {
                    token: "support.function",
                    regex: "\\b(imprimir|imprimir nl|tolower|toupper|procedimiento|funcion|ingresar objeto)\\b"
                },
                // 6. PALABRAS CLAVE: Otras (modificadores, declaraciones)
                {
                    token: "keyword.other",
                    regex: "\\b(con valor|con metodo)\\b"
                },
                // 7. CONSTANTES DE LENGUAJE/Propiedades especiales
                {
                    token: "constant.language",
                    regex: "(-[a-zA-Z0-9_]+=)"
                },
                // 8. CADENAS
                {
                    token: "string",
                    regex: '".*?"'
                },
                // 9. NÚMEROS
                {
                    token: "constant.numeric",
                    regex: "[0-9]+"
                },
                // 10. ESPACIOS
                {
                    token: "text",
                    regex: "\\s+"
                }
            ],
            // Definición del estado para el comentario multilínea
            "comment_multi": [
                {
                    token: "comment.block",
                    regex: "\\*/", // Regresa al estado 'start' cuando encuentra '*/'
                    next: "start"
                },
                {
                    defaultToken: "comment.block" // Todo lo demás es parte del comentario
                }
            ]
        };
    };

    oop.inherits(CustomHighlightRules, TextHighlightRules);
    exports.CustomHighlightRules = CustomHighlightRules;
});

// Definición del Modo de Lenguaje (sin cambios necesarios aquí)
ace.define("ace/mode/custom", function(require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var CustomHighlightRules = require("./custom_highlight_rules").CustomHighlightRules;

    var Mode = function() {
        this.HighlightRules = CustomHighlightRules;
        this.$behaviour = this.$defaultBehaviour;
    };

    oop.inherits(Mode, TextMode);
    
    (function() {
        this.type = "text";
        // Aquí puedes agregar métodos adicionales si fuera necesario
    }).call(Mode.prototype);

    exports.Mode = Mode;
});