// src/components/ProgramasVPE.tsx
import { useState } from "react";
import "../styles/ProgramasVPE.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Iniciativa {
  nombre: string;
  descripcion: string;
  publicoObjetivo: string;
  url?: string;
}

interface TipoIniciativa {
  icono: string;
  color: string;
  light: string;
  iniciativas: Iniciativa[];
}

// ─── Datos ────────────────────────────────────────────────────────────────────

const TIPOS: Record<string, TipoIniciativa> = {
  "Programas y políticas": {
    icono: "📋",
    color: "#0d6e6e",
    light: "#e6f4f4",
    iniciativas: [
      {
        nombre: "Subsidio Eléctrico",
        descripcion:
          "El Subsidio Eléctrico surge como parte de las medidas de la Ley N°21.667/2024 para mitigar el alza en las tarifas eléctricas y proporcionar alivio financiero a los hogares más vulnerables del país. Este subsidio está diseñado para ser un beneficio semestral para los años 2024, 2025 y 2026, el cual se materializa en un descuento directamente en las cuentas de electricidad. Se debe postular mediante la plataforma web del Ministerio de Energía, a través de los canales presenciales y telefónicos de Chile Atiende o por medio de la Ventanilla Única Social.",
        publicoObjetivo:
          "Hogares de todo el país que pertenecen al tramo 0%–40% del Registro Social de Hogares o son parte del Registro de Personas Electrodependientes inscritos en el RSH, y que se encuentran al día con el pago de las cuentas de electricidad.",
        url: "https://www.subsidioelectrico.cl/",
      },
      {
        nombre: "Programa Mi Calor, Mi Hogar",
        descripcion:
          "Programa de inversión pública para mejorar el confort térmico de las viviendas. El programa comenzó con un piloto durante el año 2023 en la comuna de Santa Juana, región del Biobío, interviniendo 100 viviendas.",
        publicoObjetivo:
          "Familias de diversas comunas (como Santa Juana, Coelemu, Quirihue, Galvarino y Lumaco) que requieren mejorar la eficiencia térmica de sus viviendas.",
        url: "https://www.agenciase.org/category/eficiencia-energetica-residencial/mi-calor-mi-hogar/",
      },
      {
        nombre: "Programa Casa Solar",
        descripcion:
          "Programa que cofinancia sistemas fotovoltaicos en los hogares, cuyo propósito es potenciar el uso de energías renovables para disminuir el gasto en electricidad. Permite adquirir sistemas fotovoltaicos a menor precio y con cofinanciamiento estatal variable para viviendas de hasta 3.000 UF de avalúo fiscal. Última versión 2024–2025 operativa en Antofagasta y O'Higgins.",
        publicoObjetivo:
          "Propietarios de viviendas de hasta 3.000 UF de avalúo fiscal en las regiones con cobertura activa.",
        url: "https://www.casasolar.cl/",
      },
      {
        nombre: "Programa Habitabilidad Rural",
        descripcion:
          "Subsidio destinado a familias que viven en zonas rurales o urbanas de hasta 5.000 habitantes. Considera subsidio habitacional para financiar la construcción, ampliación o mejoramiento de viviendas con alto estándar de eficiencia energética. Incluye acondicionamiento térmico y, en algunos casos, Sistemas Solares Térmicos para Agua Caliente Sanitaria, Sistemas Fotovoltaicos On Grid y recambio de calefactor.",
        publicoObjetivo:
          "Personas chilenas y extranjeras con residencia definitiva que cuenten con terreno apto, ahorro requerido, RSH y una Entidad de Gestión Rural (EGR).",
        url: "https://www.minvu.gob.cl/postulacion/llamado-nacional-2025-modalidad-vivienda-nueva/",
      },
      {
        nombre: "Fondo Leña Más Seca",
        descripcion:
          "Programa que entrega recursos a pequeñas, medianas y grandes empresas cuyo proceso de producción de leña les permita generar un producto de calidad y de menor impacto ambiental (leña seca).",
        publicoObjetivo:
          "Productores y comerciantes de leña y micro o pequeñas empresas.",
        url: "https://www.agenciase.org/lenamasseca/",
      },
      {
        nombre: "Programa de Protección del Patrimonio Familiar",
        descripcion:
          "Programa que ofrece subsidios habitacionales a las familias para mejorar el entorno y mejorar o ampliar su vivienda. Contempla 3 tipos de subsidios: mejoramiento de entorno y equipamiento comunitario; mejoramiento de vivienda; y ampliación de vivienda.",
        publicoObjetivo:
          "Familias chilenas que requieren mejorar, ampliar o recuperar su vivienda; comités o grupos de familias organizadas; hogares con inscripción en el RSH en situación de vulnerabilidad.",
        url: "https://sst.minenergia.cl/?page_id=46",
      },
      {
        nombre: "Programa de Mejoramiento de Vivienda y Barrios",
        descripcion:
          "Programa que busca mejorar la eficiencia energética de las viviendas. Puede considerar revestimiento de paredes para aislamiento térmico, mejora de ventanas y la incorporación de energías limpias.",
        publicoObjetivo:
          "Comités o grupos de familias organizadas; hogares en áreas urbanas de más de 5.000 habitantes; personas del 60% RSH; hogares que necesitan mejoramiento estructural, acondicionamiento térmico o ampliación para evitar hacinamiento.",
        url: "https://www.minvu.gob.cl/beneficio/vivienda/programa-de-mejoramiento-de-viviendas-y-barrios-proyectos-para-la-vivienda/",
      },
      {
        nombre: "Calificación Energética de Viviendas",
        descripcion:
          "Programa voluntario que insta a compradores de viviendas a exigir al mercado inmobiliario la venta de viviendas con mejores condiciones de habitabilidad y confort térmico.",
        publicoObjetivo:
          "Personas que compran o evalúan viviendas nuevas, constructores, inmobiliarias, SERVIU, evaluadores energéticos acreditados y usuarios interesados en eficiencia energética.",
        url: "https://www.calificacionenergetica.cl/",
      },
      {
        nombre: "Programa de Recambio de Calefactores",
        descripcion:
          "Parte de las acciones de los Planes de Descontaminación Ambiental. Su propósito es reducir las emisiones de contaminantes generadas por la combustión residencial a leña. Los beneficiarios acceden a un nuevo calefactor entregando su antiguo calefactor y/o cocina instalado en la vivienda.",
        publicoObjetivo:
          "Personas que usan calefactores a leña en el centro y sur de Chile; propietarios con calefactores instalados y en uso; habitantes de regiones con Planes de Descontaminación Atmosférica (PDA).",
        url: "https://calefactores.mma.gob.cl/",
      },
      {
        nombre: "Comuna Energética",
        descripcion:
          "Programa nacional que busca contribuir a mejorar la gestión energética y la participación de los municipios y actores locales para fomentar la generación e implementación de iniciativas replicables e innovadoras de energía sostenible en las comunas de Chile.",
        publicoObjetivo:
          "Municipalidades, actores locales y comunidades, gobiernos regionales y organismos públicos relacionados, comunas que buscan transición energética y sostenibilidad.",
        url: "https://www.comunaenergetica.cl/",
      },
      {
        nombre: "Fondo de Protección Ambiental",
        descripcion:
          "Fondo concursable de carácter ambiental que apoya iniciativas ciudadanas y financia total o parcialmente proyectos o actividades orientados a la protección o reparación del medio ambiente, el desarrollo sustentable, la preservación de la naturaleza o la conservación del patrimonio ambiental.",
        publicoObjetivo:
          "Personas jurídicas de derecho privado sin fines de lucro: ONGs, corporaciones, fundaciones, comunidades agrícolas, asociaciones gremiales y comunidades/asociaciones indígenas.",
        url: "https://fondos.mma.gob.cl/fpa/",
      },
      {
        nombre: "Programa Mejoramiento de Barrios",
        descripcion:
          "Financiamiento de diversas tipologías de proyectos postulados por los municipios del país, principalmente en las áreas de saneamiento sanitario, energización, protección del patrimonio y otros ámbitos, orientado a familias que habitan en condiciones de marginalidad.",
        publicoObjetivo:
          "Comunidades en áreas urbanas/rurales con rezago y vulnerabilidad, con foco en saneamiento (agua/alcantarillado) y espacios públicos.",
        url: "https://www.subdere.cl/programas/divisi%C3%B3n-municipalidades/programa-mejoramiento-de-barrios-pmb",
      },
    ],
  },
  "Proyectos e iniciativas": {
    icono: "🔧",
    color: "#1a5276",
    light: "#eaf0f8",
    iniciativas: [
      {
        nombre: "Electrificación Rural",
        descripcion:
          "Ejecución de proyectos de electrificación rural a nivel nacional con financiamiento público del FNDR. Hace seguimiento sobre el estado de los proyectos y nivel de avance de obras.",
        publicoObjetivo:
          "Familias rurales sin acceso a energía eléctrica; hogares rurales de menores ingresos; comunidades rurales aisladas y centros comunitarios; población rural indígena o reubicada por programas del Estado; municipios y gobiernos regionales.",
        url: "https://www.subdere.gov.cl/documentacion/programa-de-electrificación-rural-contrato-de-préstamo-1475oc-ch",
      },
      {
        nombre: "Agua Caliente Sanitaria para Machi de La Araucanía",
        descripcion:
          "Proyecto piloto que busca dar suministro de agua caliente sanitaria por medio de sistemas solares térmicos en dependencias de viviendas de machi de la región de La Araucanía, para uso medicinal.",
        publicoObjetivo:
          "Machi que ejercen en la región de La Araucanía. Benefició inicialmente a 7 rukas (casas/espacios ceremoniales) en la comuna de Nueva Imperial.",
        url: "https://serviuaraucania.minvu.cl/wp-content/files_mf/1472819024ProyectoHabitacionalconPertinenciaIndigena3.pdf",
      },
      {
        nombre: "Actualización del Mapa de Vulnerabilidad Energética",
        descripcion:
          "Actualizar el catastro de brechas de acceso a energía eléctrica del año 2019, considerando viviendas sin suministro eléctrico y aquellas conectadas a sistemas aislados concentrados o individuales con suministro parcial o permanente. El propósito es georreferenciar cada una de las viviendas.",
        publicoObjetivo:
          "Ciudadanía, investigadores en políticas sociales e instituciones públicas.",
        url: "https://energia.gob.cl/sites/default/files/documento_de_metodologia_y_resultados_0.pdf",
      },
      {
        nombre: "Cálculo de Subsidios a la Operación de Sistemas Aislados",
        descripcion:
          "Conforme a la Ley de Presupuesto 2023 (Glosa 03, N°3.2), le corresponde a la Subsecretaría de Energía el reconocimiento de los sistemas de autogeneración de energía y la determinación del monto de los subsidios para la operación y reparaciones que permitan su continuidad de servicio.",
        publicoObjetivo:
          "Comunidades en zonas aisladas geográficamente que no están conectadas al sistema eléctrico principal.",
      },
      {
        nombre: "Actualización Metodología de Electrificación Rural",
        descripcion:
          "Modernización del instrumento de inversión pública del Ministerio de Desarrollo Social y Familia para la formulación y evaluación de proyectos de electrificación rural, de manera de agilizar los procesos y mejorar la focalización y ejecución de recursos públicos.",
        publicoObjetivo:
          "Comunidades rurales dispersas con necesidad de electrificación.",
        url: "https://sni.gob.cl/storage/docs/Metodologia_de_Electrificacion_Rural_2022.pdf",
      },
    ],
  },
  "Leyes y políticas públicas": {
    icono: "⚖️",
    color: "#4a235a",
    light: "#f5eef8",
    iniciativas: [
      {
        nombre: "Ley de Eficiencia Energética 21.305",
        descripcion:
          "Ley cuyo objeto es promover el uso racional y eficiente de los recursos energéticos, por cuanto la eficiencia energética es la forma más segura, económica y sustentable de cubrir necesidades energéticas.",
        publicoObjetivo:
          "Grandes empresas industriales y mineras, organismos públicos, importadores de vehículos y el sector de la edificación.",
        url: "https://energia.gob.cl/ley-y-plan-de-eficiencia-energetica",
      },
      {
        nombre: "Fondo de Estabilización de Precios – Ley 21.472",
        descripcion:
          "Ley que crea un fondo de estabilización de tarifas y establece un nuevo mecanismo de estabilización transitorio de precios de la electricidad para clientes sometidos a regulación de precios.",
        publicoObjetivo:
          "Clientes residenciales y pequeñas empresas con consumos eléctricos regulados.",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=1179524",
      },
      {
        nombre: "Ley de Equidad Tarifaria 20.928",
        descripcion:
          "Ley que establece mecanismos de equidad en las tarifas de servicios eléctricos, introduciendo el reconocimiento a la generación local y la equidad tarifaria residencial. Considera facultades para la incorporación en la tarifa de parte o la totalidad de los servicios asociados al suministro.",
        publicoObjetivo:
          "Clientes residenciales (tarifa BT1) que viven en comunas con altos costos de distribución o en aquellas que albergan centrales de generación eléctrica.",
        url: "https://bcn.cl/2oizj",
      },
      {
        nombre: "Subsidio al Consumo de Gas Natural en la Región de Magallanes",
        descripcion:
          "Subsidio aplicado a través de un aporte compensatorio transferido desde el Ministerio de Energía a ENAP, junto a un congelamiento de las tarifas en la región de Magallanes. Vigente desde 2016.",
        publicoObjetivo:
          "Hogares dentro del 60% del RSH con suministro de gas domiciliario, beneficiando principalmente a adultos mayores, personas con discapacidad o dependencia y cuidadores. Aplica en Punta Arenas, Puerto Natales y Porvenir.",
      },
    ],
  },
};

