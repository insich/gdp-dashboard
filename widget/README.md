# GDP React Widget

This folder contains a small embeddable React widget for displaying GDP data on another website.

## How to use

1. Copy `widget/gdp-widget.js` to your website or host it from a static location.
2. Add a container element where the widget should appear.
3. Call `GdpWidget.render()` with the container ID and optional configuration.

### Example

```html
<div id="gdp-widget-root"></div>
<script src="https://your-domain.com/gdp-widget.js"></script>
<script>
  GdpWidget.render('gdp-widget-root', {
    title: 'Global GDP widget',
    countries: ['DEU', 'FRA', 'GBR', 'BRA', 'MEX', 'JPN'],
    fromYear: 2018,
    toYear: 2022,
  });
</script>
```

## Global CDN link

Use this permanent CDN path to load the widget directly from GitHub:

```html
<script src="https://cdn.jsdelivr.net/gh/insich/gdp-dashboard@main/widget/gdp-widget.js"></script>
```

If you prefer the raw GitHub file URL instead, use:

```html
<script src="https://raw.githubusercontent.com/insich/gdp-dashboard/main/widget/gdp-widget.js"></script>
```

## Configuration options

- `title`: Widget title text.
- `countries`: Array of country codes to show by default.
- `fromYear`: Start year for the time range.
- `toYear`: End year for the time range.
- `api`: Optional URL to a CSV or JSON dataset.
- `data`: Optional JavaScript array of data rows.

## Data format

The widget understands both CSV and JSON.

### CSV format

The CSV must include at least these headers:

- `Country Code`
- `Year`
- `GDP`

The demo includes a sample data file at `widget/gdp-widget-data.csv`.

### Example `api`

Use a local or hosted CSV URL:

```js
GdpWidget.render('gdp-widget-root', {
  api: './gdp-widget-data.csv',
  countries: ['DEU', 'FRA', 'GBR', 'BRA', 'MEX', 'JPN'],
  fromYear: 2018,
  toYear: 2022,
});
```

Since the CSV is stored in the repo, you can also load it directly from GitHub raw:

```js
GdpWidget.render('gdp-widget-root', {
  api: 'https://raw.githubusercontent.com/insich/gdp-dashboard/main/widget/gdp-widget-data.csv',
  countries: ['DEU', 'FRA', 'GBR', 'BRA', 'MEX', 'JPN'],
});
```

### JSON format

The JSON must be an array of rows with keys like:

```json
[
  { "Country Code": "DEU", "Year": 2022, "GDP": 4333 },
  { "Country Code": "FRA", "Year": 2022, "GDP": 2847 }
]
```

## Demo

Open `widget/embed-demo.html` in a browser to see the widget in action with default sample data.
