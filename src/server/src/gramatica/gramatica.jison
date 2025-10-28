/* Definición del bloque léxico */
%lex

%%
/* Comentarios */
"//".* /* ignorar comentario de línea */
"/*"(.|\n|\r)*?"*/" /* ignorar comentario multilínea */
/* Palabras Reservadas */
"entero" return 'r_entero';
"decimal" return 'r_decimal';
"booleano" return 'r_booleano';
"caracter" return 'r_caracter';
"cadena" return 'r_cadena';
"imprimir" return 'r_imprimir';
"con" return 'r_con';
"valor" return 'r_valor';
"nl" return 'r_nl';
"si" return 'r_si';
"sino" return 'r_sino';
"mientras" return 'r_mientras';
"para" return 'r_para';
"funcion" return 'r_funcion';
"retornar" return 'r_retornar';
"romper" return 'r_romper';
"continuar" return 'r_continuar';
/* Literales Booleanos */
"Verdadero" return 'r_verdadero';
"Falso" return 'r_falso';



/* Operadores de Asignación y Unarios */
"++" return 'incremento';
"--" return 'decremento';

/* Operadores Aritméticos */
"+" return 'mas';
"-" return 'menos';
"*" return 'multiplicacion';
"/" return 'division';
"%" return 'modulo';
"^" return 'potencia';

/* Operadores Relacionales */
"==" return 'igual_igual';
"!=" return 'diferente';
"<=" return 'menor_igual';
">=" return 'mayor_igual';
"<" return 'menor';
">" return 'mayor';

/* Operadores Lógicos */
"&&" return 'and';
"||" return 'or';
"!" return 'not';
"=" return 'asignacion';

/* Símbolos */
";" return 'punto_coma';
"(" return 'paren_izq';
")" return 'paren_der';
"{" return 'llave_izq';
"}" return 'llave_der';
"," return 'coma';
/* Operador Ternario */ 
"?" return 'interrogacion';
":" return 'dos_puntos';
/* Literales */
[0-9]+(\.[0-9]+)? return 'numero';
\'([^'\\]|\\n|\\t|\\\"|\\\'|\\\\)\' return 'caracter_literal';
\"([^"\\]|\\.)*\" return 'cadena_literal';
/* Identificadores */
[a-zA-Z_][a-zA-Z0-9_]* return 'identificador';
/* Espacios en blanco */
[ \t\r]+ /* ignorar */
\n /* ignorar (Jison maneja líneas) */
<<EOF>> return 'EOF';
/* Error léxico */
. {
    // Registrar el error pero NO detener el análisis
    if (yy && yy.gestorErrores) {
        yy.gestorErrores.agregarLexico(
            "Carácter no reconocido: '" + yytext + "'",
            yylineno + 1,
            yylloc ? yylloc.first_column + 1 : 0
        );
    } else {
        if (!yy.listaErrores) yy.listaErrores = [];
        const ErrorL = require('../Errores/ErrorL');
        yy.listaErrores.push(new ErrorL(
            'Léxico',
            "Carácter no reconocido: '" + yytext + "'",
            yylineno + 1,
            yylloc ? yylloc.first_column + 1 : 0
        ));
    }
}
/lex
%{
    const Nodo = require('../analizador_semantico/abstract/nodo');
    const ErrorL = require('../Errores/ErrorL');
   
    function inicializarErrores(yy) {
        if (!yy.listaErrores) {
            yy.listaErrores = [];
        }
    }
   
    function registrarErrorSintactico(yy, mensaje, linea, columna) {
        if (yy && yy.gestorErrores) {
            yy.gestorErrores.agregarSintactico(mensaje, linea, columna);
        } else {
            if (!yy.listaErrores) yy.listaErrores = [];
            yy.listaErrores.push(new ErrorL('Sintáctico', mensaje, linea, columna));
        }
    }
%}
/* Precedencia de operadores */
%right 'asignacion'
%left 'or'
%left 'and'
%right 'not'
%left 'igual_igual' 'diferente'
%left 'menor' 'mayor' 'menor_igual' 'mayor_igual'
%left 'mas' 'menos'
%left 'multiplicacion' 'division' 'modulo'
%right 'potencia'
%right UMINUS
%left 'interrogacion' 'dos_puntos'  // Precedencia para ternario
%start INICIO
%%
INICIO
    : LISTA_SENTENCIAS EOF
        {
            $$ = new Nodo('PROGRAMA', null, $1, @$.first_line, @$.first_column);
            return $$;
        }
    ;
