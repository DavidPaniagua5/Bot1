import React, { useEffect } from 'react';
import AceEditor from 'react-ace';
import ace from 'ace-builds'; // Importar el objeto Ace

import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import './modo-lenguaje';

// Lista de palabras clave para el autocompletado
const customKeywords = [
    "entero", "con valor", "decimal", "caracter", "cadena", "char", 
    "imprimir", "si", "de lo contrario", "mientras", "para", "hacer", 
    "hasta que", "detener", "continuar", "procedimiento", "funcion", 
    "retornar", "ejecutar", "imprimir nl", "tolower", "toupper", 
    "objeto", "con metodo", "ingresar objeto", "while"
];

const Editor = ({ code, setCode }) => {
    
    // Configura y registra el completer personalizado
    useEffect(() => {
        // Define el completer
        const customWordCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                if (prefix.length === 0) {
                    callback(null, []);
                    return;
                }
                
                // Filtra y mapea las palabras clave que coinciden con lo que el usuario está escribiendo
                const completions = customKeywords
                    .filter(word => word.startsWith(prefix))
                    .map(word => ({
                        caption: word,  
                        value: word,    
                        meta: "keyword" // Muestra 'keyword' al lado de la sugerencia
                    }));

                callback(null, completions);
            }
        };

        // Registra el completer
        ace.require("ace/ext/language_tools").addCompleter(customWordCompleter);

        // Opcional: Limpia el completer si el componente se desmonta (generalmente no necesario para completers globales)
        return () => {
            // ace.require("ace/ext/language_tools").removeCompleter(customWordCompleter);
        };
    }, []); // El array vacío asegura que esto solo se ejecute una vez al montar

    return (
        <AceEditor
            mode="custom"
            theme="monokai"
            onChange={setCode}
            name="code_editor"
            editorProps={{ $blockScrolling: true }}
            value={code}
            setOptions={{
                // Habilitar autocompletado
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true, // Clave para las sugerencias en tiempo real
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 4, // El valor por defecto suele ser 4 para código
            }}
            style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}
        />
    );
};

export default Editor;