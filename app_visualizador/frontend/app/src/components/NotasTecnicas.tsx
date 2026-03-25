// src/components/NotasTecnicas.tsx
import "../styles/NotasTecnicas.css";

function NotasTecnicas() {
  return (
    <article className="notas-tecnicas">
      <header className="nt-header">
        <h1>Pobreza energética — contexto del visualizador</h1>
        <p className="nt-lead">
          La pobreza energética describe la dificultad de un hogar para acceder
          a servicios energéticos esenciales.
        </p>
      </header>

      {/* ← dos columnas */}
      <div className="nt-body">
        {/* Columna izquierda: contenido */}
        <section className="nt-callout">
          <h2>Definición resumida</h2>
          <p>
            La pobreza energética se refiere a la situación en la que un hogar
            no puede acceder a una cantidad suficiente de servicios energéticos
            esenciales para garantizar condiciones de vida dignas, ya sea por
            falta de recursos económicos o por ausencia de infraestructura
            adecuada. Este concepto incluye la energía necesaria para
            calefacción, refrigeración, iluminación, cocina y agua caliente
            sanitaria, entre otros usos básicos123. A nivel internacional, la
            definición más citada proviene de Brenda Boardman (1991), quien la
            describió como la incapacidad de un hogar para mantener una
            temperatura adecuada en la vivienda destinando menos del 10% de sus
            ingresos a energía. Sin embargo, enfoques más recientes, como los de
            Bouzarovski y Petrova (2015), la entienden como la imposibilidad de
            alcanzar un nivel social y materialmente necesario de servicios
            energéticos, afectando la participación plena en la sociedad.
          </p>
        </section>

        <section>
          <h2>Dimensiones y causas</h2>
          <ul className="nt-list">
            <li>
              <strong>Bajos ingresos</strong> del hogar.
            </li>
            <li>
              <strong>Altos precios</strong> de la energía.
            </li>
            <li>
              <strong>Baja eficiencia</strong> y habitabilidad.
            </li>
            <li>Brechas territoriales y vulnerabilidad climática.</li>
          </ul>
        </section>

        <section>
          <h2>Impactos principales</h2>
          <ul className="nt-list">
            <li>Salud física y mental.</li>
            <li>Riesgo de exclusión social.</li>
            <li>Confort térmico comprometido.</li>
          </ul>
        </section>

        <section>
          <h2>Situación en Chile</h2>
          <ol className="nt-ordered">
            <li>Acceso a fuentes y artefactos.</li>
            <li>Calidad del suministro.</li>
            <li>Habitabilidad/eficiencia térmica.</li>
            <li>Asequibilidad del gasto.</li>
          </ol>

          <div className="nt-kpis">
            <div className="nt-kpi">
              <span className="nt-kpi__label">Hogares con brechas</span>
              <span className="nt-kpi__value">~34,3%</span>
            </div>
            <div className="nt-kpi">
              <span className="nt-kpi__label">Indicadores</span>
              <span className="nt-kpi__value">≈ 11</span>
            </div>
            <div className="nt-kpi">
              <span className="nt-kpi__label">Cobertura</span>
              <span className="nt-kpi__value">
                Nacional / Regional / Comunal
              </span>
            </div>
          </div>
        </section>

        <footer className="nt-footer">
          <p>
            <small>
              Referencias: Boardman (1991); Bouzarovski &amp; Petrova (2015);
              ODS 7; VIPE.
            </small>
          </p>
        </footer>

        {/* Columna derecha: imágenes / tablas */}
        <aside className="nt-col nt-col--side">
          {/* Ejemplos de tarjetas de imagen / tabla */}
          <figure className="nt-card">
            <img src="/assets/ejemplo-pe-1.png" alt="Mapa de ejemplo" />
            <figcaption>Mapa temático (ejemplo)</figcaption>
          </figure>

          <div className="nt-card">
            <h3>Tabla rápida</h3>
            <table className="nt-table">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Gasto energético / ingreso</td>
                  <td>9.8%</td>
                </tr>
                <tr>
                  <td>Viviendas con filtraciones</td>
                  <td>22%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </article>
  );
}

export default NotasTecnicas;