// =======================
// LISTA DE SENTENCIAS
// =======================
LISTA_SENTENCIAS
    : LISTA_SENTENCIAS SENTENCIA
        { $1.push($2); $$ = $1; }
    | SENTENCIA
        { $$ = [$1]; }
    ;
SENTENCIA
    : DECLARACION { $$ = $1; }
    | ASIGNACION { $$ = $1; }
    | SENTENCIA_INCREMENTO_DECREMENTO { $$ = $1; }
    | IMPRIMIR { $$ = $1; }
    | CONTROL_FLUJO { $$ = $1; }
    | FUNCION_DEFINICION { $$ = $1; }
    ;
// =======================
// TIPOS Y DECLARACIÓN
// =======================
TIPO
    : r_entero { $$ = { tipo: 'entero', valor: $1 }; }
    | r_decimal { $$ = { tipo: 'decimal', valor: $1 }; }
    | r_booleano { $$ = { tipo: 'booleano', valor: $1 }; }
    | r_caracter { $$ = { tipo: 'caracter', valor: $1 }; }
    | r_cadena { $$ = { tipo: 'cadena', valor: $1 }; }
    ;
DECLARACION
    : TIPO identificador r_con r_valor EXPRESION punto_coma
        {
            $$ = new Nodo('DECLARACION', $1.tipo, [
                new Nodo('IDENTIFICADOR', $2, [], @2.first_line, @2.first_column),
                $5
            ], @1.first_line, @1.first_column);
        }
    ;
// =======================
// ASIGNACIÓN E INC/DEC
// =======================
ASIGNACION
    : identificador asignacion EXPRESION punto_coma
        {
            $$ = new Nodo('ASIGNACION', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column),
                $3
            ], @2.first_line, @2.first_column);
        }
    ;
SENTENCIA_INCREMENTO_DECREMENTO
    : identificador incremento punto_coma
        {
            $$ = new Nodo('INCREMENTO', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column)
            ], @2.first_line, @2.first_column);
        }
    | identificador decremento punto_coma
        {
            $$ = new Nodo('DECREMENTO', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column)
            ], @2.first_line, @2.first_column);
        }
    ;
// =======================
// IMPRIMIR
// =======================
IMPRIMIR
    : r_imprimir r_nl EXPRESION punto_coma
        { $$ = new Nodo('IMPRIMIR', 'nl', [$3], @1.first_line, @1.first_column); }
    | r_imprimir EXPRESION punto_coma
        { $$ = new Nodo('IMPRIMIR', 'sin_nl', [$2], @1.first_line, @1.first_column); }
    ;
// =======================
// EXPRESIONES (JERÁRQUICAS)
// =======================
EXPRESION
    : TERNARIO { $$ = $1; }  // Cambiado para usar TERNARIO como nivel superior
    ;
TERNARIO
    : EXP_LOGICA interrogacion EXPRESION dos_puntos EXPRESION
        { $$ = new Nodo('TERNARIO', null, [$1, $3, $5], @2.first_line, @2.first_column); }
    | EXP_LOGICA
        { $$ = $1; }
    ;
