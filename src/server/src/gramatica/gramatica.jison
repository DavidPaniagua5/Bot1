
%lex

%%

\s+                     /* ignorar espacios en blanco */
"//".*                  /* comentarios de línea */
"/*"[\s\S]*?"*/"        /* comentarios de bloque */

/* Palabras reservadas */
"while"                 return 'while';
"if"                    return 'if';
"else"                  return 'else';
"imprimir"              return 'imprimir';
"nl"                    return 'nl';
"for"                   return 'for';
"function"              return 'function';

/* Operadores relacionales */
"=="                    return 'igual';
"!="                    return 'diferente';
"<="                    return 'menor_igual';
">="                    return 'mayor_igual';
"<"                     return 'menor';
">"                     return 'mayor';

/* Operadores aritméticos */
"+"                     return 'mas';
"-"                     return 'menos';
"*"                     return 'multiplicacion';
"/"                     return 'division';
"%"                     return 'modulo';

/* Operadores lógicos */
"&&"                    return 'and';
"||"                    return 'or';
"!"                     return 'not';

/* Símbolos */
"="                     return 'asignacion';
"("                     return 'paren_izq';
")"                     return 'paren_der';
"{"                     return 'llave_izq';
"}"                     return 'llave_der';
";"                     return 'punto_coma';
","                     return 'coma';

/* Literales */
[0-9]+("."[0-9]+)?      return 'numero';
\"([^\\\"]|\\.)*\"      return 'cadena';
\'([^\\\']|\\.)*\'      return 'cadena';

/* Identificadores */
[a-zA-Z_][a-zA-Z0-9_]*  return 'identificador';

/* Fin de archivo */
<<EOF>>                 return 'EOF';

/* Caracteres no reconocidos */
. {
    if (!yy.listaErrores) yy.listaErrores = [];
    yy.listaErrores.push(new ErrorL(
        'Léxico',
        "Carácter no reconocido '" + yytext + "'",
        this.yylineno + 1,
        this.yylloc ? this.yylloc.first_column + 1 : 0
    ));
}

 /lex


%{
const Nodo = require('../analizador_semantico/abstract/nodo');
const ErrorL = require('../Errores/ErrorL');

function inicializarErrores(yy) {
    yy.listaErrores = [];
}
%}


%left 'or'
%left 'and'
%left 'igual' 'diferente'
%left 'menor' 'mayor' 'menor_igual' 'mayor_igual'
%left 'mas' 'menos'
%left 'multiplicacion' 'division' 'modulo'
%right 'not' 'UMENOS'

%nonassoc 'THEN'
%nonassoc 'else'

%start INICIO


%%

INICIO
    : LISTA_SENTENCIAS EOF
        {
            inicializarErrores(yy);
            const nodoRaiz = new Nodo('PROGRAMA', null, $1, @1.first_line, @1.first_column);
            yy.ast = nodoRaiz;        // guardamos el AST
            yy.errores = yy.listaErrores || [];
            return nodoRaiz;          // devolvemos solo el nodo raíz
            if (nodo.tipo === "ERROR") {
                console.warn(`Nodo de error ignorado en línea ${nodo.linea}, columna ${nodo.columna}`);
                return;
            }

        }
        
    ;

LISTA_SENTENCIAS
    : LISTA_SENTENCIAS SENTENCIA
        { $1.push($2); $$ = $1; }
    | SENTENCIA
        { $$ = [$1]; }
    ;

SENTENCIA
    : SENTENCIA_IF              { $$ = $1; }
    | SENTENCIA_WHILE           { $$ = $1; }
    | SENTENCIA_ASIGNACION      { $$ = $1; }
    | SENTENCIA_IMPRIMIR        { $$ = $1; }
    | SENTENCIA_FOR             { $$ = $1; }
    | SENTENCIA_FUNCTION        { $$ = $1; }
    | SENTENCIA_LLAMADA         { $$ = $1; }
    | BLOQUE                    { $$ = $1; }
    | error punto_coma
    {
        if (!yy.listaErrores) yy.listaErrores = [];
        yy.listaErrores.push(new ErrorL(
            'Sintáctico',
            'Error de sintaxis cerca de punto y coma',
            @1.first_line,
            @1.first_column
        ));
        $$ = new Nodo('ERROR', null, [], @1.first_line, @1.first_column);
        yy.recovered = true;
        }

    ;

SENTENCIA_IF
    : if paren_izq EXPRESION paren_der SENTENCIA %prec THEN
        { $$ = new Nodo('IF', null, [$3, $5], @1.first_line, @1.first_column); }
    | if paren_izq EXPRESION paren_der SENTENCIA else SENTENCIA
        { $$ = new Nodo('IF_ELSE', null, [$3, $5, $7], @1.first_line, @1.first_column); }
    ;

SENTENCIA_WHILE
    : while paren_izq EXPRESION paren_der SENTENCIA
        { $$ = new Nodo('WHILE', null, [$3, $5], @1.first_line, @1.first_column); }
    ;

SENTENCIA_ASIGNACION
    : identificador asignacion EXPRESION punto_coma
        {
            $$ = new Nodo('ASIGNACION', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column),
                $3
            ], @1.first_line, @1.first_column);
        }
    ;

