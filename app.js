const propertyData = [
  {
    id: 1,
    type: "buy",
    title: "Riverside Penthouse",
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2,
    location: "London, Canary Wharf",
    description: "Floor-to-ceiling windows with skyline views and a private terrace.",
    coordinates: [51.505, -0.02],
  },
  {
    id: 2,
    type: "rent",
    title: "City Centre Loft",
    price: 3200,
    bedrooms: 2,
    bathrooms: 2,
    location: "Manchester, Northern Quarter",
    description: "Converted warehouse loft with exposed brick and secure parking.",
    coordinates: [53.483959, -2.244644],
  },
  {
    id: 3,
    type: "buy",
    title: "Family Garden Home",
    price: 585000,
    bedrooms: 4,
    bathrooms: 3,
    location: "Bristol, Stoke Bishop",
    description: "Large south-facing garden, open-plan kitchen, and home office.",
    coordinates: [51.487, -2.626],
  },
  {
    id: 4,
    type: "rent",
    title: "Harbourfront Apartment",
    price: 2100,
    bedrooms: 2,
    bathrooms: 2,
    location: "Edinburgh, Leith",
    description: "Dual-aspect living space with balcony overlooking the water.",
    coordinates: [55.980, -3.169],
  },
  {
    id: 5,
    type: "buy",
    title: "Suburban Haven",
    price: 420000,
    bedrooms: 3,
    bathrooms: 2,
    location: "Surrey, Guildford",
    description: "Quiet cul-de-sac, newly refurbished kitchen, and EV-ready garage.",
    coordinates: [51.236, -0.57],
  },
  {
    id: 6,
    type: "rent",
    title: "Coastal Retreat",
    price: 1850,
    bedrooms: 3,
    bathrooms: 2,
    location: "Brighton, Kemptown",
    description: "Moments from the seafront with a sunlit conservatory and garden.",
    coordinates: [50.819, -0.135],
  },
];

const currencyFormat = (value, type) => {
  if (type === "rent") return `£${value.toLocaleString()}/mo`;
  return `£${value.toLocaleString()}`;
};

const template = document.getElementById("propertyCardTemplate");
const listEl = document.getElementById("propertyList");
const searchInput = document.getElementById("searchInput");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const bedroomsSelect = document.getElementById("bedrooms");
const typePills = document.querySelectorAll("[data-type]");
const viewPills = document.querySelectorAll("[data-view]");
const mapView = document.getElementById("mapView");
const listView = document.getElementById("listView");
const content = document.querySelector(".content");
const toggleThemeBtn = document.getElementById("toggleTheme");

let activeType = "all";
let activeView = "list";
let map;
let markersLayer;

function initMap() {
  map = L.map("map").setView([54.5, -3], 5.8);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function renderList(data) {
  listEl.innerHTML = "";
  const frag = document.createDocumentFragment();

  data.forEach((property) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".property-type").textContent = property.type === "buy" ? "For Sale" : "To Let";
    clone.querySelector(".price").textContent = currencyFormat(property.price, property.type);
    clone.querySelector(".title").textContent = property.title;
    clone.querySelector(".location").textContent = property.location;
    clone.querySelector(".details").textContent = `${property.bedrooms} bed \u2022 ${property.bathrooms} bath`;
    clone.querySelector(".description").textContent = property.description;
    frag.appendChild(clone);
  });

  listEl.appendChild(frag);
}

function renderMap(data) {
  markersLayer.clearLayers();

  data.forEach((property) => {
    const marker = L.marker(property.coordinates).addTo(markersLayer);
    marker.bindPopup(`
      <strong>${property.title}</strong><br />
      ${property.location}<br />
      ${currencyFormat(property.price, property.type)}
    `);
  });

  if (data.length) {
    const bounds = L.latLngBounds(data.map((p) => p.coordinates));
    map.fitBounds(bounds.pad(0.4));
  }
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const minPrice = Number(minPriceInput.value) || 0;
  const maxPrice = Number(maxPriceInput.value) || Infinity;
  const minBedrooms = Number(bedroomsSelect.value) || 0;

  const filtered = propertyData.filter((property) => {
    const matchesType = activeType === "all" || property.type === activeType;
    const matchesSearch =
      !searchTerm ||
      property.title.toLowerCase().includes(searchTerm) ||
      property.location.toLowerCase().includes(searchTerm) ||
      property.description.toLowerCase().includes(searchTerm);
    const matchesPrice = property.price >= minPrice && property.price <= maxPrice;
    const matchesBedrooms = property.bedrooms >= minBedrooms;
    return matchesType && matchesSearch && matchesPrice && matchesBedrooms;
  });

  renderList(filtered);
  renderMap(filtered);
  toggleViews(activeView);
}

function toggleViews(view) {
  activeView = view;
  listView.classList.toggle("hidden", view === "map");
  mapView.classList.toggle("hidden", view === "list");
  content.classList.toggle("split", view === "split");
  if (view !== "list") {
    setTimeout(() => map.invalidateSize(), 100);
  }
}

function setActivePill(nodeList, value, attr) {
  nodeList.forEach((pill) => {
    const isActive = pill.dataset[attr] === value;
    pill.classList.toggle("active", isActive);
  });
}

function bindEvents() {
  [searchInput, minPriceInput, maxPriceInput, bedroomsSelect].forEach((input) => {
    input.addEventListener("input", applyFilters);
  });

  typePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      activeType = pill.dataset.type;
      setActivePill(typePills, activeType, "type");
      applyFilters();
    });
  });

  viewPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const view = pill.dataset.view;
      setActivePill(viewPills, view, "view");
      toggleViews(view);
    });
  });

  toggleThemeBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
}

function init() {
  initMap();
  bindEvents();
  applyFilters();
}

document.addEventListener("DOMContentLoaded", init);
