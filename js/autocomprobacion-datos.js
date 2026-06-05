/* ══════════════════════════════════════════════════════════════
   autocomprobacion-datos.js — Banco de autocomprobación formativa
   Preguntas de bajo riesgo (no calificables) con realimentación
   explicativa. Fundamento: práctica de recuperación / testing effect
   (Roediger y Karpicke, 2006, DOI: 10.1111/j.1467-9280.2006.01693.x).
   La realimentación de cada opción refuerza el aprendizaje tanto en
   el acierto como en el error.
   ══════════════════════════════════════════════════════════════ */
window.AUTOCHECK_DATA = [
  {
    id: 'ac-glosario',
    mount: { mode: 'after', sel: '#glosario' },
    titulo: 'Autocomprobación · Gramática de la página',
    intro: 'Comprueba lo que recuerdas del glosario. No puntúa: cada respuesta te devuelve una explicación.',
    preguntas: [
      {
        q: '¿Qué nombra el término <em>koma</em>?',
        opts: [
          { t: 'Cada viñeta o recuadro de la página.', ok: true },
          { t: 'El bocadillo donde va el diálogo.', ok: false },
          { t: 'El espacio en blanco entre viñetas.', ok: false },
        ],
        explica: 'El <em>koma</em> (コマ) es la viñeta. El bocadillo es el <em>fukidashi</em> y el espacio entre viñetas es el <em>ma</em>.'
      },
      {
        q: 'En una página de manga tradicional, ¿en qué orden se leen las viñetas?',
        opts: [
          { t: 'De derecha a izquierda y de arriba hacia abajo.', ok: true },
          { t: 'De izquierda a derecha, como un texto occidental.', ok: false },
          { t: 'En espiral desde el centro de la página.', ok: false },
        ],
        explica: 'El manga conserva el sentido de lectura japonés: dentro de cada fila se empieza por la viñeta de la derecha y se avanza hacia la izquierda, fila a fila de arriba abajo.'
      },
      {
        q: 'El <em>ma</em> (el espacio entre viñetas) en una página de manga sirve sobre todo para…',
        opts: [
          { t: 'Marcar el ritmo y el paso del tiempo entre momentos.', ok: true },
          { t: 'Separar capítulos distintos de la obra.', ok: false },
          { t: 'Rellenar la página cuando sobra hueco.', ok: false },
        ],
        explica: 'El <em>ma</em> es narrativo: su tamaño y forma sugieren cuánto tiempo o tensión transcurre entre dos viñetas. El silencio entre paneles también narra.'
      },
    ]
  },
  {
    id: 'ac-parte-i',
    mount: { mode: 'before', sel: '#parte-ii' },
    titulo: 'Autocomprobación · Marco pedagógico y mediación',
    intro: 'Repasa las ideas clave de esta parte antes de seguir.',
    preguntas: [
      {
        q: 'Llevar manga al aula "con criterio" implica, ante todo, que el docente…',
        opts: [
          { t: 'Medie la lectura: seleccione, contextualice y plantee preguntas.', ok: true },
          { t: 'Deje leer en silencio sin intervenir para no condicionar.', ok: false },
          { t: 'Sustituya por completo los textos escritos por imágenes.', ok: false },
        ],
        explica: 'La mediación es el núcleo: el valor didáctico no está solo en el material, sino en cómo se selecciona, se contextualiza y se acompaña la lectura.'
      },
      {
        q: '¿Por qué el manga puede facilitar el acceso a contenidos curriculares?',
        opts: [
          { t: 'Combina lenguaje visual y verbal, lo que apoya la comprensión (doble vía).', ok: true },
          { t: 'Porque es más fácil que cualquier texto y exige menos al alumnado.', ok: false },
          { t: 'Porque elimina la necesidad de leer.', ok: false },
        ],
        explica: 'La fuerza didáctica viene de la multimodalidad (imagen + texto), no de "rebajar" la exigencia. El manga puede ser tan complejo como cualquier obra literaria.'
      },
    ]
  },
  {
    id: 'ac-parte-ii',
    mount: { mode: 'before', sel: '#parte-iii' },
    titulo: 'Autocomprobación · Selección para primeras etapas',
    intro: 'Antes de pasar al fondo, comprueba los criterios de selección.',
    preguntas: [
      {
        q: 'Al elegir manga para Infantil o Primaria, el primer criterio debería ser…',
        opts: [
          { t: 'La adecuación del contenido a la edad y el propósito didáctico.', ok: true },
          { t: 'La popularidad o las ventas del título.', ok: false },
          { t: 'Que sea el más largo posible para que dure todo el curso.', ok: false },
        ],
        explica: 'La idoneidad (contenido, valores, complejidad) y el encaje con el objetivo de aprendizaje priman sobre la fama del título.'
      },
      {
        q: 'Un indicador de contenido sensible en una ficha sirve para…',
        opts: [
          { t: 'Que el docente decida con información antes de llevarlo al aula.', ok: true },
          { t: 'Prohibir ese título en cualquier contexto.', ok: false },
          { t: 'Recomendarlo especialmente por ser llamativo.', ok: false },
        ],
        explica: 'Los indicadores informan la decisión profesional del docente según su grupo y contexto; no son una prohibición ni una recomendación.'
      },
    ]
  },
  {
    id: 'ac-parte-iii',
    mount: { mode: 'before', sel: '#parte-iv' },
    titulo: 'Autocomprobación · El fondo y la lectura del manga',
    intro: 'Comprueba cómo se lee y se analiza una obra del fondo.',
    preguntas: [
      {
        q: '¿Qué elementos conviene observar para analizar una página de manga?',
        opts: [
          { t: 'Viñetas, bocadillos, expresiones visuales y estructura narrativa.', ok: true },
          { t: 'Únicamente el texto de los diálogos.', ok: false },
          { t: 'Solo el color de la portada.', ok: false },
        ],
        explica: 'El análisis multimodal atiende a las viñetas, los globos, los recursos visuales y la organización de la narración, no solo al texto.'
      },
      {
        q: 'Las líneas cinéticas (líneas de movimiento) en una viñeta comunican…',
        opts: [
          { t: 'Velocidad, impacto o dirección del movimiento.', ok: true },
          { t: 'El nombre del autor de la obra.', ok: false },
          { t: 'El precio del volumen.', ok: false },
        ],
        explica: 'Son un recurso del lenguaje visual del manga: transmiten dinamismo y guían la mirada dentro de la viñeta.'
      },
    ]
  },
  {
    id: 'ac-parte-iv',
    mount: { mode: 'before', sel: 'footer' },
    titulo: 'Autocomprobación · Llevar al aula (LOMLOE)',
    intro: 'Cierre: comprueba cómo encaja el manga en una situación de aprendizaje.',
    preguntas: [
      {
        q: 'Una situación de aprendizaje LOMLOE bien planteada parte sobre todo de…',
        opts: [
          { t: 'Un reto o contexto con sentido que moviliza competencias.', ok: true },
          { t: 'Una lista de contenidos para memorizar sin contexto.', ok: false },
          { t: 'Un examen final como única actividad.', ok: false },
        ],
        explica: 'Las situaciones de aprendizaje se organizan en torno a un contexto o reto significativo que activa competencias específicas, no como acumulación de contenidos.'
      },
      {
        q: 'Para que la actividad con manga sea evaluable conviene…',
        opts: [
          { t: 'Definir criterios de logro claros y conocidos por el alumnado.', ok: true },
          { t: 'Improvisar la valoración al final según la impresión general.', ok: false },
          { t: 'Evaluar solo la rapidez de lectura.', ok: false },
        ],
        explica: 'Compartir de antemano qué se espera (criterios de logro) hace la tarea transparente, orienta el trabajo y permite una evaluación coherente.'
      },
    ]
  },
];