EXP_LOGICA
    : EXP_LOGICA or EXP_LOGICA_AND
        { $$ = new Nodo('OR', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_LOGICA_AND
        { $$ = $1; }
    ;
EXP_LOGICA_AND
    : EXP_LOGICA_AND and EXP_IGUALDAD
        { $$ = new Nodo('AND', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_IGUALDAD
        { $$ = $1; }
    ;
EXP_IGUALDAD
    : EXP_IGUALDAD igual_igual EXP_RELACIONAL
        { $$ = new Nodo('IGUAL', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_IGUALDAD diferente EXP_RELACIONAL
        { $$ = new Nodo('DIFERENTE', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_RELACIONAL
        { $$ = $1; }
    ;
EXP_RELACIONAL
    : EXP_RELACIONAL menor EXP_SUMA
        { $$ = new Nodo('MENOR', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_RELACIONAL mayor EXP_SUMA
        { $$ = new Nodo('MAYOR', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_RELACIONAL menor_igual EXP_SUMA
        { $$ = new Nodo('MENOR_IGUAL', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_RELACIONAL mayor_igual EXP_SUMA
        { $$ = new Nodo('MAYOR_IGUAL', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_SUMA
        { $$ = $1; }
    ;
EXP_SUMA
    : EXP_SUMA mas EXP_MULT
        { $$ = new Nodo('MAS', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_SUMA menos EXP_MULT
        { $$ = new Nodo('MENOS', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_MULT
        { $$ = $1; }
    ;
EXP_MULT
    : EXP_MULT multiplicacion EXP_POTENCIA
        { $$ = new Nodo('MULTIPLICACION', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_MULT division EXP_POTENCIA
        { $$ = new Nodo('DIVISION', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_MULT modulo EXP_POTENCIA
        { $$ = new Nodo('MODULO', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXP_POTENCIA
        { $$ = $1; }
    ;
EXP_POTENCIA
    : FACTOR potencia EXP_POTENCIA
        { $$ = new Nodo('POTENCIA', null, [$1, $3], @2.first_line, @2.first_column); }
    | FACTOR
        { $$ = $1; }
    ;
FACTOR
    : menos FACTOR %prec UMINUS
        { $$ = new Nodo('MENOS_UNARIO', null, [$2], @1.first_line, @1.first_column); }
    | not FACTOR
        { $$ = new Nodo('NOT', null, [$2], @1.first_line, @1.first_column); }
    | paren_izq EXPRESION paren_der
        { $$ = $2; }
    | paren_izq TIPO paren_der FACTOR
        { $$ = new Nodo('CASTEO', $2.tipo, [$4], @1.first_line, @1.first_column); }
    | LLAMADA_FUNCION
        { $$ = $1; }
    | identificador
        { $$ = new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column); }
    | numero
        {
            const esDecimal = $1.includes('.');
            const tipo = esDecimal ? 'decimal' : 'entero';
            const valor = esDecimal ? parseFloat($1) : parseInt($1);
            $$ = new Nodo('NUMERO', valor, [], @1.first_line, @1.first_column, tipo);
        }
    | cadena_literal
        { $$ = new Nodo('CADENA', $1.slice(1, -1), [], @1.first_line, @1.first_column); }
    | caracter_literal
        { $$ = new Nodo('CARACTER', $1.slice(1, -1), [], @1.first_line, @1.first_column); }
    | r_verdadero
        { $$ = new Nodo('BOOLEANO', true, [], @1.first_line, @1.first_column); }
    | r_falso
        { $$ = new Nodo('BOOLEANO', false, [], @1.first_line, @1.first_column); }
    ;
// =======================
// ESTRUCTURAS DE CONTROL
// =======================
BLOQUE
    : llave_izq LISTA_SENTENCIAS llave_der
        { $$ = new Nodo('BLOQUE', null, $2, @1.first_line, @1.first_column); }
    | llave_izq llave_der
        { $$ = new Nodo('BLOQUE', null, [], @1.first_line, @1.first_column); }
    ;
CONTROL_FLUJO
    : SENTENCIA_IF { $$ = $1; }
    | SENTENCIA_WHILE { $$ = $1; }
    | SENTENCIA_FOR { $$ = $1; }
    | r_romper punto_coma
        { $$ = new Nodo('ROMPER', null, [], @1.first_line, @1.first_column); }
    | r_continuar punto_coma
        { $$ = new Nodo('CONTINUAR', null, [], @1.first_line, @1.first_column); }
    | SENTENCIA_RETORNO { $$ = $1; }
    ;
SENTENCIA_IF
    : r_si paren_izq EXPRESION paren_der BLOQUE r_sino SENTENCIA_IF
        { $$ = new Nodo('IF_ELSE', null, [$3, $5, $7], @1.first_line, @1.first_column); }
    | r_si paren_izq EXPRESION paren_der BLOQUE r_sino BLOQUE
        { $$ = new Nodo('IF_ELSE', null, [$3, $5, $7], @1.first_line, @1.first_column); }
    | r_si paren_izq EXPRESION paren_der BLOQUE
        { $$ = new Nodo('IF', null, [$3, $5], @1.first_line, @1.first_column); }
    ;
SENTENCIA_WHILE
    : r_mientras paren_izq EXPRESION paren_der BLOQUE
        { $$ = new Nodo('WHILE', null, [$3, $5], @1.first_line, @1.first_column); }
    ;
SENTENCIA_FOR
    : r_para paren_izq DECLARACION_FOR punto_coma EXPRESION punto_coma ASIGNACION_FOR paren_der BLOQUE
        { $$ = new Nodo('FOR', null, [$3, $5, $7, $9], @1.first_line, @1.first_column); }
    ;
DECLARACION_FOR
    : TIPO identificador asignacion EXPRESION
        {
            $$ = new Nodo('DECLARACION', $1.tipo, [
                new Nodo('IDENTIFICADOR', $2, [], @2.first_line, @2.first_column),
                $4
            ], @1.first_line, @1.first_column);
        }
    ;
ASIGNACION_FOR
    : identificador asignacion EXPRESION
        {
            $$ = new Nodo('ASIGNACION_INLINE', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column),
                $3
            ], @1.first_line, @1.first_column);
        }
    | identificador incremento
        {
            $$ = new Nodo('INCREMENTO_INLINE', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column)
            ], @1.first_line, @1.first_column);
        }
    | identificador decremento
        {
            $$ = new Nodo('DECREMENTO_INLINE', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column)
            ], @1.first_line, @1.first_column);
        }
    ;
// =======================
// FUNCIONES
// =======================
FUNCION_DEFINICION
    : r_funcion identificador paren_izq LISTA_PARAMETROS paren_der BLOQUE
        { $$ = new Nodo('FUNCION_DEFINICION', $2, [$4, $6], @1.first_line, @1.first_column); }
    | r_funcion identificador paren_izq paren_der BLOQUE
        { $$ = new Nodo('FUNCION_DEFINICION', $2, [new Nodo('LISTA_PARAMETROS', null, [], @3.first_line, @3.first_column), $5], @1.first_line, @1.first_column); }
    ;
LISTA_PARAMETROS
    : LISTA_PARAMETROS coma PARAMETRO
        { $1.hijos.push($3); $$ = $1; }
    | PARAMETRO
        { $$ = new Nodo('LISTA_PARAMETROS', null, [$1], @1.first_line, @1.first_column); }
    ;
PARAMETRO
    : TIPO identificador
        { $$ = new Nodo('PARAMETRO', $1.tipo, [new Nodo('IDENTIFICADOR', $2, [], @2.first_line, @2.first_column)], @1.first_line, @1.first_column); }
    ;
LLAMADA_FUNCION
    : identificador paren_izq LISTA_EXPRESIONES paren_der
        { $$ = new Nodo('LLAMADA', $1, $3.hijos, @1.first_line, @1.first_column); }
    | identificador paren_izq paren_der
        { $$ = new Nodo('LLAMADA', $1, [], @1.first_line, @1.first_column); }
    ;
LISTA_EXPRESIONES
    : LISTA_EXPRESIONES coma EXPRESION
        { $1.hijos.push($3); $$ = $1; }
    | EXPRESION
        { $$ = new Nodo('LISTA_EXPRESIONES', null, [$1], @1.first_line, @1.first_column); }
    ;
SENTENCIA_RETORNO
    : r_retornar EXPRESION punto_coma
        { $$ = new Nodo('RETORNO', null, [$2], @1.first_line, @1.first_column); }
    | r_retornar punto_coma
        { $$ = new Nodo('RETORNO', null, [], @1.first_line, @1.first_column); }
    ;