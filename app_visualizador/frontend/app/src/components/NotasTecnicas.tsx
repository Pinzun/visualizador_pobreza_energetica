// src/components/NotasTecnicas.tsx
import { useState } from "react";
import "../styles/NotasTecnicas.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Indicador {
  nombre: string;
  fuente: string;
  escala: string[];
  descripcion: string;
  metodologia: string[];
  formula: string;
  supuestos: string;
  comentarios?: string;
}

interface Dimension {
  icono: string;
  color: string;
  light: string;
  indicadores: Indicador[];
}

// ─── Datos ────────────────────────────────────────────────────────────────────

const DIMENSIONES: Record<string, Dimension> = {
  Acceso: {
    icono: "⚡",
    color: "#0d6e6e",
    light: "#e6f4f4",
    indicadores: [
      {
        nombre: "Viviendas sin acceso a electricidad",
        fuente: "Censo de Población y Vivienda 2024 – INE",
        escala: ["Nacional", "Región", "Comuna", "Área (urbana/rural)"],
        descripcion:
          "Identifica viviendas que no poseen acceso a electricidad. La electricidad es un servicio básico necesario para el desarrollo laboral, educacional, y para garantizar la salud y el bienestar de las personas.",
        metodologia: [
          'Desde el CENSO 2024, se identifica la pregunta 9: "La electricidad de esta vivienda proviene principalmente de:" (Módulo Datos de la Vivienda).',
          "Se suman respuestas: (1) No tiene energía eléctrica + (2) Fuente de energía eléctrica no declarada.",
          'Se identifica la variable "comuna" con el total de viviendas por comuna.',
        ],
        formula:
          "( N° viviendas sin electricidad / N° viviendas de la comuna ) × 100",
        supuestos:
          "Solo se consideran viviendas particulares ocupadas con moradores presentes.",
        comentarios: undefined,
      },
      {
        nombre: "Hogares sin acceso a electricidad",
        fuente: "CASEN 2022 – Ministerio de Desarrollo Social y Familia",
        escala: ["Nacional", "Región", "Área (urbana/rural)"],
        descripcion:
          "Identifica hogares que no poseen acceso a electricidad, considerando respuestas de jefes de hogar con factores de expansión.",
        metodologia: [
          'Desde CASEN 2022, se identifica la pregunta v24: "La vivienda donde Ud. vive, ¿dispone de energía eléctrica?" (Módulo Vivienda).',
          "Se suman respuestas: (1) No dispone de energía eléctrica + (2) No sabe/no responde.",
          'Se identifica la variable "región" con el total de hogares por región.',
        ],
        formula:
          "( N° hogares sin electricidad / N° hogares de la región ) × 100",
        supuestos:
          "Solo se consideran respuestas de jefes de hogar (pco1_a = 1). Se utilizan factores de expansión.",
        comentarios:
          "No se recomienda realizar estimaciones a nivel comunal (Manual del Investigador, MDSF).",
      },
      {
        nombre: "Hogares sin acceso a sistema de cocción de alimentos",
        fuente: "Censo 2024 – INE / CASEN 2022 – MDSF",
        escala: ["Nacional", "Región", "Comuna", "Área (urbana/rural)"],
        descripcion:
          "Mide el porcentaje de hogares sin acceso a un sistema adecuado para cocinar. La ausencia de tecnologías seguras y eficientes afecta la calidad de vida, la salud y la seguridad alimentaria.",
        metodologia: [
          'CENSO: Pregunta 13 "¿Cuál es la principal fuente de energía o combustible para cocinar?". Se suma: (1) No utiliza fuente de energía o combustible.',
          'CASEN: Pregunta v34a "¿Qué combustible usa habitualmente para cocinar?". Se suma: (1) No tiene sistema.',
          "Denominador: total de viviendas/hogares por comuna (CENSO) o región (CASEN).",
        ],
        formula:
          "( N° hogares sin sistema de cocción / N° hogares de la comuna o región ) × 100",
        supuestos:
          "CENSO: viviendas particulares ocupadas con moradores presentes. CASEN: jefes de hogar, con factores de expansión.",
        comentarios: "CASEN no representativo a nivel comunal.",
      },
      {
        nombre: "Hogares sin acceso a sistema de calefacción",
        fuente: "Censo 2024 – INE / CASEN 2022 – MDSF",
        escala: ["Nacional", "Región", "Comuna", "Área (urbana/rural)"],
        descripcion:
          "Identifica hogares sin tecnologías de calefacción. El acceso a calefacción es esencial para el confort térmico, impactando directamente en la salud y bienestar de las personas.",
        metodologia: [
          'CENSO: Pregunta 14 "¿Cuál es la principal fuente de energía o combustible para calefaccionar?". Se suma: (1) No utiliza fuente de energía o combustible.',
          'CASEN: Pregunta v34b "¿Qué combustible usa habitualmente para calefaccionar?". Se suma: (1) No tiene sistema.',
          "Denominador: viviendas/hogares por comuna (CENSO) o región (CASEN).",
        ],
        formula:
          "( N° hogares sin sistema de calefacción / N° hogares de la comuna o región ) × 100",
        supuestos:
          "CENSO: viviendas particulares ocupadas. CASEN: jefes de hogar, factores de expansión.",
        comentarios: "CASEN no representativo a nivel comunal.",
      },
      {
        nombre: "Hogares sin acceso a calefacción en zonas térmicas frías",
        fuente: "Censo 2024 – INE / OGUC – Decreto Supremo N°47 (MINVU)",
        escala: ["Zonas térmicas frías (D a I)"],
        descripcion:
          "En zonas térmicas frías, la ausencia de calefacción genera mayor riesgo de pobreza energética. Identifica hogares sin acceso en comunas clasificadas en zonas D, E, F, G, H e I.",
        metodologia: [
          "Se identifican las comunas pertenecientes a zonas térmicas frías (D a I) según OGUC.",
          "En comunas con más de una zona térmica se asigna la zona predominante por superficie.",
          "Se aplica la misma metodología CENSO que el indicador de calefacción general, filtrando por esas comunas.",
        ],
        formula:
          "( N° hogares sin calefacción en zonas frías / N° hogares de la comuna en zonas frías ) × 100",
        supuestos:
          "Se considera la zona térmica predominante por superficie comunal. Viviendas particulares ocupadas con moradores presentes.",
        comentarios: undefined,
      },
      {
        nombre: "Hogares sin acceso a sistema de agua caliente",
        fuente: "CASEN 2022 – Ministerio de Desarrollo Social y Familia",
        escala: ["Nacional", "Región", "Área (urbana/rural)"],
        descripcion:
          "Cuantifica hogares sin sistema funcional para el calentamiento de agua sanitaria. La falta de agua caliente representa una carencia en términos de higiene, salud y dignidad.",
        metodologia: [
          'Desde CASEN 2022, pregunta v34c: "¿Qué combustible usa habitualmente para el sistema de agua caliente?" (Módulo Vivienda).',
          "Se suma: (1) No tiene sistema.",
          "Denominador: total de hogares por región.",
        ],
        formula:
          "( N° hogares sin sistema de agua caliente / N° hogares de la región ) × 100",
        supuestos: "Jefes de hogar (pco1_a = 1). Factores de expansión.",
        comentarios: "No representativo a nivel comunal.",
      },
    ],
  },
  Calidad: {
    icono: "🔬",
    color: "#1a5276",
    light: "#eaf0f8",
    indicadores: [
      {
        nombre: "Hogares que usan fuentes contaminantes para cocinar",
        fuente: "Censo 2024 – INE / CASEN 2022 – MDSF",
        escala: ["Nacional", "Región", "Comuna", "Área (urbana/rural)"],
        descripcion:
          "Mide la proporción de hogares que utilizan parafina, carbón, leña u otros combustibles contaminantes para cocinar. Implica mayor exposición a contaminantes intradomiciliarios, afectando especialmente a mujeres, adultos mayores, NNA y personas electrodependientes.",
        metodologia: [
          "CENSO: Pregunta 13 sobre combustible para cocinar. Se suman: (1) Parafina o petróleo + (2) Leña + (3) Carbón.",
          "CASEN: Pregunta v34a. Se suman: (1) Parafina (kerosene) o petróleo + (2) Carbón, leña o derivados (pellets, astillas o briquetas).",
          "Denominador: total de hogares por comuna (CENSO) o región (CASEN).",
        ],
        formula:
          "( N° hogares con fuentes contaminantes para cocinar / N° hogares de la comuna o región ) × 100",
        supuestos:
          "CENSO: viviendas particulares ocupadas. CASEN: jefes de hogar, factores de expansión.",
        comentarios: "CASEN no representativo a nivel comunal.",
      },
      {
        nombre: "Hogares que usan fuentes contaminantes para calefacción",
        fuente: "Censo 2024 – INE / CASEN 2022 – MDSF",
        escala: ["Nacional", "Región", "Comuna", "Área (urbana/rural)"],
        descripcion:
          "Mide la proporción de hogares que usan fuentes altamente emisoras de material particulado para calefaccionar. Afecta desproporcionadamente a grupos que permanecen más tiempo en el hogar.",
        metodologia: [
          "CENSO: Pregunta 14. Se suman: (1) Gas + (2) Parafina o petróleo + (3) Leña + (4) Carbón + (5) Fuente eléctrica no declarada.",
          "CASEN: Pregunta v34b. Se suman: (1) Parafina (kerosene) o petróleo + (2) Carbón, leña o derivados.",
          "Denominador: hogares por comuna (CENSO) o región (CASEN).",
        ],
        formula:
          "( N° hogares con fuentes contaminantes para calefacción / N° hogares de la comuna o región ) × 100",
        supuestos:
          "CENSO: viviendas particulares ocupadas. CASEN: jefes de hogar, factores de expansión.",
        comentarios: "CASEN no representativo a nivel comunal.",
      },
      {
        nombre:
          "Duración promedio anual de interrupciones del servicio eléctrico (SAIDI)",
        fuente:
          "Energía Abierta – Comisión Nacional de Energía – Ministerio de Energía",
        escala: ["Nacional", "Región", "Comuna"],
        descripcion:
          "Identifica comunas con mayores niveles de interrupciones del servicio eléctrico, reflejando un acceso limitado o inestable. Se consideran interrupciones por causas internas y externas, sin aplicar umbrales normativos.",
        metodologia: [
          'Se utiliza el indicador "Calidad del Servicio – SAIDI Mensual Comunal" de la plataforma Energía Abierta.',
          "Se consideran solo interrupciones por causas internas y externas, excluyendo fuerza mayor.",
          "Por cada comuna se suman las horas de interrupción por año calendario (enero a diciembre).",
          "Se calcula el promedio anual. Resultado en horas promedio anuales por comuna.",
        ],
        formula: "Σ horas de interrupción del servicio eléctrico por mes / 12",
        supuestos: "Período considerado: enero 2020 a diciembre 2024.",
        comentarios: undefined,
      },
    ],
  },
  Habitabilidad: {
    icono: "🏠",
    color: "#6e3d0d",
    light: "#f9f0e6",
    indicadores: [
      {
        nombre: "Viviendas construidas según normativas térmicas",
        fuente: "CECT – MINVU / Censo 2024 – INE",
        escala: ["Nacional", "Región", "Comuna"],
        descripcion:
          "Estima la proporción de viviendas con posibles condiciones térmicas deficientes según año de construcción, usando permisos de edificación como variable proxy.",
        metodologia: [
          "Se identifica el número de viviendas construidas por período normativo según permisos de edificación por comuna (CECT–MINVU).",
          "Se clasifica según normativa térmica: antes 2000 (sin exigencia), 2000–2006 (Decreto 115/1999, baja), 2007–2025 (Decreto 192/2006, intermedia), desde 2025 (Decreto 15/2024, alta).",
          "Denominador: parque habitacional total por comuna según CENSO 2024.",
        ],
        formula:
          "Σ permisos de edificación del período normativo t / Parque total de viviendas según CENSO 2024",
        supuestos:
          "No hay datos directos de eficiencia térmica; se usan supuestos por año de construcción. No incluye viviendas autoconstruidas no regularizadas ni campamentos.",
        comentarios:
          "El Decreto 29 (2015) regula exigencias en zonas con PPDA, pero no se considera en este cálculo.",
      },
      {
        nombre: "Viviendas irrecuperables",
        fuente: "Censo 2024 – INE",
        escala: ["Nacional", "Región", "Comuna", "Área (urbana/rural)"],
        descripcion:
          "Proporción de viviendas definidas como inadecuadas y necesarias de reemplazar, en función de su tipo y la materialidad de muros, techo y piso.",
        metodologia: [
          'Se utiliza el indicador sintético "viviendas irrecuperables" construido en el CENSO 2024.',
          "Se basa en: tipo de vivienda (mediagua, móvil, materiales precarios, etc.) y material predominante en paredes, techo y piso.",
          'Se identifica la variable "comuna" con el total de viviendas por comuna.',
        ],
        formula:
          "( N° viviendas irrecuperables / N° viviendas de la comuna ) × 100",
        supuestos: "Viviendas particulares ocupadas con moradores presentes.",
        comentarios: undefined,
      },
      {
        nombre: "Viviendas en mal estado de conservación",
        fuente: "CASEN 2022 – MDSF",
        escala: ["Nacional", "Región", "Área (urbana/rural)"],
        descripcion:
          "Clasifica el parque habitacional según el estado de conservación de los materiales (muros, techo y piso) en tres categorías: bueno, regular y malo.",
        metodologia: [
          'Se utiliza el indicador sintético "viviendas en mal estado de conservación" de la CASEN 2022.',
          "Basado en: v3 (estado de muros), v5 (piso) y v7 (techo). Categorías: bueno, aceptable, malo.",
          "Denominador: total de hogares por región.",
        ],
        formula:
          "( N° hogares según estado de conservación / N° hogares de la región ) × 100",
        supuestos: "Jefes de hogar (pco1_a = 1). Factores de expansión.",
        comentarios: "No representativo a nivel comunal.",
      },
      {
        nombre:
          "Personas que declararon haber sentido frío en su vivienda (últimos 12 meses)",
        fuente: "Encuesta de Bienestar Social (EBS) 2023 – MDSF",
        escala: ["Nacional", "Región", "Área (urbana/rural)"],
        descripcion:
          "Refleja la proporción de personas que reportaron sensación de frío al interior de su vivienda. Indicador subjetivo basado en percepción declarada, relevante para evaluar habitabilidad y vulnerabilidad energética.",
        metodologia: [
          'Desde EBS 2023, se identifica pregunta vv2: "Durante los últimos 12 meses, ¿usted pasó frío dentro de su vivienda?" (Módulo Vivienda).',
          'Se identifica la variable "región" con el total de hogares por región.',
        ],
        formula:
          "( N° personas que declararon haber sentido frío / N° personas de la región ) × 100",
        supuestos: "Se utilizan factores de expansión.",
        comentarios:
          "No representativo a nivel comunal (Metodología de Diseño Muestral, MDSF).",
      },
      {
        nombre:
          "Personas que declararon haber sentido calor en su vivienda (últimos 12 meses)",
        fuente: "Encuesta de Bienestar Social (EBS) 2023 – MDSF",
        escala: ["Nacional", "Región", "Área (urbana/rural)"],
        descripcion:
          "Mide la proporción de personas que reportaron sensación de calor al interior de su vivienda. El aumento de olas de calor por cambio climático evidencia deficiencias en aislamiento y diseño de viviendas.",
        metodologia: [
          'Desde EBS 2023, se identifica pregunta vv3: "Durante los últimos 12 meses, ¿usted pasó calor dentro de su vivienda?" (Módulo Vivienda).',
          'Se identifica la variable "región" con el total de hogares por región.',
        ],
        formula:
          "( N° personas que declararon haber sentido calor / N° personas de la región ) × 100",
        supuestos: "Se utilizan factores de expansión.",
        comentarios: "No representativo a nivel comunal.",
      },
    ],
  },
  Asequibilidad: {
    icono: "💰",
    color: "#4a235a",
    light: "#f5eef8",
    indicadores: [
      {
        nombre: "Hogares que gastan más del 10% de sus ingresos en energía",
        fuente: "Encuesta de Presupuestos Familiares IX – INE",
        escala: ["Nacional", "Macrozonas"],
        descripcion:
          'Indicador "10%" propuesto por Boardman (1991). Identifica hogares cuyo gasto en energía supera el 10% del ingreso disponible. Umbral empírico específico para el Reino Unido; su aplicación en Chile debe realizarse con cautela.',
        metodologia: [
          "Desde EPF IX, se identifican gastos en electricidad, gas y otros combustibles (líquidos, madera, sólidos) por hogar, excluyendo segundas viviendas.",
          "Se suman los gastos identificados por hogar y se unen las bases de gastos y personas.",
          "Se identifican ingresos disponibles del hogar (imputados por hot deck).",
          "Se calcula la proporción del gasto total en energéticos sobre ingresos disponibles por hogar.",
        ],
        formula: "gasto total en energéticos / ingresos disponibles > 0.10",
        supuestos: "Factores de expansión.",
        comentarios:
          "Resultados representativos para capitales regionales y macrozonas Norte, Centro, Sur y Gran Santiago, a nivel urbano.",
      },
      {
        nombre:
          "Hogares cuya proporción de gasto en energía es más del doble de la mediana nacional (2M)",
        fuente: "Encuesta de Presupuestos Familiares IX – INE",
        escala: ["Nacional", "Macrozonas"],
        descripcion:
          'Indicador "2M": identifica hogares pobres energéticamente como aquellos cuya proporción de gasto en energía sobre ingresos es mayor a dos veces la mediana nacional.',
        metodologia: [
          "Misma identificación de gastos energéticos que indicador 10%.",
          "Se calcula la proporción gasto/ingreso por hogar.",
          "Se calcula la mediana nacional de esa proporción y se identifican hogares sobre el doble de esa mediana.",
        ],
        formula:
          "proporción gasto en energía > (2 × mediana proporción nacional)",
        supuestos: "Factores de expansión.",
        comentarios:
          "Representativo a nivel de macrozonas y capitales regionales, urbano.",
      },
      {
        nombre:
          "Hogares cuyo gasto en energía es mayor al doble de la mediana nacional (2M Expenses)",
        fuente: "Encuesta de Presupuestos Familiares IX – INE",
        escala: ["Nacional", "Macrozonas"],
        descripcion:
          'Indicador "2M Expenses": identifica hogares pobres energéticamente como aquellos cuyos gastos monetarios en energía son mayores a dos veces la mediana nacional.',
        metodologia: [
          "Misma identificación de gastos energéticos.",
          "Se suman los gastos por hogar.",
          "Se calcula la mediana nacional del gasto total en energéticos.",
        ],
        formula: "gasto total energéticos > (2 × mediana gasto nacional)",
        supuestos: "Factores de expansión.",
        comentarios:
          "Representativo a nivel de macrozonas y capitales regionales, urbano.",
      },
      {
        nombre:
          "Hogares cuyo gasto en energía es menor a la mitad de la mediana nacional (M/2)",
        fuente: "Encuesta de Presupuestos Familiares IX – INE",
        escala: ["Nacional", "Macrozonas"],
        descripcion:
          'Indicador "M/2": identifica pobreza energética oculta. Hogares con gasto energético anormalmente bajo, posiblemente por imposibilidad de costear energía suficiente.',
        metodologia: [
          "Misma identificación de gastos energéticos.",
          "Se suman los gastos por hogar.",
          "Se calcula la mediana nacional del gasto total en energéticos.",
        ],
        formula: "gasto total en energéticos < mediana gasto nacional / 2",
        supuestos: "Factores de expansión.",
        comentarios:
          "Representativo a nivel de macrozonas y capitales regionales, urbano.",
      },
      {
        nombre: "Hogares con gasto excesivo en energía (MIS adaptado)",
        fuente: "EPF IX – INE / Observatorio Social – MDSF",
        escala: ["Nacional", "Macrozonas"],
        descripcion:
          'Adaptación del "Ingreso Mínimo Estándar" (MIS). Un hogar es pobre energéticamente si su ingreso disponible, menos costos de vivienda y energía, no logra cubrir la línea de pobreza equivalente.',
        metodologia: [
          "Se suman gastos en energéticos y en vivienda (arriendo o dividendo) por hogar.",
          "Se une base de gastos con base de personas de la EPF IX.",
          "Se calcula la línea de pobreza extrema promedio (Observatorio Social, MDSF) y se ajusta por economías de escala.",
          "Se identifican ingresos disponibles del hogar (hot deck).",
        ],
        formula:
          "ingresos disponibles − (gastos en vivienda + gastos en energéticos + línea de pobreza ajustada) < 0",
        supuestos: "Factores de expansión.",
        comentarios:
          "Representativo a nivel de macrozonas y capitales regionales, urbano.",
      },
      {
        nombre:
          "Hogares con gasto insuficiente en energía (HEP / Pobreza energética oculta)",
        fuente: "Encuesta de Presupuestos Familiares IX – INE",
        escala: ["Nacional", "Macrozonas"],
        descripcion:
          'Adaptación del "Hidden Energy Poverty Indicator" (HEP). Un hogar es pobre energéticamente oculto cuando su gasto es menor a la mitad de la mediana del gasto de hogares en condiciones similares.',
        metodologia: [
          "Se construyen grupos de referencia por composición del hogar (adultos mayores, NNA, PEA y combinaciones) y tipo de vivienda.",
          "Se calculan medianas de gasto energético para cada grupo de referencia.",
          "Se construyen quintiles de ingreso.",
          "Se identifican hogares con gasto menor a la mitad de la mediana de su grupo, excluyendo quintil 5.",
        ],
        formula:
          "gastos en energéticos < umbral PE (grupo de referencia)  AND  quintil ≠ 5",
        supuestos: "Factores de expansión.",
        comentarios:
          "Representativo a nivel de macrozonas y capitales regionales, urbano.",
      },
      {
        nombre:
          "Riesgo de pobreza energética por bajos ingresos y severidad climática (PTSI)",
        fuente: "RSH – MDSF / Zonas térmicas – MINVU",
        escala: ["Nacional", "Región", "Comuna"],
        descripcion:
          "Índice territorial que combina el porcentaje de familias en el tramo 40 del RSH con la severidad climática (zonas térmicas). Identifica territorios con alta vulnerabilidad socioeconómica y condiciones climáticas extremas.",
        metodologia: [
          "Se obtiene el porcentaje de hogares en el tramo 40 del RSH por comuna.",
          "Se asigna un Factor Climático (FC) a cada comuna según zona térmica predominante por superficie (zonas A–I).",
          "Se calcula el PTSI = (V_pobre,r / V_total,r) × FC_r.",
          "Se ordenan las comunas por PTSI y se agrupan en deciles.",
        ],
        formula: "PTSI_r = ( V_pobre,r / V_total,r ) × FC_r",
        supuestos:
          "Factor climático refleja mayor necesidad de recursos en zonas extremas. Se asume zona térmica predominante por superficie comunal.",
        comentarios: "Indicador pendiente de ajuste metodológico.",
      },
    ],
  },
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function IndicadorCard({
  ind,
  color,
  light,
}: {
  ind: Indicador;
  color: string;
  light: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`nt-card-indicador ${open ? "nt-card-indicador--open" : ""}`}
      style={
        { "--dim-color": color, "--dim-light": light } as React.CSSProperties
      }
    >
      <button
        className="nt-card-indicador__header"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="nt-card-indicador__header-text">
          <span className="nt-card-indicador__nombre">{ind.nombre}</span>
          <span className="nt-card-indicador__fuente">{ind.fuente}</span>
        </div>
        <span
          className={`nt-card-indicador__chevron ${open ? "nt-card-indicador__chevron--open" : ""}`}
        >
          ↓
        </span>
      </button>

      {open && (
        <div className="nt-card-indicador__body">
          <div className="nt-ficha-campo">
            <span className="nt-ficha-label">Escala de desagregación</span>
            <div className="nt-badges">
              {ind.escala.map((s) => (
                <span key={s} className="nt-badge">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="nt-ficha-campo">
            <span className="nt-ficha-label">Descripción</span>
            <p className="nt-ficha-texto">{ind.descripcion}</p>
          </div>

          <div className="nt-ficha-campo">
            <span className="nt-ficha-label">Metodología</span>
            <ol className="nt-metodologia-lista">
              {ind.metodologia.map((paso, i) => (
                <li key={i}>{paso}</li>
              ))}
            </ol>
          </div>

          <div className="nt-ficha-campo">
            <span className="nt-ficha-label">Fórmula</span>
            <code className="nt-formula">{ind.formula}</code>
          </div>

          <div className="nt-ficha-campo">
            <span className="nt-ficha-label">Supuestos</span>
            <p className="nt-ficha-texto nt-ficha-texto--muted">
              {ind.supuestos}
            </p>
          </div>

          {ind.comentarios && (
            <div className="nt-comentario">
              <span className="nt-comentario__icono">ℹ️</span>
              <p>{ind.comentarios}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function NotasTecnicas() {
  const dimKeys = Object.keys(DIMENSIONES);
  const [dimActiva, setDimActiva] = useState<string>(dimKeys[0]);
  const dim = DIMENSIONES[dimActiva];

  return (
    <article className="notas-tecnicas">
      <header className="nt-header">
        <p className="nt-header__supra">
          Ministerio de Energía · División Acceso y Desarrollo Social
        </p>
        <h1>Indicadores de Pobreza Energética</h1>
        <p className="nt-lead">
          Fichas metodológicas por dimensión. Seleccione un indicador para ver
          su descripción, metodología de cálculo, fórmula y supuestos.
        </p>
      </header>

      <nav className="nt-tabs" aria-label="Dimensiones">
        {dimKeys.map((key) => {
          const d = DIMENSIONES[key];
          const activa = key === dimActiva;
          return (
            <button
              key={key}
              className={`nt-tab ${activa ? "nt-tab--activa" : ""}`}
              style={
                {
                  "--tab-color": d.color,
                  "--tab-light": d.light,
                } as React.CSSProperties
              }
              onClick={() => setDimActiva(key)}
              aria-pressed={activa}
            >
              <span className="nt-tab__icono">{d.icono}</span>
              <span className="nt-tab__nombre">{key}</span>
              <span className="nt-tab__count">{d.indicadores.length}</span>
            </button>
          );
        })}
      </nav>

      <section className="nt-panel">
        <div
          className="nt-panel__cabecera"
          style={
            {
              "--dim-color": dim.color,
              "--dim-light": dim.light,
            } as React.CSSProperties
          }
        >
          <span className="nt-panel__icono">{dim.icono}</span>
          <div>
            <strong>Dimensión {dimActiva}</strong>
            <span className="nt-panel__subtitulo">
              {dim.indicadores.length} indicadores — haga clic en un indicador
              para ver su ficha técnica
            </span>
          </div>
        </div>

        {dim.indicadores.map((ind, i) => (
          <IndicadorCard
            key={i}
            ind={ind}
            color={dim.color}
            light={dim.light}
          />
        ))}
      </section>

      <footer className="nt-footer">
        <p>
          Fuentes: CENSO 2024 (INE) · CASEN 2022 · EBS 2023 · EPF IX · Energía
          Abierta (CNE) · RSH (MDSF) · OGUC–MINVU
        </p>
        <p>Unidad Gestión de Proyectos y Políticas Sociales · Diciembre 2025</p>
      </footer>
    </article>
  );
}

export default NotasTecnicas;
