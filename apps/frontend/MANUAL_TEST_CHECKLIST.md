# Vizora Dashboard Builder — Manual Test Checklist

## 1. Data Flow
- [ ] Create a new dashboard
- [ ] Add a BarChart widget
- [ ] Select a table via the combobox
- [ ] Select columns via the column combobox
- [ ] Verify data loads and renders in the chart

## 2. Filters
- [ ] Add a FilterControl widget
- [ ] Configure the filter column
- [ ] Navigate to Preview page
- [ ] Apply a filter value
- [ ] Verify widgets update based on filter

## 3. PropertyEditor — All Widget Types
- [ ] Select a BarChart widget — verify all properties are editable (title, table, columns, xAxis, yAxis, stacked, grouped)
- [ ] Select a LineChart widget — verify all properties are editable (title, table, columns, xAxis, yAxis, areaFill, smooth)
- [ ] Select a PieChart widget — verify all properties are editable (title, table, columns, nameKey, valueKey, donut, showLabels)
- [ ] Select a Table widget — verify all properties are editable (title, table, columns)
- [ ] Select a KPI widget — verify all properties are editable (title, label, format, trend, trendValue)
- [ ] Select a TextBlock widget — verify all properties are editable (title, content, fontSize, alignment)
- [ ] Verify changes in PropertyEditor affect widget rendering in real-time

## 4. PieChart Configuration
- [ ] Add a PieChart widget
- [ ] Configure nameKey and valueKey via column comboboxes
- [ ] Toggle donut mode — verify rendering switches between pie and donut
- [ ] Toggle showLabels — verify labels appear/disappear
- [ ] Set a title — verify it renders above the chart

## 5. LineChart — areaFill / smooth
- [ ] Add a LineChart widget with data
- [ ] Enable areaFill — verify chart renders as area chart with semi-transparent fill
- [ ] Enable smooth — verify curves change from monotone to natural
- [ ] Enable both — verify area chart with smooth curves
- [ ] Disable both — verify default line chart rendering

## 6. KpiCard — trend / trendValue
- [ ] Add a KPI widget with data
- [ ] Set trend to "up" — verify green up arrow displays
- [ ] Set trend to "down" — verify red down arrow displays
- [ ] Set trend to "neutral" — verify no trend indicator displays
- [ ] Set trendValue to "+12.5%" — verify value displays next to trend icon

## 7. Schema Autocomplete (Comboboxes)
- [ ] Click table combobox — verify tables load from API
- [ ] Type in search field — verify client-side filtering works
- [ ] Select a table — verify combobox closes and value updates
- [ ] Click column combobox — verify columns load for selected table
- [ ] Type in column search — verify filtering works
- [ ] Select a column — verify value updates
- [ ] Change table — verify column selections are cleared
- [ ] Test multi-select column combobox — verify multiple columns can be selected/deselected

## 8. Preview Page
- [ ] Click "Preview" button
- [ ] Verify read-only mode (no selection, no editing)
- [ ] Verify filters work in preview
- [ ] Click "Back to Editor" — verify navigation works

## 9. Migration (if old dashboards exist)
- [ ] Load an old dashboard (if available)
- [ ] Verify yAxis string → string[] migration works
- [ ] Verify alignment → align key migration works
- [ ] Verify all widgets render correctly after migration
