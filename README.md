# Real-Estate-App

A ready-to-brand listings experience that estate agents can use out of the box. The app ships with side-by-side map and list views, buy/rent filters, and search controls. Everything is pure HTML/CSS/JS so you can drop it onto any static host.

## Quick start
1. Open `index.html` in your browser (or serve the folder with any static server).
2. Toggle between **List**, **Map**, and **Split** views to see available properties.
3. Use the search, price range, bedroom filter, and buy/rent pills to refine results.

## Customising branding
The theme is driven by CSS variables in `styles.css`:
```css
:root {
  --brand: #1a73e8;
  --brand-contrast: #0f4fa3;
  --bg: #f6f8fb;
  --surface: #ffffff;
  --text: #1f2937;
}
```
Update these to reflect your agency palette and typography. The header text (`Horizon Estates`) can be edited in `index.html`.

## Updating listings
All demo properties live in `app.js` as the `propertyData` array. Add or remove entries in the array to refresh what appears in both the list and map:
```js
{
  id: 7,
  type: "buy", // or "rent"
  title: "New Build",
  price: 350000,
  bedrooms: 2,
  bathrooms: 2,
  location: "City, Neighbourhood",
  description: "Key selling points",
  coordinates: [lat, lng],
}
```

## Notes
- The map uses OpenStreetMap tiles via Leaflet CDN; no additional setup required.
- A built-in dark theme toggle is available from the header.
- Filtering works across both views so the results remain in sync.
