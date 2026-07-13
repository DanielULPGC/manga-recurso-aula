# AGENTS.md

## Contexto del proyecto

Este repositorio contiene una aplicación educativa PWA titulada "El manga como recurso didáctico", destinada al uso docente, bibliotecario y formativo en el ámbito universitario y escolar.

## Prioridades del proyecto

1. Mantener intacto el contenido didáctico y cultural salvo correcciones justificadas.
2. Mejorar estabilidad, accesibilidad, rendimiento, trazabilidad curricular y mantenibilidad.
3. No eliminar funciones existentes sin documentarlo.
4. No introducir dependencias externas salvo justificación técnica.
5. Toda modificación debe ser verificable mediante pruebas manuales o automáticas.

## Restricciones

- No cambiar el sentido del catálogo de obras.
- No alterar textos docentes sin marcarlo como corrección editorial.
- No usar claves de API en el frontend.
- No insertar HTML generado por IA sin sanitización.
- No romper la instalación PWA.
- No modificar el diseño visual global salvo que la tarea lo indique.

## Comandos esperados

Cuando existan scripts de validación, ejecutar desde `site/`:

```bash
node tools/build.mjs
```
