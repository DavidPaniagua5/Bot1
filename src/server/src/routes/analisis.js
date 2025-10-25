const express = require('express');
const AnalizadorCompleto = require('../analizador/analizadorCompleto');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const RutaAst = 'C:\\Users\\HP\\Desktop\\ANDRES\\2025\\S2\\Compi\\Lab\\OLC1_Proyecto2_202004777\\src\\server\\src\\analizador'

let analizador = new AnalizadorCompleto();

router.post('/interpretar', (req, res) => {
    try {
        const { codigo } = req.body;
        
        if (!codigo) {
            return res.json({
                exito: false,
                salida: ['Error: No se proporcionó código para analizar']
            });
        }

        // Ejecutar el código completo usando el analizador
        const resultado = analizador.analizarYEjecutar(codigo);
        
        if (resultado.exito) {
            const fileName = "ast.dot"
            const fullPath = path.join(RutaAst, fileName);

        fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
            console.error('Error al intentar leer el archivo:', fullPath, err.message);

        }
            // Enviar la estructura que espera el frontend
            res.json({
                exito: true,
                salida: resultado.salida || [],
                ast: data
            });
            });
        }else {
            // En caso de error, retornar el mensaje de error
            res.json({
                exito: false,
                salida: [resultado.error || 'Error desconocido']
            });
        }
    } catch (error) {
        res.json({
            exito: false,
            salida: [error.message]
        });
    }
});

module.exports = router;