// ─── Sub-componente: tarjeta de iniciativa ────────────────────────────────────

function IniciativaCard({
  item,
  color,
  light,
}: {
  item: Iniciativa;
  color: string;
  light: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`vpe-card ${open ? "vpe-card--open" : ""}`}
      style={
        { "--dim-color": color, "--dim-light": light } as React.CSSProperties
      }
    >
      <button className="vpe-card__header" onClick={() => setOpen((o) => !o)}>
        <div className="vpe-card__header-text">
          <span className="vpe-card__nombre">{item.nombre}</span>
        </div>
        <span
          className={`vpe-card__chevron ${open ? "vpe-card__chevron--open" : ""}`}
        >
          ↓
        </span>
      </button>

      {open && (
        <div className="vpe-card__body">
          {/* Descripción */}
          <div className="vpe-ficha-campo">
            <span className="vpe-ficha-label">Descripción</span>
            <p className="vpe-ficha-texto">{item.descripcion}</p>
          </div>

          {/* Público objetivo */}
          <div className="vpe-ficha-campo">
            <span className="vpe-ficha-label">Público objetivo</span>
            <p className="vpe-ficha-texto vpe-ficha-texto--muted">
              {item.publicoObjetivo}
            </p>
          </div>

          {/* Enlace */}
          {item.url && (
            <div className="vpe-ficha-campo">
              <span className="vpe-ficha-label">Más información</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="vpe-link"
              >
                {item.url}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function ProgramasVPE() {
  const tipoKeys = Object.keys(TIPOS);
  const [tipoActivo, setTipoActivo] = useState<string>(tipoKeys[0]);
  const tipo = TIPOS[tipoActivo];

  return (
    <article className="programas-vpe">
      <header className="vpe-header">
        <p className="vpe-header__supra">
          Ministerio de Energía · División Acceso y Desarrollo Social
        </p>
        <h1>Programas e Iniciativas — Pobreza Energética</h1>
        <p className="vpe-lead">
          Catálogo de programas, proyectos y marcos legales orientados a reducir
          la pobreza energética en Chile. Seleccione una categoría y haga clic
          en una iniciativa para ver su descripción y público objetivo.
        </p>
      </header>

      {/* Tabs de tipo */}
      <nav className="vpe-tabs" aria-label="Tipos de iniciativa">
        {tipoKeys.map((key) => {
          const t = TIPOS[key];
          const activo = key === tipoActivo;
          return (
            <button
              key={key}
              className={`vpe-tab ${activo ? "vpe-tab--activo" : ""}`}
              style={
                {
                  "--tab-color": t.color,
                  "--tab-light": t.light,
                } as React.CSSProperties
              }
              onClick={() => setTipoActivo(key)}
              aria-pressed={activo}
            >
              <span className="vpe-tab__icono">{t.icono}</span>
              <span className="vpe-tab__nombre">{key}</span>
              <span className="vpe-tab__count">{t.iniciativas.length}</span>
            </button>
          );
        })}
      </nav>

      {/* Panel activo */}
      <section className="vpe-panel">
        <div
          className="vpe-panel__cabecera"
          style={
            {
              "--dim-color": tipo.color,
              "--dim-light": tipo.light,
            } as React.CSSProperties
          }
        >
          <span className="vpe-panel__icono">{tipo.icono}</span>
          <div>
            <strong>{tipoActivo}</strong>
            <span className="vpe-panel__subtitulo">
              {tipo.iniciativas.length} iniciativas — haga clic para ver el
              detalle
            </span>
          </div>
        </div>

        {tipo.iniciativas.map((item, i) => (
          <IniciativaCard
            key={i}
            item={item}
            color={tipo.color}
            light={tipo.light}
          />
        ))}
      </section>

      <footer className="vpe-footer">
        <p>Fuentes: Ministerio de Energía · MINVU · MMA · SUBDERE · BCN</p>
        <p>Unidad Gestión de Proyectos y Políticas Sociales · 2025</p>
      </footer>
    </article>
  );
}

export default ProgramasVPE;