SENTENCIA_IMPRIMIR
    : imprimir LISTA_EXPRESIONES punto_coma
        { $$ = new Nodo('IMPRIMIR', { salto: false }, $2, @1.first_line, @1.first_column); }
    | imprimir nl LISTA_EXPRESIONES punto_coma
        { $$ = new Nodo('IMPRIMIR', { salto: true }, $3, @1.first_line, @1.first_column); }
    ;


BLOQUE
    : llave_izq LISTA_SENTENCIAS llave_der
        { $$ = new Nodo('BLOQUE', null, $2, @1.first_line, @1.first_column); }
    | llave_izq llave_der
        { $$ = new Nodo('BLOQUE', null, [], @1.first_line, @1.first_column); }
    ;

LISTA_EXPRESIONES
    : LISTA_EXPRESIONES coma EXPRESION
        { $1.push($3); $$ = $1; }
    | EXPRESION
        { $$ = [$1]; }
    ;

EXPRESION
    : EXPRESION_LOGICA
        { $$ = $1; }
    ;

EXPRESION_LOGICA
    : EXPRESION_LOGICA or EXPRESION_RELACIONAL
        { $$ = new Nodo('OR', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_LOGICA and EXPRESION_RELACIONAL
        { $$ = new Nodo('AND', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_RELACIONAL
        { $$ = $1; }
    ;

EXPRESION_RELACIONAL
    : EXPRESION_ARITMETICA igual EXPRESION_ARITMETICA
        { $$ = new Nodo('IGUAL', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_ARITMETICA diferente EXPRESION_ARITMETICA
        { $$ = new Nodo('DIFERENTE', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_ARITMETICA menor EXPRESION_ARITMETICA
        { $$ = new Nodo('MENOR', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_ARITMETICA mayor EXPRESION_ARITMETICA
        { $$ = new Nodo('MAYOR', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_ARITMETICA menor_igual EXPRESION_ARITMETICA
        { $$ = new Nodo('MENOR_IGUAL', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_ARITMETICA mayor_igual EXPRESION_ARITMETICA
        { $$ = new Nodo('MAYOR_IGUAL', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_ARITMETICA
        { $$ = $1; }
    ;

EXPRESION_ARITMETICA
    : EXPRESION_ARITMETICA mas TERMINO
        { $$ = new Nodo('MAS', null, [$1, $3], @2.first_line, @2.first_column); }
    | EXPRESION_ARITMETICA menos TERMINO
        { $$ = new Nodo('MENOS', null, [$1, $3], @2.first_line, @2.first_column); }
    | TERMINO
        { $$ = $1; }
    ;

TERMINO
    : TERMINO multiplicacion FACTOR
        { $$ = new Nodo('MULTIPLICACION', null, [$1, $3], @2.first_line, @2.first_column); }
    | TERMINO division FACTOR
        { $$ = new Nodo('DIVISION', null, [$1, $3], @2.first_line, @2.first_column); }
    | TERMINO modulo FACTOR
        { $$ = new Nodo('MODULO', null, [$1, $3], @2.first_line, @2.first_column); }
    | FACTOR
        { $$ = $1; }
    ;

FACTOR
    : menos FACTOR %prec UMENOS
        { $$ = new Nodo('MENOS_UNARIO', null, [$2], @1.first_line, @1.first_column); }
    | not FACTOR
        { $$ = new Nodo('NOT', null, [$2], @1.first_line, @1.first_column); }
    | paren_izq EXPRESION paren_der
        { $$ = $2; }
    | numero
        { $$ = new Nodo('NUMERO', Number($1), [], @1.first_line, @1.first_column); }
    | cadena
        { $$ = new Nodo('CADENA', $1.substring(1, $1.length - 1), [], @1.first_line, @1.first_column); }
    | identificador
        { $$ = new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column); }
    ;

SENTENCIA_FOR
    : for paren_izq OPT_INICIAL punto_coma OPT_CONDICION punto_coma OPT_INCREMENTO paren_der SENTENCIA
        { $$ = new Nodo('FOR', null, [$3, $5, $7, $9], @1.first_line, @1.first_column); }
    ;

OPT_INICIAL
    : SENTENCIA_ASIGNACION_SIN_PUNTO_COMA { $$ = $1; }
    | /* vacío */ { $$ = null; }
    ;

OPT_CONDICION
    : EXPRESION { $$ = $1; }
    | /* vacío */ { $$ = null; }
    ;

OPT_INCREMENTO
    : SENTENCIA_ASIGNACION_SIN_PUNTO_COMA { $$ = $1; }
    | /* vacío */ { $$ = null; }
    ;

SENTENCIA_ASIGNACION_SIN_PUNTO_COMA
    : identificador asignacion EXPRESION
        {
            $$ = new Nodo('ASIGNACION', null, [
                new Nodo('IDENTIFICADOR', $1, [], @1.first_line, @1.first_column),
                $3
            ], @1.first_line, @1.first_column);
        }
    ;

SENTENCIA_FUNCTION
    : function identificador paren_izq paren_der BLOQUE
        { $$ = new Nodo('FUNCTION', $2, [$5], @1.first_line, @1.first_column); }
    ;

SENTENCIA_LLAMADA
    : identificador paren_izq paren_der punto_coma
        { $$ = new Nodo('LLAMADA', $1, [], @1.first_line, @1.first_column); }
    ;
