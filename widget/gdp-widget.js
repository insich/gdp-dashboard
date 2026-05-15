(function (window, document) {
  const REACT_URL = 'https://unpkg.com/react@18/umd/react.production.min.js';
  const REACT_DOM_URL = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
  const STYLE_ID = 'gdp-widget-embed-styles';
  const DEFAULT_COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.hasAttribute('data-loaded')) {
          resolve();
        } else {
          existing.addEventListener('load', resolve);
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.addEventListener('load', () => {
        script.setAttribute('data-loaded', 'true');
        resolve();
      });
      script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      document.head.appendChild(script);
    });
  }

  function ensureReact() {
    const promises = [];
    if (!window.React) promises.push(loadScript(REACT_URL));
    if (!window.ReactDOM) promises.push(loadScript(REACT_DOM_URL));
    return Promise.all(promises);
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .gdp-widget {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border: 1px solid #e1e4e8;
        border-radius: 12px;
        padding: 18px;
        max-width: 760px;
        background: #ffffff;
        color: #0f172a;
      }
      .gdp-widget h2 {
        margin: 0 0 12px;
        font-size: 1.2rem;
      }
      .gdp-widget .gdp-widget-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .gdp-widget label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.95rem;
      }
      .gdp-widget select,
      .gdp-widget input[type='number'] {
        width: 100%;
        min-width: 180px;
        padding: 8px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        background: white;
        color: #0f172a;
      }
      .gdp-widget .gdp-widget-chart {
        width: 100%;
        min-height: 240px;
        background: #f8fafc;
        border-radius: 14px;
        padding: 14px;
      }
      .gdp-widget .gdp-widget-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }
      .gdp-widget .gdp-widget-table th,
      .gdp-widget .gdp-widget-table td {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 1px solid #e2e8f0;
      }
      .gdp-widget .gdp-widget-footer {
        font-size: 0.92rem;
        color: #475569;
        margin-top: 14px;
      }
      .gdp-widget .gdp-widget-error {
        color: #b91c1c;
        background: #fef2f2;
        border: 1px solid #fecaca;
        padding: 10px 12px;
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  function parseCsv(csvText) {
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((header) => header.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });
      return row;
    });
  }

  function normalizeRows(rows) {
    return rows
      .map((row) => {
        const country = String(row['Country Code'] ?? row.country ?? row.Code ?? row.code ?? row.countryCode ?? '').trim();
        const year = Number(row['Year'] ?? row.year ?? row.YearNumber ?? row.yearNumber);
        const gdp = Number(row['GDP'] ?? row.gdp ?? row.GDPValue ?? row.value ?? row.Value);
        return { country, year, gdp };
      })
      .filter((row) => row.country && Number.isFinite(row.year) && Number.isFinite(row.gdp));
  }

  function getSampleData() {
    return [
      { country: 'DEU', year: 2018, gdp: 3945 },
      { country: 'DEU', year: 2020, gdp: 3806 },
      { country: 'DEU', year: 2022, gdp: 4333 },
      { country: 'FRA', year: 2018, gdp: 2785 },
      { country: 'FRA', year: 2020, gdp: 2603 },
      { country: 'FRA', year: 2022, gdp: 2847 },
      { country: 'GBR', year: 2018, gdp: 2850 },
      { country: 'GBR', year: 2020, gdp: 2631 },
      { country: 'GBR', year: 2022, gdp: 3152 },
      { country: 'BRA', year: 2018, gdp: 1856 },
      { country: 'BRA', year: 2020, gdp: 1445 },
      { country: 'BRA', year: 2022, gdp: 1850 },
      { country: 'MEX', year: 2018, gdp: 1221 },
      { country: 'MEX', year: 2020, gdp: 1071 },
      { country: 'MEX', year: 2022, gdp: 1253 },
      { country: 'JPN', year: 2018, gdp: 4970 },
      { country: 'JPN', year: 2020, gdp: 5047 },
      { country: 'JPN', year: 2022, gdp: 5014 },
    ];
  }

  function formatValue(value) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function renderChart(data, selectedCountries, yearRange) {
    const [minYear, maxYear] = yearRange;
    const filtered = data.filter((row) => selectedCountries.includes(row.country) && row.year >= minYear && row.year <= maxYear);
    if (!filtered.length) {
      return React.createElement('div', { style: { padding: '18px', color: '#475569' } }, 'No data available for the selected range.');
    }

    const years = Array.from(new Set(filtered.map((row) => row.year))).sort((a, b) => a - b);
    const series = selectedCountries.map((country) => {
      const countryRows = filtered.filter((row) => row.country === country).sort((a, b) => a.year - b.year);
      return { country, rows: countryRows };
    });

    const allGdp = filtered.map((row) => row.gdp);
    const minGdp = Math.min(...allGdp);
    const maxGdp = Math.max(...allGdp);
    const width = 700;
    const height = 220;
    const left = 40;
    const bottom = 28;
    const top = 18;
    const chartWidth = width - left - 20;
    const chartHeight = height - top - bottom;

    function xForYear(year) {
      if (years.length === 1) return left + chartWidth / 2;
      return left + ((year - years[0]) / (years[years.length - 1] - years[0])) * chartWidth;
    }

    function yForValue(gdp) {
      if (maxGdp === minGdp) return top + chartHeight / 2;
      return top + chartHeight - ((gdp - minGdp) / (maxGdp - minGdp)) * chartHeight;
    }

    const paths = series.map((serie) => {
      const points = serie.rows.map((row) => `${xForYear(row.year)},${yForValue(row.gdp)}`);
      return React.createElement('path', {
        key: serie.country,
        d: `M ${points.join(' L ')}`,
        fill: 'none',
        stroke: DEFAULT_COLORS[selectedCountries.indexOf(serie.country) % DEFAULT_COLORS.length],
        strokeWidth: 3,
      });
    });

    const yearLabels = years.map((year) =>
      React.createElement('text', {
        key: year,
        x: xForYear(year),
        y: height - 8,
        textAnchor: 'middle',
        fontSize: 11,
        fill: '#475569',
      }, year.toString())
    );

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const y = top + ratio * chartHeight;
      return React.createElement('g', { key: ratio },
        React.createElement('line', {
          x1: left,
          y1: y,
          x2: width - 16,
          y2: y,
          stroke: '#e2e8f0',
          strokeWidth: 1,
        }),
        React.createElement('text', {
          x: left - 8,
          y: y + 3,
          textAnchor: 'end',
          fontSize: 11,
          fill: '#475569',
        }, formatValue(Math.round(maxGdp - ratio * (maxGdp - minGdp))))
      );
    });

    return React.createElement('svg', {
      className: 'gdp-widget-chart',
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      'aria-label': 'GDP over time chart',
    },
      ...gridLines,
      ...paths,
      yearLabels
    );
  }

  function GdpWidgetApp(props) {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedCountries, setSelectedCountries] = React.useState(props.countries || []);
    const [yearRange, setYearRange] = React.useState([props.fromYear || 2018, props.toYear || 2022]);

    React.useEffect(() => {
      let active = true;
      const fetchData = async () => {
        try {
          let rows = props.data || getSampleData();
          if (props.dataUrl) {
            const response = await window.fetch(props.dataUrl, { cache: 'no-store' });
            const text = await response.text();
            rows = props.dataUrl.toLowerCase().endsWith('.csv') ? parseCsv(text) : JSON.parse(text);
          }

          const normalized = normalizeRows(rows);
          if (!active) return;
          setData(normalized);
          setError(null);
          setLoading(false);

          const availableCountries = Array.from(new Set(normalized.map((row) => row.country))).sort();
          if (!props.countries || props.countries.length === 0) {
            setSelectedCountries(availableCountries.slice(0, 5));
          } else {
            setSelectedCountries(props.countries.filter((code) => availableCountries.includes(code)));
          }

          const years = normalized.map((row) => row.year);
          if (years.length) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            setYearRange([
              props.fromYear ? Math.max(minYear, props.fromYear) : minYear,
              props.toYear ? Math.min(maxYear, props.toYear) : maxYear,
            ]);
          }
        } catch (err) {
          if (!active) return;
          setError(err.message || 'Unable to load widget data.');
          setLoading(false);
        }
      };

      fetchData();
      return () => { active = false; };
    }, [props.dataUrl, props.data, props.countries, props.fromYear, props.toYear]);

    const availableCountries = Array.from(new Set(data.map((row) => row.country))).sort();
    const [minYear, maxYear] = yearRange;
    const filtered = data.filter((row) => selectedCountries.includes(row.country) && row.year >= minYear && row.year <= maxYear);
    const latestByCountry = selectedCountries.map((country) => {
      const rows = filtered.filter((row) => row.country === country).sort((a, b) => a.year - b.year);
      if (!rows.length) return null;
      const first = rows[0];
      const last = rows[rows.length - 1];
      const growth = first.gdp ? (last.gdp / first.gdp) : null;
      return {
        country,
        firstYear: first.year,
        lastYear: last.year,
        lastGdp: last.gdp,
        growth,
      };
    }).filter(Boolean);

    return React.createElement('div', { className: 'gdp-widget' },
      React.createElement('h2', null, props.title || 'GDP snapshot'),
      React.createElement('div', { className: 'gdp-widget-row' },
        React.createElement('label', null, 'Country selection',
          React.createElement('select', {
            multiple: true,
            size: Math.min(6, availableCountries.length),
            value: selectedCountries,
            onChange: (event) => {
              const values = Array.from(event.target.selectedOptions).map((option) => option.value);
              setSelectedCountries(values);
            },
          }, availableCountries.map((country) => React.createElement('option', { key: country, value: country }, country)))
        ),
        React.createElement('label', null, 'Start year',
          React.createElement('input', {
            type: 'number',
            min: Math.min(...data.map((row) => row.year), 1900),
            max: yearRange[1],
            value: minYear,
            onChange: (event) => setYearRange([Number(event.target.value), yearRange[1]]),
          })
        ),
        React.createElement('label', null, 'End year',
          React.createElement('input', {
            type: 'number',
            min: yearRange[0],
            max: Math.max(...data.map((row) => row.year), 2100),
            value: maxYear,
            onChange: (event) => setYearRange([yearRange[0], Number(event.target.value)]),
          })
        )
      ),
      loading && React.createElement('div', null, 'Loading GDP widget...'),
      error && React.createElement('div', { className: 'gdp-widget-error' }, error),
      !loading && !error && React.createElement('div', null,
        renderChart(data, selectedCountries, yearRange),
        React.createElement('table', { className: 'gdp-widget-table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Country'),
              React.createElement('th', null, 'Latest GDP (USD billions)'),
              React.createElement('th', null, 'Growth from first selected year')
            )
          ),
          React.createElement('tbody', null,
            latestByCountry.map((item) => React.createElement('tr', { key: item.country },
              React.createElement('td', null, item.country),
              React.createElement('td', null, formatValue(item.lastGdp)),
              React.createElement('td', null, item.growth ? `${item.growth.toFixed(2)}x` : 'n/a')
            ))
          )
        ),
        React.createElement('div', { className: 'gdp-widget-footer' }, 'Copy this widget code into another page or use the optional dataUrl to load your own GDP dataset.')
      )
    );
  }

  function resolveContainer(container) {
    if (typeof container === 'string') {
      return document.getElementById(container);
    }
    return container instanceof HTMLElement ? container : null;
  }

  function render(containerOrId, config) {
    injectStyles();
    ensureReact()
      .then(() => {
        const rootElement = resolveContainer(containerOrId);
        if (!rootElement) {
          console.error('GDP Widget: container not found', containerOrId);
          return;
        }

        if (!rootElement.__gdpWidgetRoot) {
          rootElement.__gdpWidgetRoot = window.ReactDOM.createRoot(rootElement);
        }

        rootElement.__gdpWidgetRoot.render(window.React.createElement(GdpWidgetApp, config || {}));
      })
      .catch((err) => {
        console.error('GDP Widget failed to load:', err);
      });
  }

  window.GdpWidget = { render };
})(window, document);
