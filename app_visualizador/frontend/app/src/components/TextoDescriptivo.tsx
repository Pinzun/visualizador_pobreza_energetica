// src/utils/textos_indicadores.ts

export type TextoDescriptivo = {
  nombre: string;
  descripcion: string;
};

export type CategoriaIndicadores = Record<string, TextoDescriptivo>;
export type TiposIndicadores = Record<string, CategoriaIndicadores>;

const TIPOS: TiposIndicadores = {
  "Indicadores de Acceso": {
    acceso_electricidad: {
      nombre: "Acceso a la electricidad",
      descripcion: `Descripción del indicador:\nEl indicador "Viviendas sin acceso a electricidad" mide el porcentaje de viviendas que no disponen de suministro eléctrico en una región o comuna, calculado sobre el total de viviendas del territorio.\n\nDescripción del gráfico:\nDistribución porcentual de viviendas sin suministro eléctrico por región o comuna, respecto del total de viviendas del territorio y por otro lado el tipo de fuente de energía utilizada por las viviendas con electricidad.`,
    },
    acceso_coccion: {
      nombre: "Acceso a cocción de alimentos",
      descripcion: `Descripción del indicador:\nEl indicador "Acceso a Cocción de Alimentos" mide el porcentaje de hogares que no cuentan con acceso a un sistema adecuado para la cocción de alimentos.\n\nDescripción del gráfico:\nPorcentaje de viviendas respecto del total del territorio seleccionado que cuentan con un sistema de cocción de alimentos adecuado.`,
    },
    acceso_agua_caliente: {
      nombre: "Acceso a agua caliente sanitaria",
      descripcion: `Descripción del indicador:\nEl indicador "Acceso a Agua Caliente Sanitaria" cuantifica el número de viviendas que no disponen de un sistema funcional para el calentamiento de agua sanitaria.\n\nDescripción del gráfico:\nPorcentaje de viviendas respecto del total del territorio seleccionado que cuentan con acceso a agua caliente sanitaria.`,
    },
    acceso_zonas_t: {
      nombre: "Acceso en zonas térmicas frías",
      descripcion: `Descripción del indicador:\nEl indicador "Hogares sin acceso a sistema de calefacción en zonas térmicas frías" mide el porcentaje de hogares que no cuentan con ningún sistema de calefacción en zonas térmicas frías, respecto del total de hogares del territorio. Este indicador permite identificar a los hogares con mayor riesgo de pobreza energética, debido a su exposición a condiciones climáticas adversas.\n\nDescripción del gráfico:\nPorcentaje de hogares sin acceso a sistemas de calefacción en zonas térmicas frías, calculado sobre el total de hogares de la región o comuna analizada.`,
    },
  },
  "Indicadores de Calidad": {
    calidad_calefaccion: {
      nombre: "Calidad de sistemas de calefacción",
      descripcion: `Descripción del indicador:\nEste indicador mide la proporción de hogares que utilizan fuentes de energía contaminantes para calefaccionar sus viviendas, tales como parafina, carbón, leña u otros.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    calidad_coccion: {
      nombre: "Calidad de sistemas de cocción",
      descripcion: `Descripción del indicador:\nEste indicador mide la proporción de hogares que utilizan fuentes energéticas contaminantes como parafina, carbón, leña u otros para cocinar alimentos.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    calidad_saidi: {
      nombre: "Interrupción del servicio eléctrico (SAIDI)",
      descripcion: `Descripción del indicador:\nEste indicador busca identificar comunas con mayores niveles de interrupciones del servicio eléctrico. Considera la duración promedio anual de interrupciones por causas internas y externas, sin aplicar umbrales normativos o valores límite.\n\nDescripción del gráfico:\nCantidad de horas de interrupción del servicio eléctrico según territorio para los años 2020, 2022, 2023 y 2024.`,
    },
  },
  "Indicadores de Habitabilidad": {
    habitabilidad_irrecuperable: {
      nombre: "Viviendas en calidad irrecuperable",
      descripcion: `Descripción del indicador:\nEste indicador da cuenta de la proporción de viviendas que debido a su tipo o la materialidad de sus muros, techo y piso se definen como inadecuadas, y, por tanto, necesarias de reemplazar.\n\nDescripción del gráfico:\nPorcentaje de viviendas en calidad irrecuperable por su materialidad.`,
    },
    habitabilidad_conservacion: {
      nombre: "Viviendas en buena o aceptable calidad de conservación",
      descripcion: `Descripción del indicador:\nEste indicador clasifica al parque habitacional ocupado de acuerdo con el estado de conservación de los materiales (muros exteriores, techo y piso) de las viviendas en que residen los hogares de acuerdo con tres categorías: estado de conservación bueno, regular y malo.\n\nDescripción del gráfico:\nPorcentaje de viviendas en condición "buena" o "aceptable" de su estado de conservación.`,
    },
    habitabilidad_ineficiencia_termica: {
      nombre: "Viviendas ineficientes térmicamente por normativa",
      descripcion: `Descripción del indicador:\nEste indicador busca estimar la proporción de viviendas que podrían presentar condiciones térmicas deficientes según su año de construcción, utilizando como variable proxy los permisos de edificación.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    habitabilidad_frio: {
      nombre: "Personas que reportan sentir frío en su vivienda",
      descripcion: `Descripción del indicador:\nEste indicador refleja la proporción de personas que reportaron haber experimentado sensación de frío al interior de su vivienda en el último año.\n\nDescripción del gráfico:\nPorcentaje de personas que declararon pasar frío durante los últimos 12 meses, calculado sobre el total de personas de la región.`,
    },
    habitabilidad_calor: {
      nombre: "Personas que reportan sentir calor en su vivienda",
      descripcion: `Descripción del indicador:\nEste indicador mide la proporción de personas que reportaron sensación de calor al interior de su vivienda en los últimos 12 meses.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
  },
  "Indicadores de Asequibilidad": {
    asequibilidad_gasto_energ_p: {
      nombre: "Gasto promedio en energía per cápita por macrozona",
      descripcion: `Descripción del indicador:\nPendiente de completar.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    asequibilidad_g_excesivo: {
      nombre: "Gasto promedio en energía excesivo",
      descripcion: `Descripción del indicador:\nEste indicador identifica hogares que poseen un gasto excesivo en energía. De acuerdo con la RedPE, para que un hogar cubra sus gastos efectivos de energía debe sacrificar las necesidades básicas valorizadas en la línea de pobreza determinada por el Ministerio de Desarrollo Social y Familia para un periodo determinado.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    asequibilidad_vuln: {
      nombre: "Comunas identificadas como vulnerables energéticamente",
      descripcion: `Descripción del indicador:\nEste indicador busca evaluar el riesgo de pobreza energética en una comuna o región, combinando dos factores: el porcentaje de familias en el tramo 40 del Registro Social de Hogares y la severidad climática del territorio (según zonas térmicas).\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    asequibilidad_g_insuficiente: {
      nombre: "Gasto promedio en energía insuficiente",
      descripcion: `Descripción del indicador:\nEste indicador identifica hogares que poseen un gasto insuficiente en energía. De acuerdo con la RedPE, un hogar es pobre energéticamente cuando su gasto en energía es menor a la mitad de la mediana del gasto en energía que tienen los hogares en condiciones similares (mismo tipo de vivienda y composición de integrantes).\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    asequibilidad_med_nac_doble: {
      nombre: "Gasto es el doble de la mediana nacional",
      descripcion: `Descripción del indicador:\nEl indicador "2M" identifica los hogares pobres energéticamente como aquellos cuya proporción de gasto de energía en relación con sus ingresos, es mayor a dos veces la mediana nacional.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    asequibilidad_med_nac_menor: {
      nombre: "Gasto es menor a la mediana nacional",
      descripcion: `Descripción del indicador:\nEl indicador "M/2" muestra el porcentaje de hogares cuyo gasto en energía es menor a la mitad de la mediana nacional de gasto en energía. Indicador de pobreza energética oculta que busca identificar hogares con un gasto energético anormalmente bajo.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    asequibilidad_med_nac_proporcion: {
      nombre: "Gasto es mayor a la mediana nacional",
      descripcion: `Descripción del indicador:\nEl indicador "2M Expenses" identifica los hogares pobres energéticamente como aquellos cuyos gastos (en términos monetarios) son mayores a dos veces la mediana nacional.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
    asequibilidad_gasto_10p: {
      nombre: "Hogares con gasto energético sobre el 10%",
      descripcion: `Descripción del indicador:\nIndicador basado en el umbral del 10% del ingreso destinado a gasto energético como criterio de identificación de pobreza energética.\n\nDescripción del gráfico:\nPendiente de completar.`,
    },
  },
};

/**
 * Busca el texto descriptivo de un indicador por su clave (value del tab_meta).
 * Recorre todas las categorías y devuelve el TextoDescriptivo si lo encuentra.
 */
export function getTextoIndicador(
  indicatorKey: string | null,
): TextoDescriptivo | null {
  if (!indicatorKey) return null;
  for (const categoria of Object.values(TIPOS)) {
    if (categoria[indicatorKey]) {
      return categoria[indicatorKey];
    }
  }
  return null;
}

export default TIPOS;
