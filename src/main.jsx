import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MapContainer, TileLayer, Circle, Marker, Popup, Polygon, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

// SVG Image Fallbacks for Disaster Cards
const defaultImages = {
  flood: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23051829'/><path d='M0 450 Q 200 380 400 450 T 800 450 L 800 600 L 0 600 Z' fill='%23194a7a'/><path d='M0 500 Q 200 450 400 500 T 800 500 L 800 600 L 0 600 Z' fill='%232264a3'/><text x='400' y='280' font-family='sans-serif' font-size='32' font-weight='bold' fill='%233896e0' text-anchor='middle'>FLOOD RESCUE INTELLIGENCE</text></svg>",
  landslide: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23051829'/><polygon points='0,600 300,200 500,450 800,150 800,600' fill='%231f3c5a'/><polygon points='150,600 450,300 800,600' fill='%232b537d'/><text x='400' y='280' font-family='sans-serif' font-size='32' font-weight='bold' fill='%23ffb733' text-anchor='middle'>LANDSLIDE RISK ANALYSIS</text></svg>",
  urban: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23051829'/><rect x='100' y='250' width='120' height='350' fill='%23142e4a'/><rect x='260' y='180' width='140' height='420' fill='%231c4066'/><rect x='440' y='300' width='110' height='300' fill='%23142e4a'/><rect x='580' y='220' width='130' height='380' fill='%231c4066'/><text x='400' y='120' font-family='sans-serif' font-size='32' font-weight='bold' fill='%233896e0' text-anchor='middle'>URBAN FLOODING MONITORING</text></svg>",
  responders: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='%23051829'/><circle cx='400' cy='300' r='180' fill='none' stroke='%2344d67c' stroke-width='4'/><circle cx='400' cy='300' r='100' fill='none' stroke='%2344d67c' stroke-width='2' stroke-dasharray='8,8'/><text x='400' y='308' font-family='sans-serif' font-size='32' font-weight='bold' fill='%2344d67c' text-anchor='middle'>EMERGENCY RESPONDERS</text></svg>"
};

// --- THEME SWITCHER COMPONENT ---
const THEMES = [
  { id: "dark", label: "Dark Command", icon: "◐" },
  { id: "light", label: "Light Command", icon: "☀" },
  { id: "high-contrast", label: "High Contrast", icon: "◉" }
];

function ThemeSwitcher({ currentTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div className="theme-switcher-wrapper" ref={dropdownRef}>
      <button
        className="theme-switcher-btn"
        onClick={() => setOpen(!open)}
        aria-label="Select theme mode"
        aria-haspopup="true"
        aria-expanded={open}
        title="Switch color theme"
      >
        <span>{activeThemeObj.icon}</span>
        <span>{activeThemeObj.label}</span>
      </button>

      {open && (
        <div className="theme-menu-popover" role="menu">
          {THEMES.map((theme) => {
            const isActive = theme.id === currentTheme;
            return (
              <button
                key={theme.id}
                role="menuitem"
                className={`theme-menu-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  onThemeChange(theme.id);
                  setOpen(false);
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{theme.icon}</span>
                  <span>{theme.label}</span>
                </span>
                {isActive && <span className="theme-check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- 1. RICH SCENARIO DATA ENGINE ---
const scenariosData = {
  "Flood — Mysuru": {
    name: "Flood — Mysuru",
    locationName: "Mysuru, Karnataka",
    mapCenter: [12.305, 76.655],
    mapZoom: 13,
    incidents: {
      "Village A": {
        name: "Village A",
        type: "Flood + Landslide",
        risk: "CRITICAL",
        hazardScore: 87,
        affected: 2140,
        population: 2840,
        priority: "IMMEDIATE",
        floodRisk: 92,
        landslideRisk: 41,
        rainfall: 187,
        roadAccess: "LIMITED",
        roadAccessRating: 40,
        center: [12.305, 76.655],
        recommendedSite: "Safe Site B",
        confidence: 96.4,
        explanation: "High flood runoff combined with steep slope saturation poses active landslide threats, blockading the main highway. Safe Site B provides elevated structural refuge away from slip paths.",
        whySite: [
          "Outside primary hazard zone",
          "Capacity sufficient (2,880 available)",
          "Road access clear",
          "Medical support nearby",
          "Water availability verified"
        ],
        vulnerability: { children: 412, elderly: 286, disability: 74, medical: 118 }
      },
      "Zone 7": {
        name: "Zone 7",
        type: "Urban Flooding",
        risk: "HIGH",
        hazardScore: 78,
        affected: 1850,
        population: 2500,
        priority: "IMMEDIATE",
        floodRisk: 84,
        landslideRisk: 15,
        rainfall: 142,
        roadAccess: "MODERATE",
        roadAccessRating: 60,
        center: [12.330, 76.665],
        recommendedSite: "Safe Site C",
        confidence: 91.2,
        explanation: "Low-lying urban sectors experiencing backflow from overflowing stormwater channels. Site C sits on high ground with immediate municipal supply lines.",
        whySite: [
          "Elevated city terrain",
          "Clear arterial road access",
          "Equipped first-aid medical bay",
          "Established food supply line",
          "Backup generator available"
        ],
        vulnerability: { children: 340, elderly: 210, disability: 52, medical: 85 }
      },
      "Sector 4": {
        name: "Sector 4",
        type: "Industrial Fire",
        risk: "HIGH",
        hazardScore: 72,
        affected: 980,
        population: 1500,
        priority: "IMMEDIATE",
        floodRisk: 10,
        landslideRisk: 5,
        rainfall: 25,
        roadAccess: "GOOD",
        roadAccessRating: 85,
        center: [12.290, 76.640],
        recommendedSite: "Safe Site D",
        confidence: 88.5,
        explanation: "Industrial chemical containment boundary expanding upwind. Site D sits clear of airborne smoke plume paths with open evacuation access.",
        whySite: [
          "Upwind of chemical containment zone",
          "Ample emergency housing units",
          "Direct dispatch connection",
          "High capacity water storage",
          "Dedicated medical triage tent"
        ],
        vulnerability: { children: 180, elderly: 110, disability: 28, medical: 42 }
      }
    },
    hazardZones: [
      { incident: "Village A", type: "polygon", severity: "CRITICAL", positions: [[12.31, 76.63], [12.34, 76.66], [12.31, 76.69], [12.28, 76.67], [12.29, 76.63]], color: "#ff5463" },
      { incident: "Village A", type: "circle", severity: "CRITICAL", center: [12.305, 76.655], radius: 1100, color: "#ff5463" },
      { incident: "Zone 7", type: "polygon", severity: "HIGH", positions: [[12.32, 76.64], [12.34, 76.68], [12.34, 76.65]], color: "#ffb733" },
      { incident: "Zone 7", type: "circle", severity: "HIGH", center: [12.330, 76.665], radius: 800, color: "#ffb733" },
      { incident: "Sector 4", type: "circle", severity: "MODERATE", center: [12.290, 76.640], radius: 700, color: "#3896e0" }
    ],
    safeSites: {
      "Safe Site B": { name: "Safe Site B", center: [12.322, 76.684], capacity: 3500, occupied: 620, available: 2880, distance: "4.2 km", hazardExposure: "LOW", roadAccess: "GOOD", medicalAccess: "YES", waterStatus: "VERIFIED" },
      "Safe Site C": { name: "Safe Site C", center: [12.345, 76.658], capacity: 2500, occupied: 800, available: 1700, distance: "3.1 km", hazardExposure: "LOW", roadAccess: "GOOD", medicalAccess: "YES", waterStatus: "VERIFIED" },
      "Safe Site D": { name: "Safe Site D", center: [12.282, 76.615], capacity: 1800, occupied: 450, available: 1350, distance: "2.8 km", hazardExposure: "MODERATE", roadAccess: "LIMITED", medicalAccess: "LIMITED", waterStatus: "PENDING" }
    },
    infrastructure: [
      { name: "District Hospital", category: "Hospital", center: [12.312, 76.671], icon: "🏥", abbrev: "H" },
      { name: "Mysuru North Police Station", category: "Police", center: [12.301, 76.662], icon: "👮", abbrev: "P" },
      { name: "Fire & Emergency Command", category: "Fire", center: [12.325, 76.645], icon: "🚒", abbrev: "F" },
      { name: "Govt Model School", category: "School", center: [12.298, 76.650], icon: "🏫", abbrev: "S" }
    ],
    evacuationRoutes: [
      { name: "Route R-04 (Village A → Site B)", incident: "Village A", positions: [[12.305, 76.655], [12.310, 76.668], [12.322, 76.684]], distance: "4.2 km", time: "11 min", status: "CLEAR", congestion: "LOW", hazardExposure: "LOW" },
      { name: "Route R-07 (Zone 7 → Site C)", incident: "Zone 7", positions: [[12.330, 76.665], [12.340, 76.660], [12.345, 76.658]], distance: "3.1 km", time: "8 min", status: "CLEAR", congestion: "LOW", hazardExposure: "LOW" }
    ],
    initialTimeline: [
      { time: "18:42", text: "Hazard threshold exceeded at Mysuru rainfall sensor.", type: "critical" },
      { time: "18:43", text: "Incident classified CRITICAL for Village A.", type: "critical" },
      { time: "18:44", text: "Vulnerability assessment completed (2,140 residents affected).", type: "info" },
      { time: "18:45", text: "AI recommended relocation to Safe Site B (Confidence 96.4%).", type: "info" }
    ]
  },
  "Urban Flood — Bengaluru": {
    name: "Urban Flood — Bengaluru",
    locationName: "Bengaluru, Karnataka",
    mapCenter: [12.935, 77.685],
    mapZoom: 13,
    incidents: {
      "Bellandur Layout": {
        name: "Bellandur Layout",
        type: "Lake Overflow",
        risk: "CRITICAL",
        hazardScore: 89,
        affected: 3420,
        population: 5000,
        priority: "IMMEDIATE",
        floodRisk: 95,
        landslideRisk: 5,
        rainfall: 210,
        roadAccess: "LIMITED",
        roadAccessRating: 35,
        center: [12.935, 77.685],
        recommendedSite: "Outer Ring Road Camp",
        confidence: 95.8,
        explanation: "Bellandur lake backflow and heavy urban runoff flooded ground level accesses up to 3 feet. Immediate relocation of ground floor residents required.",
        whySite: [
          "Elevated highway bypass location",
          "Dry conditions verified by field agents",
          "High capacity community facility",
          "Direct ambulance access",
          "Emergency ration distribution hub"
        ],
        vulnerability: { children: 650, elderly: 480, disability: 110, medical: 190 }
      },
      "HSR Sector 6": {
        name: "HSR Sector 6",
        type: "Storm Drain Overflow",
        risk: "HIGH",
        hazardScore: 76,
        affected: 1200,
        population: 2200,
        priority: "IMMEDIATE",
        floodRisk: 82,
        landslideRisk: 2,
        rainfall: 175,
        roadAccess: "MODERATE",
        roadAccessRating: 55,
        center: [12.915, 77.645],
        recommendedSite: "Stadium Shelter",
        confidence: 90.1,
        explanation: "Arterial storm drains choked. Relocating ground-level residents to elevated stadium grounds recommended.",
        whySite: [
          "Spacious dry stadium complex",
          "Double-lane road access",
          "Medical first-aid units available",
          "Dedicated power grid backup"
        ],
        vulnerability: { children: 220, elderly: 160, disability: 35, medical: 60 }
      }
    },
    hazardZones: [
      { incident: "Bellandur Layout", type: "circle", severity: "CRITICAL", center: [12.935, 77.685], radius: 1200, color: "#ff5463" },
      { incident: "HSR Sector 6", type: "circle", severity: "HIGH", center: [12.915, 77.645], radius: 800, color: "#ffb733" }
    ],
    safeSites: {
      "Outer Ring Road Camp": { name: "Outer Ring Road Camp", center: [12.952, 77.702], capacity: 4000, occupied: 1200, available: 2800, distance: "2.5 km", hazardExposure: "LOW", roadAccess: "GOOD", medicalAccess: "YES", waterStatus: "VERIFIED" },
      "Stadium Shelter": { name: "Stadium Shelter", center: [12.910, 77.625], capacity: 3000, occupied: 500, available: 2500, distance: "3.2 km", hazardExposure: "LOW", roadAccess: "GOOD", medicalAccess: "YES", waterStatus: "VERIFIED" }
    },
    infrastructure: [
      { name: "Sakra World Hospital", category: "Hospital", center: [12.932, 77.698], icon: "🏥", abbrev: "H" },
      { name: "HSR Layout Police Station", category: "Police", center: [12.911, 77.640], icon: "👮", abbrev: "P" },
      { name: "Bellandur Fire Unit", category: "Fire", center: [12.940, 77.675], icon: "🚒", abbrev: "F" },
      { name: "National Public School", category: "School", center: [12.925, 77.650], icon: "🏫", abbrev: "S" }
    ],
    evacuationRoutes: [
      { name: "Route B-01 (Bellandur → ORR Camp)", incident: "Bellandur Layout", positions: [[12.935, 77.685], [12.945, 77.695], [12.952, 77.702]], distance: "2.5 km", time: "10 min", status: "CLEAR", congestion: "MODERATE", hazardExposure: "LOW" },
      { name: "Route B-02 (HSR → Stadium)", incident: "HSR Sector 6", positions: [[12.915, 77.645], [12.912, 77.632], [12.910, 77.625]], distance: "3.2 km", time: "12 min", status: "CLEAR", congestion: "LOW", hazardExposure: "LOW" }
    ],
    initialTimeline: [
      { time: "17:10", text: "Bellandur Lake water sensor reached threshold 2.8m.", type: "critical" },
      { time: "17:15", text: "Urban flood alert dispatched for Bellandur Layout.", type: "critical" },
      { time: "17:20", text: "AI recommendation generated for Outer Ring Road Camp.", type: "info" }
    ]
  },
  "Landslide — Kodagu": {
    name: "Landslide — Kodagu",
    locationName: "Kodagu, Karnataka",
    mapCenter: [12.424, 75.738],
    mapZoom: 13,
    incidents: {
      "Makkandur Slip": {
        name: "Makkandur Slip",
        type: "Debris Flow / Landslide",
        risk: "CRITICAL",
        hazardScore: 94,
        affected: 850,
        population: 1200,
        priority: "IMMEDIATE",
        floodRisk: 10,
        landslideRisk: 98,
        rainfall: 280,
        roadAccess: "LIMITED",
        roadAccessRating: 25,
        center: [12.424, 75.738],
        recommendedSite: "Madikeri Town Hall",
        confidence: 97.2,
        explanation: "Unprecedented hill slope shear stress registered. Soil moisture saturation at 98%. Immediate evacuation of hillside settlements required.",
        whySite: [
          "Solid rock bed foundation",
          "Clear of slope debris trajectory",
          "Direct access to District Hospital",
          "High capacity shelter hall",
          "Equipped satellite communications"
        ],
        vulnerability: { children: 160, elderly: 130, disability: 30, medical: 45 }
      }
    },
    hazardZones: [
      { incident: "Makkandur Slip", type: "polygon", severity: "CRITICAL", positions: [[12.41, 75.72], [12.44, 75.75], [12.42, 75.76], [12.41, 75.72]], color: "#ff5463" }
    ],
    safeSites: {
      "Madikeri Town Hall": { name: "Madikeri Town Hall", center: [12.420, 75.742], capacity: 1500, occupied: 300, available: 1200, distance: "1.8 km", hazardExposure: "LOW", roadAccess: "GOOD", medicalAccess: "YES", waterStatus: "VERIFIED" }
    },
    infrastructure: [
      { name: "Madikeri General Hospital", category: "Hospital", center: [12.422, 75.740], icon: "🏥", abbrev: "H" },
      { name: "Town Police Station", category: "Police", center: [12.418, 75.735], icon: "👮", abbrev: "P" },
      { name: "Kodagu Rescue Base", category: "Fire", center: [12.425, 75.745], icon: "🚒", abbrev: "F" }
    ],
    evacuationRoutes: [
      { name: "Route K-01 (Makkandur → Town Hall)", incident: "Makkandur Slip", positions: [[12.424, 75.738], [12.420, 75.742]], distance: "1.8 km", time: "9 min", status: "CLEAR", congestion: "LOW", hazardExposure: "LOW" }
    ],
    initialTimeline: [
      { time: "16:05", text: "Soil saturation sensor triggered 98% warning.", type: "critical" },
      { time: "16:10", text: "Debris slip detected near Makkandur village road.", type: "critical" },
      { time: "16:15", text: "Madikeri Town Hall designated primary safe site.", type: "info" }
    ]
  },
  "Industrial Fire — Peenya": {
    name: "Industrial Fire — Peenya",
    locationName: "Peenya, Bengaluru, Karnataka",
    mapCenter: [13.031, 77.518],
    mapZoom: 13,
    incidents: {
      "Peenya Phase II": {
        name: "Peenya Phase II",
        type: "Chemical Tank Explosion",
        risk: "CRITICAL",
        hazardScore: 92,
        affected: 4200,
        population: 6000,
        priority: "IMMEDIATE",
        floodRisk: 2,
        landslideRisk: 1,
        rainfall: 0,
        roadAccess: "GOOD",
        roadAccessRating: 80,
        center: [13.031, 77.518],
        recommendedSite: "Jnanabharathi Camp",
        confidence: 94.5,
        explanation: "Toxic chemical plume spreading downwind. Sited upwind camp chosen to prevent inhalation hazards.",
        whySite: [
          "Safely upwind of industrial plume",
          "Large capacity open grounds",
          "Medical field triage ready",
          "Direct highway connectivity"
        ],
        vulnerability: { children: 820, elderly: 540, disability: 140, medical: 230 }
      }
    },
    hazardZones: [
      { incident: "Peenya Phase II", type: "circle", severity: "CRITICAL", center: [13.031, 77.518], radius: 1000, color: "#ff5463" }
    ],
    safeSites: {
      "Jnanabharathi Camp": { name: "Jnanabharathi Camp", center: [12.980, 77.502], capacity: 5000, occupied: 1500, available: 3500, distance: "6.2 km", hazardExposure: "LOW", roadAccess: "GOOD", medicalAccess: "YES", waterStatus: "VERIFIED" }
    },
    infrastructure: [
      { name: "Fortis Hospital Peenya", category: "Hospital", center: [13.001, 77.545], icon: "🏥", abbrev: "H" },
      { name: "Peenya Police Command", category: "Police", center: [13.025, 77.525], icon: "👮", abbrev: "P" },
      { name: "Hazmat Fire Unit", category: "Fire", center: [13.035, 77.510], icon: "🚒", abbrev: "F" }
    ],
    evacuationRoutes: [
      { name: "Route P-01 (Peenya → Jnanabharathi)", incident: "Peenya Phase II", positions: [[13.031, 77.518], [13.001, 77.508], [12.980, 77.502]], distance: "6.2 km", time: "18 min", status: "CLEAR", congestion: "MODERATE", hazardExposure: "LOW" }
    ],
    initialTimeline: [
      { time: "15:20", text: "Chemical storage pressure threshold breach detected.", type: "critical" },
      { time: "15:25", text: "Industrial hazmat alarm triggered in Peenya Phase II.", type: "critical" },
      { time: "15:30", text: "Jnanabharathi Camp initialized as upwind shelter.", type: "info" }
    ]
  },
  "Cyclone — Udupi": {
    name: "Cyclone — Udupi",
    locationName: "Udupi, Coastal Karnataka",
    mapCenter: [13.342, 74.685],
    mapZoom: 13,
    incidents: {
      "Malpe Harbour": {
        name: "Malpe Harbour",
        type: "Storm Surge / Cyclone",
        risk: "CRITICAL",
        hazardScore: 96,
        affected: 3100,
        population: 4500,
        priority: "IMMEDIATE",
        floodRisk: 98,
        landslideRisk: 5,
        rainfall: 245,
        roadAccess: "LIMITED",
        roadAccessRating: 30,
        center: [13.342, 74.685],
        recommendedSite: "Udupi Sports Complex",
        confidence: 96.8,
        explanation: "Severe cyclone storm surge pushing 2.5m seawater inland. Evacuate all low-lying coastal structures immediately.",
        whySite: [
          "Inland elevated terrain (6.5 km from coast)",
          "Concrete storm-proof construction",
          "Dedicated emergency food store",
          "Generator & satellite backup"
        ],
        vulnerability: { children: 580, elderly: 420, disability: 95, medical: 160 }
      }
    },
    hazardZones: [
      { incident: "Malpe Harbour", type: "polygon", severity: "CRITICAL", positions: [[13.33, 74.67], [13.36, 74.67], [13.35, 74.70], [13.32, 74.69]], color: "#ff5463" }
    ],
    safeSites: {
      "Udupi Sports Complex": { name: "Udupi Sports Complex", center: [13.345, 74.745], capacity: 4000, occupied: 1100, available: 2900, distance: "6.5 km", hazardExposure: "LOW", roadAccess: "GOOD", medicalAccess: "YES", waterStatus: "VERIFIED" }
    },
    infrastructure: [
      { name: "Adarsha Hospital Udupi", category: "Hospital", center: [13.343, 74.749], icon: "🏥", abbrev: "H" },
      { name: "Malpe Marine Police", category: "Police", center: [13.340, 74.690], icon: "👮", abbrev: "P" },
      { name: "Coastal Rescue Unit", category: "Fire", center: [13.350, 74.700], icon: "🚒", abbrev: "F" }
    ],
    evacuationRoutes: [
      { name: "Route C-01 (Malpe → Sports Complex)", incident: "Malpe Harbour", positions: [[13.342, 74.685], [13.345, 74.745]], distance: "6.5 km", time: "14 min", status: "CLEAR", congestion: "MODERATE", hazardExposure: "LOW" }
    ],
    initialTimeline: [
      { time: "14:00", text: "IMD Cyclone alert issued for Coastal Karnataka.", type: "critical" },
      { time: "14:15", text: "Malpe Harbour tide gauge registered +2.2m surge.", type: "critical" },
      { time: "14:30", text: "Udupi Sports Complex activated for coastal evacuation.", type: "info" }
    ]
  }
};

// Custom Leaflet Icons
const createRiskIcon = (isCritical) => new L.DivIcon({
  className: `custom-marker risk ${isCritical ? "critical" : ""}`,
  html: '<div style="font-size:12px; margin-top:2px;">⚠️</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const createSafeIcon = (isSelected) => new L.DivIcon({
  className: `custom-marker safe ${isSelected ? "selected" : ""}`,
  html: '<div style="font-size:12px; margin-top:2px;">🏠</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const createInfraIcon = (iconText) => new L.DivIcon({
  className: "custom-marker infra",
  html: `<div style="font-size:12px; margin-top:2px;">${iconText}</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

// --- 2. LANDING PAGE COMPONENT ---
function LandingPage({ onEnter, currentTheme, onThemeChange }) {
  return (
    <div className="landing-page">
      <div className="sensor-nodes-container">
        <div className="sensor-node" style={{ top: "15%", left: "12%" }}></div>
        <div className="sensor-node red" style={{ top: "35%", left: "45%" }}></div>
        <div className="sensor-node green" style={{ top: "65%", left: "22%" }}></div>
        <div className="sensor-node" style={{ top: "80%", left: "75%" }}></div>
        <div className="sensor-node red" style={{ top: "25%", left: "70%" }}></div>
        <div className="sensor-node green" style={{ top: "50%", left: "85%" }}></div>
      </div>
      <div className="hero-radial-glow"></div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo-container">
          <div className="landing-logo">
            🛡️ JANRAKSHAK
          </div>
          <div className="landing-logo-sub">DISASTER INTELLIGENCE PLATFORM • SIH26191 PROTOTYPE</div>
        </div>
        <div className="landing-nav-links">
          <a href="#platform" className="landing-nav-link">Overview</a>
          <a href="#how-it-works" className="landing-nav-link">Pipeline</a>
          <a href="#intelligence" className="landing-nav-link">Capabilities</a>
          <a href="#about" className="landing-nav-link">Governance</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
          <div className="landing-nav-status">
            <span></span>SYSTEM OPERATIONAL
          </div>
          <button className="landing-nav-btn" onClick={onEnter}>
            ENTER COMMAND CENTER &rarr;
          </button>
        </div>
      </nav>

      {/* Balanced 2-Column Hero Section */}
      <section className="landing-hero" id="platform">
        <div className="hero-left">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--accent-info)", background: "var(--accent-info-bg)", border: "1px solid var(--accent-info-border)", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase" }}>
              ● SYSTEM OPERATIONAL
            </span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--accent-warning)", background: "var(--accent-warning-bg)", border: "1px solid var(--accent-warning-border)", padding: "4px 10px", borderRadius: "6px" }}>
              SIH26191 PROTOTYPE
            </span>
          </div>

          <h1>AI-POWERED GEOSPATIAL DISASTER INTELLIGENCE</h1>
          <h2>
            FROM RED ZONE<br />
            <span style={{ color: "var(--accent-success)" }}>TO SAFE ZONE.</span>
          </h2>
          <p>
            JanRakshak empowers disaster management authorities with real-time geospatial risk modeling, AI safe-site recommendation explainability, and offline operational resilience during critical emergencies.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={onEnter}>
              ENTER COMMAND CENTER &rarr;
            </button>
            <a href="#how-it-works" className="hero-btn-secondary">
              EXPLORE CAPABILITIES
            </a>
          </div>
          <div className="hero-bullet-indicators">
            <div className="hero-bullet-indicator">🔔 Early Warning</div>
            <div className="hero-bullet-indicator">🤖 AI-Assisted Decisions</div>
            <div className="hero-bullet-indicator">⚡ Rapid Evacuation</div>
            <div className="hero-bullet-indicator">🔌 Works Offline</div>
          </div>
        </div>
        
        {/* Right Column: Miniature GIS Radar Canvas */}
        <div className="hero-visual-gis">
          <div className="gis-header">
            <span>LIVE GEOSPATIAL COMMAND RADAR</span>
            <span className="live-indicator">
              <span className="pulse-dot"></span>LIVE
            </span>
          </div>
          
          <div className="gis-grid"></div>
          <div className="gis-radar-ring r1"></div>
          <div className="gis-radar-ring r2"></div>
          <div className="gis-radar-ring r3"></div>
          <div className="gis-scanner"></div>
          
          <div className="gis-marker red" style={{ top: "160px", left: "140px" }}></div>
          <div className="gis-marker green" style={{ top: "250px", left: "270px" }}></div>
          <div className="gis-marker blue" style={{ top: "100px", left: "260px" }}></div>
          
          <div className="gis-label red-lbl" style={{ top: "115px", left: "55px" }}>RED HAZARD ZONE • 87/100</div>
          <div className="gis-label red-lbl" style={{ top: "185px", left: "120px" }}>2,140 PEOPLE AT RISK</div>
          <div className="gis-label green-lbl" style={{ top: "275px", left: "215px" }}>SAFE SITE B • 2,880 Capacity</div>
          <div className="gis-label blue-lbl" style={{ top: "70px", left: "210px" }}>DISTRICT HOSPITAL</div>
          
          <div className="gis-footer">
            <span>GIS SCENARIO RADAR • ACTIVE</span>
            <span>CRITICAL INFRASTRUCTURE ONLINE</span>
          </div>
        </div>
      </section>

      {/* Capability Cards Strip */}
      <section className="capability-section" id="intelligence">
        <div className="capability-grid">
          <div className="capability-card">
            <div className="capability-icon">📡</div>
            <h5>EARLY WARNING</h5>
            <p>Identify emerging hazard zones through sensor telemetry and multi-hazard data layers.</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🤖</div>
            <h5>AI-ASSISTED DECISIONS</h5>
            <p>Turn complex geospatial layers into clear safe site recommendations with explainable decision checkpoints.</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">⚡</div>
            <h5>RAPID EVACUATION</h5>
            <p>Coordinate clear evacuation routes, road status, and carrying capacity for vulnerable communities.</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🔌</div>
            <h5>OFFLINE RESILIENCE</h5>
            <p>Continue critical decision-support processes seamlessly during network failure and degraded connectivity.</p>
          </div>
        </div>
      </section>

      {/* Disaster Modules Strip */}
      <section className="disaster-strip-section">
        <div className="disaster-grid">
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
                alt="Flood Rescue"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultImages.flood; }}
              />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">01</span>
            </div>
            <div className="disaster-intel-info">
              <h5>FLOOD RESCUE</h5>
              <p>Rapid identification of submerged sectors and relocation priorities.</p>
            </div>
          </div>
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1599740831666-415c89893d87?auto=format&fit=crop&w=800&q=80"
                alt="Landslide Response"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultImages.landslide; }}
              />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">02</span>
            </div>
            <div className="disaster-intel-info">
              <h5>LANDSLIDE RESPONSE</h5>
              <p>Terrain slope shear stress intelligence for vulnerable mountain regions.</p>
            </div>
          </div>
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
                alt="Urban Flooding"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultImages.urban; }}
              />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">03</span>
            </div>
            <div className="disaster-intel-info">
              <h5>URBAN FLOODING</h5>
              <p>Storm drain backflow monitoring and population exposure analysis.</p>
            </div>
          </div>
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1578357074759-38389e80ac5a?auto=format&fit=crop&w=800&q=80"
                alt="Emergency Responders"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultImages.responders; }}
              />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">04</span>
            </div>
            <div className="disaster-intel-info">
              <h5>EMERGENCY RESPONDERS</h5>
              <p>Coordinate active response teams, essential resources, and safe routes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Pipeline */}
      <section className="how-works-section" id="how-it-works">
        <div className="section-header" style={{ textAlign: "center", marginBottom: "48px" }}>
          <h3>Operational Pipeline</h3>
          <h4>How JanRakshak Works</h4>
        </div>
        <div style={{ position: "relative" }}>
          <div className="how-works-line"></div>
          <div className="how-works-grid">
            <div className="how-works-card">
              <div className="how-works-circle">01</div>
              <div className="how-works-title">DETECT</div>
              <div className="how-works-desc">Monitor rainfall, soil moisture, river levels, and incident signals in real-time.</div>
            </div>
            <div className="how-works-card">
              <div className="how-works-circle">02</div>
              <div className="how-works-title">ANALYZE</div>
              <div className="how-works-desc">Combine geospatial layers and vulnerability data to compute composite risk scores.</div>
            </div>
            <div className="how-works-card">
              <div className="how-works-circle">03</div>
              <div className="how-works-title">PRIORITIZE</div>
              <div className="how-works-desc">Identify vulnerable demographics and recommend safe site destinations with clear decision explainability.</div>
            </div>
            <div className="how-works-card">
              <div className="how-works-circle">04</div>
              <div className="how-works-title">RESPOND</div>
              <div className="how-works-desc">Dispatch authority alerts, open evacuation plans, and coordinate volunteer relief teams.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Strip */}
      <section className="impact-strip">
        <div className="impact-content">
          <div className="impact-title">
            SIMULATED DEMO METRICS
          </div>
          <div className="impact-metrics">
            <div className="impact-metric"><b className="red">05</b><span>ACTIVE RED ZONES</span></div>
            <div className="impact-metric"><b className="blue">2,140</b><span>PEOPLE AT RISK</span></div>
            <div className="impact-metric"><b className="green">12</b><span>SAFE SITES AVAILABLE</span></div>
            <div className="impact-metric"><b className="blue">18</b><span>EVACUATION ROUTES</span></div>
          </div>
        </div>
      </section>

      {/* Resilience Banner */}
      <section className="resilience-section" id="about">
        <div className="resilience-banner-panel">
          <div className="resilience-left">
            <h4>DESIGNED FOR DEGRADED CONNECTIVITY</h4>
            <p>Cached map layers, queued emergency updates, and automatic synchronization when network connection is restored.</p>
          </div>
          <div className="resilience-status">
            <span></span>● OFFLINE MODE READY
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h4>🛡️ JANRAKSHAK</h4>
            <p>AI-powered geospatial disaster intelligence platform • SIH26191 Prototype.</p>
          </div>
          <div className="footer-column">
            <h5>Platform</h5>
            <a href="#platform">Overview</a>
            <a href="#intelligence">Capabilities</a>
          </div>
          <div className="footer-column">
            <h5>Workflow</h5>
            <a href="#how-it-works">Pipeline</a>
            <a href="#about">Governance</a>
          </div>
          <div className="footer-column">
            <h5>Command Center</h5>
            <a href="#platform" onClick={(e) => { e.preventDefault(); onEnter(); }}>Enter Console</a>
          </div>
        </div>
        <div className="footer-disclaimer">
          <span>© 2026 JanRakshak • SIH Problem Statement SIH26191</span>
          <span>AI-assisted decision-support prototype • Authorized personnel must validate consequential actions.</span>
        </div>
      </footer>
    </div>
  );
}

// --- 3. MAIN DASHBOARD COMPONENT ---
function App() {
  const [view, setView] = useState(() => window.location.hash === "#/dashboard" ? "dashboard" : "landing");

  // Global Theme State with Persistence
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("janrakshak_theme") || "dark";
    } catch (e) {
      return "dark";
    }
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("janrakshak_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch (e) {}
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => setView(window.location.hash === "#/dashboard" ? "dashboard" : "landing");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateToDashboard = () => {
    window.location.hash = "/dashboard";
    setView("dashboard");
  };

  // Scenario Selector State
  const [scenarioName, setScenarioName] = useState("Flood — Mysuru");
  const activeScenario = scenariosData[scenarioName] || scenariosData["Flood — Mysuru"];

  // Selected Incident State
  const [selected, setSelected] = useState(() => Object.keys(activeScenario.incidents)[0]);
  
  // Offline & Queued Events State
  const [offline, setOffline] = useState(false);
  const [queuedEvents, setQueuedEvents] = useState(0);

  // Modals & UI States
  const [activeModal, setActiveModal] = useState(null);
  const [alertsCount, setAlertsCount] = useState(12);
  const [evacuationActive, setEvacuationActive] = useState(false);
  const [deployedNgos, setDeployedNgos] = useState([]);
  const [coordinatedNeeds, setCoordinatedNeeds] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Map Toggles & Filter State
  const [showHazards, setShowHazards] = useState(true);
  const [showSafeSites, setShowSafeSites] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showInfra, setShowInfra] = useState(true);
  const [infraCategoryFilter, setInfraCategoryFilter] = useState(null);

  // Map Navigation State
  const [customCenter, setCustomCenter] = useState(null);
  const [customZoom, setCustomZoom] = useState(null);

  // AI Recommendation Override State
  const [selectedSiteName, setSelectedSiteName] = useState(null);

  // Timestamps & Timeline State
  const [dispatchedTimestamp, setDispatchedTimestamp] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [activities, setActivities] = useState(activeScenario.initialTimeline || []);

  // --- WHAT-IF SCENARIO SIMULATION STATE ---
  const currentIncident = activeScenario.incidents[selected] || activeScenario.incidents[Object.keys(activeScenario.incidents)[0]];
  
  const [simRainfall, setSimRainfall] = useState(currentIncident.rainfall);
  const [simFloodRisk, setSimFloodRisk] = useState(currentIncident.floodRisk);
  const [simLandslideRisk, setSimLandslideRisk] = useState(currentIncident.landslideRisk);
  const [simRoadAccess, setSimRoadAccess] = useState(currentIncident.roadAccessRating || 40);
  const [simActive, setSimActive] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Live Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toTimeString().split(" ")[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset local state when selected incident or scenario changes
  useEffect(() => {
    setCustomCenter(null);
    setCustomZoom(null);
    setSelectedSiteName(null);
    setDispatchedTimestamp(null);
    setEvacuationActive(false);
    setSimActive(false);
    setSimResult(null);
  }, [selected, scenarioName]);

  // Sync state when scenario changes
  useEffect(() => {
    const incidentKeys = Object.keys(activeScenario.incidents);
    const firstIncKey = incidentKeys[0];
    setSelected(firstIncKey);
    const incObj = activeScenario.incidents[firstIncKey];
    setSimRainfall(incObj.rainfall);
    setSimFloodRisk(incObj.floodRisk);
    setSimLandslideRisk(incObj.landslideRisk);
    setSimRoadAccess(incObj.roadAccessRating || 40);
    setActivities(activeScenario.initialTimeline || []);
    addActivityLog(`Scenario loaded: ${activeScenario.name}`, "info");
    showToast(`Loaded scenario: ${activeScenario.name}`, "info");
  }, [scenarioName]);

  // Sync simulation sliders when selected incident changes
  useEffect(() => {
    setSimRainfall(currentIncident.rainfall);
    setSimFloodRisk(currentIncident.floodRisk);
    setSimLandslideRisk(currentIncident.landslideRisk);
    setSimRoadAccess(currentIncident.roadAccessRating || 40);
  }, [selected]);

  // Dynamic Hazard Calculations
  const displayHazardScore = simActive && simResult ? simResult.simScore : currentIncident.hazardScore;
  const displayThreatLevel = simActive && simResult ? simResult.simThreatLevel : currentIncident.risk;
  const displayPriority = simActive && simResult ? simResult.simPriority : currentIncident.priority;
  const displayFloodRisk = simActive ? simFloodRisk : currentIncident.floodRisk;
  const displayLandslideRisk = simActive ? simLandslideRisk : currentIncident.landslideRisk;
  const displayRainfall = simActive ? simRainfall : currentIncident.rainfall;

  const mapCenter = currentIncident.center;
  const recommendedSite = activeScenario.safeSites[selectedSiteName || (simResult && simResult.altSiteSuggested ? Object.keys(activeScenario.safeSites)[1] || currentIncident.recommendedSite : currentIncident.recommendedSite)] || Object.values(activeScenario.safeSites)[0];
  const activeEvacRoute = activeScenario.evacuationRoutes.find(r => r.incident === selected) || activeScenario.evacuationRoutes[0];

  const addActivityLog = (text, type = "info") => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setActivities((prev) => [{ time: timeStr, text, type }, ...prev]);
    if (offline) {
      setQueuedEvents((prev) => prev + 1);
    }
  };

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const closeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Simulation Logic
  const handleRunSimulation = () => {
    const simScore = Math.min(100, Math.max(0, Math.round((simFloodRisk * 0.45) + (simLandslideRisk * 0.35) + ((simRainfall / 300) * 20))));
    const simThreatLevel = simScore >= 80 ? "CRITICAL" : simScore >= 60 ? "HIGH" : "MODERATE";
    const simPriority = simScore >= 75 ? "IMMEDIATE" : "MONITOR";
    const escalated = simScore > currentIncident.hazardScore + 3;
    const altSiteSuggested = simRoadAccess < 30 || simFloodRisk > 92;

    setSimResult({ simScore, simThreatLevel, simPriority, escalated, altSiteSuggested });
    setSimActive(true);
    addActivityLog(`[SIMULATION] Parameters executed: Rain ${simRainfall}mm, Risk Score updated to ${simScore}/100.`, "sim");
    showToast(`Simulation complete: Risk Score updated to ${simScore}/100`, "info");
  };

  const handleResetSimulation = () => {
    setSimActive(false);
    setSimResult(null);
    setSimRainfall(currentIncident.rainfall);
    setSimFloodRisk(currentIncident.floodRisk);
    setSimLandslideRisk(currentIncident.landslideRisk);
    setSimRoadAccess(currentIncident.roadAccessRating || 40);
    addActivityLog(`[SIMULATION] Parameters reset to baseline.`, "info");
    showToast(`Simulation parameters reset to baseline.`, "info");
  };

  const deployNgo = (name) => {
    setDeployedNgos((prev) => [...prev, name]);
    addActivityLog(`Emergency team deployed: ${name}`, "info");
    showToast(`${name} deployed successfully.`, "success");
  };

  const coordinateNeed = (name) => {
    setCoordinatedNeeds((prev) => [...prev, name]);
    addActivityLog(`Relief supply coordinated: ${name}`, "info");
    showToast(`${name} marked as coordinated.`, "success");
  };

  const handleDispatchAlerts = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setDispatchedTimestamp(timeStr);
    setAlertsCount(16);
    addActivityLog(`Emergency alerts dispatched to DDMA, Police, Medical & Volunteers for ${selected}.`, "critical");
    showToast("Authority alerts dispatched successfully.", "success");
  };

  const handleStartEvacuation = () => {
    setEvacuationActive(true);
    addActivityLog(`Evacuation protocol activated for ${selected} → ${recommendedSite.name}`, "critical");
    showToast("Evacuation plan activated successfully.", "success");
  };

  const handleToggleOffline = () => {
    if (offline) {
      setOffline(false);
      showToast(`CONNECTION RESTORED — Synchronized ${queuedEvents} queued events`, "success");
      addActivityLog(`Connection restored. Synchronized ${queuedEvents} offline events.`, "info");
      setQueuedEvents(0);
    } else {
      setOffline(true);
      showToast("Offline / Degraded Connectivity Mode Activated", "info");
      addActivityLog("Network failure simulated. Degraded mode active.", "critical");
    }
  };

  if (view === "landing") {
    return <LandingPage onEnter={navigateToDashboard} currentTheme={theme} onThemeChange={handleThemeChange} />;
  }

  return (
    <div className="app">
      {/* Dashboard Top Header */}
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer", padding: 0 }} onClick={() => { window.location.hash = "/"; setView("landing"); }}>
            &larr; MAIN PAGE
          </button>
          <div style={{ height: "20px", width: "1px", background: "var(--border-primary)" }}></div>
          <div>
            <div className="brand">🛡️ JANRAKSHAK</div>
            <div className="tagline">DISASTER INTELLIGENCE PLATFORM • SIH26191 PROTOTYPE</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
          
          <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>
            OPERATOR: <strong style={{ color: "var(--text-primary)" }}>COMMANDER 01</strong>
          </div>
          
          <div className="header-actions">
            <span className={"status " + (offline ? "offline" : "online")}>
              {offline ? "● OFFLINE MODE" : "● SYSTEM ONLINE"}
            </span>
            <button onClick={handleToggleOffline}>{offline ? "Restore Network" : "Simulate Network Failure"}</button>
          </div>
        </div>
      </header>

      {/* Active Incident Horizontal Command Bar */}
      <div className="command-status-bar">
        <div className="command-status-left">
          <div className={`status-badge ${offline ? "degraded" : "operational"}`}>
            <span>●</span> {offline ? "DEGRADED CONNECTIVITY" : "SYSTEM OPERATIONAL"}
          </div>
          <div>SCENARIO: <strong style={{ color: "var(--text-primary)" }}>{activeScenario.name}</strong></div>
          <div>INCIDENT: <strong style={{ color: "var(--text-primary)" }}>{selected}</strong></div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            THREAT LEVEL:
            <span className={`threat-pill ${displayThreatLevel === "CRITICAL" ? "critical" : displayThreatLevel === "HIGH" ? "high" : "moderate"}`}>
              {displayThreatLevel}
            </span>
          </div>
        </div>

        <div className="command-status-right">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="scenario-select" style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)" }}>SELECT SCENARIO:</label>
            <select
              id="scenario-select"
              className="scenario-select"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            >
              {Object.keys(scenariosData).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>LAST SYNC: <strong style={{ color: "var(--text-primary)" }}>{lastUpdated}</strong></div>
          {offline && (
            <span style={{ color: "var(--accent-warning)", fontWeight: "800" }}>
              QUEUED: {queuedEvents}
            </span>
          )}
        </div>
      </div>

      {/* KPI Intelligence Strip */}
      <section className="stats">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">ACTIVE RED ZONES</span>
            <span className="kpi-trend">CRITICAL</span>
          </div>
          <div className="kpi-value red">05</div>
          <div className="kpi-subtext">Multi-hazard spatial buffers</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">PEOPLE AT RISK</span>
            <span className="kpi-trend">+18% vs prev assessment</span>
          </div>
          <div className="kpi-value red">{currentIncident.affected.toLocaleString()}</div>
          <div className="kpi-subtext">Inside high hazard exposure radius</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">SAFE SITES AVAILABLE</span>
            <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--accent-success)", background: "var(--accent-success-bg)", padding: "2px 6px", borderRadius: "4px" }}>OPERATIONAL</span>
          </div>
          <div className="kpi-value green">{`0${Object.keys(activeScenario.safeSites).length}`}</div>
          <div className="kpi-subtext">Capacity & water supply verified</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">EVACUATION ROUTES</span>
            <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--accent-info)", background: "var(--accent-info-bg)", padding: "2px 6px", borderRadius: "4px" }}>MONITOR</span>
          </div>
          <div className="kpi-value blue">{`0${activeScenario.evacuationRoutes.length}`}</div>
          <div className="kpi-subtext">Active road status monitored</div>
        </div>
      </section>

      {/* Main Command Dashboard Grid */}
      <main className="grid">
        {/* Left Column */}
        <aside className="left">
          {/* Active Incidents Panel */}
          <div className="panel">
            <div className="panel-title">ACTIVE INCIDENTS</div>
            {Object.keys(activeScenario.incidents).map((key) => {
              const inc = activeScenario.incidents[key];
              return (
                <Incident
                  key={inc.name}
                  name={inc.name}
                  type={inc.type}
                  risk={inc.risk}
                  selected={selected === inc.name}
                  onClick={() => setSelected(inc.name)}
                />
              );
            })}
          </div>

          {/* Risk Intelligence Panel */}
          <div className="panel">
            <div className="panel-title">RISK INTELLIGENCE</div>
            <div className="score">
              <div>
                <span>COMPOSITE RISK SCORE</span>
                <strong>{displayHazardScore} / 100</strong>
              </div>
              <small>{displayThreatLevel} • Relocation priority: {displayPriority}</small>
            </div>

            <div className="risk-meter-container">
              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Flood Risk Index</span>
                  <span style={{ color: "var(--accent-danger)" }}>{displayFloodRisk} / 100</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${displayFloodRisk}%`, background: "var(--accent-danger)" }}></div>
                </div>
              </div>

              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Landslide Risk Index</span>
                  <span style={{ color: "var(--accent-warning)" }}>{displayLandslideRisk} / 100</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${displayLandslideRisk}%`, background: "var(--accent-warning)" }}></div>
                </div>
              </div>

              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Rainfall Telemetry</span>
                  <span style={{ color: "var(--accent-danger)" }}>{displayRainfall} mm</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${Math.min(100, (displayRainfall / 300) * 100)}%`, background: "var(--accent-danger)" }}></div>
                </div>
              </div>

              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Road Accessibility</span>
                  <span style={{ color: "var(--accent-info)" }}>{currentIncident.roadAccess} ({currentIncident.roadAccessRating || 40}%)</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${currentIncident.roadAccessRating || 40}%`, background: "var(--accent-info)" }}></div>
                </div>
              </div>
            </div>

            <div className="risk-explanation-box">
              <b>Why this risk level?</b>
              High flood runoff combined with rainfall telemetry ({displayRainfall} mm) places {currentIncident.affected.toLocaleString()} residents inside the primary danger buffer. Road access is {currentIncident.roadAccess.toLowerCase()}, requiring immediate evacuation coordination.
            </div>
          </div>

          {/* Infrastructure at Risk Panel */}
          <div className="panel">
            <div className="panel-title">INFRASTRUCTURE AT RISK</div>
            <div className="subtle" style={{ marginBottom: "8px" }}>Click category to filter map view</div>
            <div className="infra-grid">
              {[
                { label: "Hospitals", cat: "Hospital", icon: "🏥", count: activeScenario.infrastructure.filter(i => i.category === "Hospital").length || 1 },
                { label: "Police Stations", cat: "Police", icon: "👮", count: activeScenario.infrastructure.filter(i => i.category === "Police").length || 1 },
                { label: "Fire Units", cat: "Fire", icon: "🚒", count: activeScenario.infrastructure.filter(i => i.category === "Fire").length || 1 },
                { label: "Schools / Hubs", cat: "School", icon: "🏫", count: activeScenario.infrastructure.filter(i => i.category === "School").length || 1 }
              ].map((item) => {
                const isActive = infraCategoryFilter === item.cat;
                return (
                  <button
                    key={item.cat}
                    className={`infra-item-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      const next = isActive ? null : item.cat;
                      setInfraCategoryFilter(next);
                      showToast(next ? `Filtered map markers to: ${item.label}` : "Showing all infrastructure map markers", "info");
                    }}
                  >
                    <div className="infra-item-left">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="infra-count-badge">{item.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Column: GIS Command Map */}
        <section className="map-panel">
          <div className="map-header">
            <div>
              <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                LIVE GIS COMMAND MAP
                <span className="live-indicator" style={{ fontSize: "9.5px" }}>
                  <span className="pulse-dot"></span>LIVE GEOSPATIAL DATA
                </span>
              </div>
              <div className="subtle">SIMULATED SCENARIO • {activeScenario.locationName.toUpperCase()} • Sync: {lastUpdated}</div>
            </div>
            <div className="legend">
              <span className="dot red"></span> Critical <span className="dot green"></span> Safe Site <span style={{ color: "var(--accent-info)" }}>🏥 Infra</span>
            </div>
          </div>

          <div className="map-container-wrapper">
            {/* Floating Map Controls */}
            <div className="map-control-panel">
              <h4>Map Layers</h4>
              <div className="map-layer-toggles">
                <label className="map-layer-toggle">
                  <input type="checkbox" checked={showHazards} onChange={(e) => setShowHazards(e.target.checked)} />
                  Hazard Zones
                </label>
                <label className="map-layer-toggle">
                  <input type="checkbox" checked={showSafeSites} onChange={(e) => setShowSafeSites(e.target.checked)} />
                  Safe Sites
                </label>
                <label className="map-layer-toggle">
                  <input type="checkbox" checked={showRoutes} onChange={(e) => setShowRoutes(e.target.checked)} />
                  Evacuation Routes
                </label>
                <label className="map-layer-toggle">
                  <input type="checkbox" checked={showInfra} onChange={(e) => setShowInfra(e.target.checked)} />
                  Critical Infra
                </label>
              </div>
              <div className="map-control-actions">
                <button className="map-control-btn" onClick={() => { setCustomCenter(currentIncident.center); setCustomZoom(13); }}>
                  FOCUS INCIDENT
                </button>
                <button className="map-control-btn" onClick={() => { setCustomCenter(activeScenario.mapCenter); setCustomZoom(activeScenario.mapZoom); }}>
                  FIT RESPONSE AREA
                </button>
              </div>
            </div>

            {/* Floating Summary Overlay */}
            <div className="map-summary-overlay">
              <div className="map-summary-header">
                <h4 className="map-summary-title">{currentIncident.name}</h4>
                <span className="map-summary-tag">{displayPriority}</span>
              </div>
              <p className="map-summary-type">{currentIncident.type}</p>
              <div className="map-summary-stat-row"><span>Affected:</span><strong>{currentIncident.affected.toLocaleString()}</strong></div>
              <div className="map-summary-stat-row"><span>Hazard Score:</span><strong style={{ color: "var(--accent-danger)" }}>{displayHazardScore} / 100</strong></div>
              <div className="map-summary-stat-row"><span>Road Access:</span><strong>{currentIncident.roadAccess}</strong></div>
            </div>

            <MapContainer center={mapCenter} zoom={activeScenario.mapZoom} scrollWheelZoom={true}>
              <MapController center={customCenter || mapCenter} zoom={customZoom || activeScenario.mapZoom} />
              
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Hazard Zones Layer */}
              {showHazards && activeScenario.hazardZones.map((zone, idx) => {
                if (zone.incident !== selected) return null;
                if (zone.type === "polygon") {
                  return <Polygon key={`poly-${idx}`} positions={zone.positions} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.22 }} />;
                } else if (zone.type === "circle") {
                  return <Circle key={`circle-${idx}`} center={zone.center} radius={zone.radius} pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.12 }} />;
                }
                return null;
              })}

              {/* Safe Sites Layer */}
              {showSafeSites && Object.keys(activeScenario.safeSites).map((key) => {
                const site = activeScenario.safeSites[key];
                const isSelectedOverride = recommendedSite.name === site.name;
                return (
                  <Marker key={site.name} position={site.center} icon={createSafeIcon(isSelectedOverride)}>
                    <Popup>
                      <div style={{ minWidth: "170px", fontFamily: "Inter, sans-serif" }}>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: "800", color: "var(--accent-info)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>
                          🏠 {site.name.toUpperCase()}
                        </h4>
                        <table style={{ width: "100%", fontSize: "9.5px", borderCollapse: "collapse", marginBottom: "8px" }}>
                          <tbody>
                            <tr><td style={{ color: "var(--text-muted)" }}>Capacity:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{site.capacity.toLocaleString()}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>Occupied:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{site.occupied.toLocaleString()}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>Available:</td><td style={{ textAlign: "right", fontWeight: "700", color: "var(--accent-success)" }}>{site.available.toLocaleString()}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>Distance:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{site.distance}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>Exposure:</td><td style={{ textAlign: "right", fontWeight: "700", color: "var(--accent-success)" }}>{site.hazardExposure}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>Water Status:</td><td style={{ textAlign: "right", fontWeight: "700", color: "var(--accent-success)" }}>{site.waterStatus || "VERIFIED"}</td></tr>
                          </tbody>
                        </table>
                        <button
                          style={{
                            width: "100%", padding: "6px", background: isSelectedOverride ? "var(--accent-success)" : "var(--accent-info)",
                            color: "#fff", border: "none", borderRadius: "4px", fontWeight: "700", fontSize: "9px", cursor: "pointer"
                          }}
                          onClick={() => {
                            setSelectedSiteName(site.name);
                            addActivityLog(`Safe site override selected: ${site.name}`, "info");
                            showToast(`Selected safe site: ${site.name}`, "info");
                          }}
                        >
                          {isSelectedOverride ? "✓ RECOMMENDED SITE" : "SELECT SAFE SITE"}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Critical Infrastructure Layer */}
              {showInfra && activeScenario.infrastructure.map((infra) => {
                if (infraCategoryFilter && infra.category !== infraCategoryFilter) return null;
                return (
                  <Marker key={infra.name} position={infra.center} icon={createInfraIcon(infra.icon)}>
                    <Popup>
                      <div style={{ fontSize: "10.5px", fontFamily: "Inter, sans-serif" }}>
                        <strong>{infra.icon} {infra.name}</strong>
                        <div style={{ marginTop: "4px", color: "var(--text-muted)" }}>Category: {infra.category}</div>
                        <div style={{ color: "var(--accent-success)", fontWeight: "700", marginTop: "2px" }}>Status: Operational</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Evacuation Routes Layer */}
              {showRoutes && activeScenario.evacuationRoutes.map((route, idx) => {
                if (route.incident !== selected) return null;
                return (
                  <Polyline key={`route-${idx}`} positions={route.positions} pathOptions={{ color: "var(--accent-info)", weight: 4, dashArray: "6, 6", opacity: 0.85 }}>
                    <Popup>
                      <div style={{ minWidth: "170px", fontFamily: "Inter, sans-serif" }}>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "10px", fontWeight: "800", color: "var(--accent-info)" }}>RECOMMENDED EVACUATION ROUTE</h4>
                        <p style={{ margin: "0 0 8px 0", fontSize: "9px", color: "var(--text-muted)", fontWeight: "600" }}>{route.name}</p>
                        <table style={{ width: "100%", fontSize: "9px", borderCollapse: "collapse", marginBottom: "8px" }}>
                          <tbody>
                            <tr><td style={{ color: "var(--text-muted)" }}>Distance:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{route.distance}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>ETA:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{route.time}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>Status:</td><td style={{ textAlign: "right", fontWeight: "700", color: "var(--accent-success)" }}>{route.status}</td></tr>
                            <tr><td style={{ color: "var(--text-muted)" }}>Congestion:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{route.congestion}</td></tr>
                          </tbody>
                        </table>
                        <button
                          style={{ width: "100%", padding: "6px", background: "var(--accent-danger)", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "700", fontSize: "9px", cursor: "pointer" }}
                          onClick={() => setActiveModal("evacuation")}
                        >
                          OPEN EVACUATION MODE
                        </button>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}

              {/* Active Incident Marker */}
              <Marker position={mapCenter} icon={createRiskIcon(currentIncident.risk === "CRITICAL")}>
                <Popup>
                  <div style={{ fontSize: "10.5px", fontFamily: "Inter, sans-serif" }}>
                    <b>⚠️ {currentIncident.name}</b><br />
                    Type: {currentIncident.type}<br />
                    Priority: {displayPriority}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>

            <div className="map-callout">
              <b>🔴 HAZARD ZONE DETECTED</b>
              <span>{activeScenario.locationName} • Prototype Simulation</span>
            </div>
          </div>

          {/* Smart Evacuation Route Card */}
          <div className="smart-route-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--accent-info)", letterSpacing: "0.5px" }}>RECOMMENDED EVACUATION ROUTE</span>
              <span className="threat-pill moderate" style={{ fontSize: "8.5px" }}>STATUS: CLEAR</span>
            </div>
            <div className="smart-route-flow">
              <span>{currentIncident.name}</span>
              <span className="smart-route-arrow">&rarr; {activeEvacRoute ? activeEvacRoute.name.split("(")[0] : "Route R-04"} &rarr;</span>
              <span>🟢 {recommendedSite.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10.5px", color: "var(--text-muted)" }}>
              <span>Distance: <strong style={{ color: "var(--text-primary)" }}>{recommendedSite.distance}</strong> • ETA: <strong style={{ color: "var(--text-primary)" }}>{activeEvacRoute ? activeEvacRoute.time : "11 min"}</strong> • Access: <strong style={{ color: "var(--text-primary)" }}>{currentIncident.roadAccess}</strong></span>
              <button
                style={{ background: "var(--accent-danger)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}
                onClick={() => setActiveModal("evacuation")}
              >
                VIEW ROUTE ON MAP &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Right Column */}
        <aside className="right">
          {/* AI Decision Support & Explainability Card */}
          <div className="ai-explainability-card">
            <div className="ai-gov-badge">🤖 JANRAKSHAK AI DECISION SUPPORT</div>
            <div className="critical" style={{ fontSize: "16px", marginBottom: "4px", color: "var(--accent-danger)", fontWeight: "800" }}>
              {displayPriority === "IMMEDIATE" ? "IMMEDIATE RELOCATION RECOMMENDED" : "MONITOR SITUATION"}
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
              {currentIncident.name} has high exposure and evacuation constraints.
            </p>

            <div className="recommend-site">
              <span>RECOMMENDED SAFE SITE</span>
              <b>🟢 {recommendedSite.name}</b>
              <small>{recommendedSite.distance} • {recommendedSite.available.toLocaleString()} capacity available</small>
            </div>

            <div style={{ fontSize: "9.5px", fontWeight: "800", color: "var(--accent-info)", textTransform: "uppercase", marginTop: "10px", marginBottom: "4px" }}>
              Verification Checkpoints:
            </div>
            <div className="ai-checkpoints">
              {currentIncident.whySite.map((item, idx) => (
                <div key={idx} className="ai-checkpoint-item">
                  <span>✓</span> <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "8px" }}>
              AI Confidence Rating: <strong style={{ color: "var(--accent-info)" }}>{currentIncident.confidence}%</strong>
            </div>

            <div className="ai-actions-row">
              <button className="btn-accept" onClick={() => {
                addActivityLog(`AI Safe Site recommendation accepted: ${recommendedSite.name}`, "info");
                showToast(`Accepted recommendation: ${recommendedSite.name}`, "success");
              }}>
                ACCEPT SITE
              </button>
              <button className="btn-override" onClick={() => setActiveModal("override")}>
                OVERRIDE SITE
              </button>
            </div>

            <div style={{ fontSize: "8.5px", color: "var(--text-subtle)", marginTop: "10px", textAlign: "center" }}>
              AI-ASSISTED DECISION SUPPORT • NOT AN AUTONOMOUS EVACUATION AUTHORITY
            </div>
          </div>

          {/* Response Readiness Score Panel */}
          <div className="panel">
            <div className="panel-title">RESPONSE READINESS</div>
            <div className="readiness-container">
              <div className="readiness-score-ring">82%</div>
              <div className="readiness-checklist">
                <div className="readiness-check-pass">✓ Safe site identified & verified</div>
                <div className="readiness-check-pass">✓ Evacuation route clear</div>
                <div className="readiness-check-pass">✓ Medical support standby</div>
                <div className="readiness-check-pass">✓ Response teams deployed</div>
                <div className="readiness-check-warn">⚠ Population registration incomplete</div>
              </div>
            </div>
          </div>

          {/* Vulnerability Snapshot Panel */}
          <div className="panel">
            <div className="panel-title">VULNERABILITY SNAPSHOT</div>
            <div className="big-number" style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-info)" }}>
              {currentIncident.affected.toLocaleString()}
            </div>
            <div className="subtle">PEOPLE AT RISK</div>

            <div className="risk-meter-container" style={{ marginTop: "12px" }}>
              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Children (0-12 yrs)</span>
                  <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>{currentIncident.vulnerability.children}</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${Math.round((currentIncident.vulnerability.children / currentIncident.affected) * 100)}%`, background: "var(--accent-info)" }}></div>
                </div>
              </div>

              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Elderly (60+ yrs)</span>
                  <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>{currentIncident.vulnerability.elderly}</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${Math.round((currentIncident.vulnerability.elderly / currentIncident.affected) * 100)}%`, background: "var(--accent-warning)" }}></div>
                </div>
              </div>

              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Persons with Disabilities</span>
                  <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>{currentIncident.vulnerability.disability}</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${Math.round((currentIncident.vulnerability.disability / currentIncident.affected) * 100)}%`, background: "var(--accent-danger)" }}></div>
                </div>
              </div>

              <div className="risk-item">
                <div className="risk-item-header">
                  <span>Medical Priority Cases</span>
                  <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>{currentIncident.vulnerability.medical}</span>
                </div>
                <div className="risk-progress-track">
                  <div className="risk-progress-fill" style={{ width: `${Math.round((currentIncident.vulnerability.medical / currentIncident.affected) * 100)}%`, background: "var(--accent-danger)" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* What-If Scenario Simulator Panel */}
          <div className="panel">
            <div className="panel-title">SCENARIO SIMULATOR</div>
            <div className="subtle">Adjust environmental parameters to simulate threat escalation</div>
            
            <div className="sim-controls-panel">
              <div className="sim-slider-group">
                <div className="sim-slider-item">
                  <div className="sim-slider-label">
                    <span>Rainfall Telemetry</span>
                    <span style={{ color: "var(--accent-danger)" }}>{simRainfall} mm</span>
                  </div>
                  <input
                    type="range" min="0" max="300" value={simRainfall}
                    className="sim-slider-input"
                    onChange={(e) => setSimRainfall(Number(e.target.value))}
                  />
                </div>

                <div className="sim-slider-item">
                  <div className="sim-slider-label">
                    <span>Flood Risk Index</span>
                    <span style={{ color: "var(--accent-danger)" }}>{simFloodRisk} / 100</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={simFloodRisk}
                    className="sim-slider-input"
                    onChange={(e) => setSimFloodRisk(Number(e.target.value))}
                  />
                </div>

                <div className="sim-slider-item">
                  <div className="sim-slider-label">
                    <span>Landslide Risk Index</span>
                    <span style={{ color: "var(--accent-warning)" }}>{simLandslideRisk} / 100</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={simLandslideRisk}
                    className="sim-slider-input"
                    onChange={(e) => setSimLandslideRisk(Number(e.target.value))}
                  />
                </div>

                <div className="sim-slider-item">
                  <div className="sim-slider-label">
                    <span>Road Accessibility</span>
                    <span style={{ color: "var(--accent-info)" }}>{simRoadAccess}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={simRoadAccess}
                    className="sim-slider-input"
                    onChange={(e) => setSimRoadAccess(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="sim-action-btns">
                <button className="sim-btn-run" onClick={handleRunSimulation}>RUN SIMULATION</button>
                <button className="sim-btn-reset" onClick={handleResetSimulation}>RESET</button>
              </div>

              {simActive && simResult && simResult.escalated && (
                <div className="sim-escalation-alert">
                  ⚡ THREAT ESCALATION DETECTED ({currentIncident.hazardScore} &rarr; {simResult.simScore})
                </div>
              )}
            </div>
          </div>

          {/* Response Actions */}
          <div className="panel actions">
            <div className="panel-title">RESPONSE ACTIONS</div>
            <button className="primary" onClick={() => setActiveModal("alerts")}>🚨 SEND AUTHORITY ALERTS</button>
            <button onClick={() => setActiveModal("evacuation")}>📍 OPEN EVACUATION MODE</button>
            <button onClick={() => setActiveModal("ngos")}>🤝 COORDINATE NGOs / VOLUNTEERS</button>
            <button onClick={() => setActiveModal("relief")}>💰 VIEW VERIFIED RELIEF NEEDS</button>
          </div>
        </aside>
      </main>

      {/* Incident Activity Timeline Section */}
      <section style={{ padding: "0 32px 24px 32px", maxWidth: "1440px", margin: "0 auto" }}>
        <div className="panel">
          <div className="panel-title">
            <span>INCIDENT ACTIVITY TIMELINE</span>
            <span style={{ fontSize: "10px", color: "var(--text-subtle)" }}>Time-stamped event log</span>
          </div>
          <div className="activity-timeline">
            {activities.map((act, index) => (
              <div key={index} className={`timeline-item ${act.type === "critical" ? "critical" : act.type === "sim" ? "sim" : ""}`}>
                <span className="timeline-time">{act.time}</span>
                <span className="timeline-text">{act.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <span>JANRAKSHAK • SIH26191 PROTOTYPE</span>
        <span>AI-assisted decision-support prototype • Simulated scenario data for {activeScenario.name}</span>
      </footer>

      {/* Reusable Modals & Toast Container */}
      <ToastContainer toasts={toasts} onClose={closeToast} />

      {/* Authority Alerts Modal */}
      <Modal
        isOpen={activeModal === "alerts"}
        onClose={() => setActiveModal(null)}
        title="Emergency Authority Alert Dispatch"
        footer={
          dispatchedTimestamp ? (
            <button className="secondary-btn" onClick={() => setActiveModal(null)}>Close</button>
          ) : (
            <>
              <button className="secondary-btn" onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="primary-btn" onClick={handleDispatchAlerts}>DISPATCH ALERTS</button>
            </>
          )
        }
      >
        <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "700", color: "var(--accent-danger)" }}>Incident: {currentIncident.name} ({activeScenario.name})</p>
        <div style={{ background: "var(--bg-card-inner)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}><span>Hazard Type:</span><strong>{currentIncident.type}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}><span>Composite Hazard Score:</span><strong style={{ color: "var(--accent-danger)" }}>{displayHazardScore}/100</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}><span>People Affected:</span><strong>{currentIncident.affected.toLocaleString()}</strong></div>
        </div>
        
        <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "11px", color: "var(--text-muted)" }}>DISPATCH RECIPIENTS:</div>
        <div className="recipients-checklist" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked disabled /> District Disaster Management Authority (DDMA)</label>
          <label style={{ fontSize: "11px", display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked disabled /> Local Police Department</label>
          <label style={{ fontSize: "11px", display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked disabled /> Emergency Medical Response Team</label>
          <label style={{ fontSize: "11px", display: "flex", gap: "8px", alignItems: "center" }}><input type="checkbox" defaultChecked disabled /> Volunteer & NGO Operations Control</label>
        </div>

        {dispatchedTimestamp && (
          <div style={{ background: "var(--accent-success-bg)", color: "var(--accent-success)", border: "1px solid var(--accent-success-border)", padding: "10px", borderRadius: "8px", marginTop: "14px", textAlign: "center", fontWeight: "800" }}>
            🚀 ALERTS DISPATCHED AT {dispatchedTimestamp}
          </div>
        )}
      </Modal>

      {/* Evacuation Mode Modal */}
      <Modal
        isOpen={activeModal === "evacuation"}
        onClose={() => setActiveModal(null)}
        title="EVACUATION PROTOCOL CONTROL"
        footer={
          evacuationActive ? (
            <button className="secondary-btn" onClick={() => setActiveModal(null)}>Close</button>
          ) : (
            <>
              <button className="secondary-btn" onClick={() => setActiveModal(null)}>CANCEL</button>
              <button className="primary-btn" onClick={handleStartEvacuation}>START EVACUATION PLAN</button>
            </>
          )
        }
      >
        <div style={{ marginBottom: "16px" }}>
          <span className="threat-pill critical">PRIORITY: IMMEDIATE</span>
          <h3 style={{ margin: "8px 0 4px 0", fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>{currentIncident.name} Evacuation Protocol</h3>
          <p style={{ margin: "0", color: "var(--text-muted)" }}>{currentIncident.affected.toLocaleString()} residents inside danger zone</p>
        </div>

        {evacuationActive ? (
          <div style={{ background: "var(--accent-success-bg)", color: "var(--accent-success)", border: "1px solid var(--accent-success-border)", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "800", marginBottom: "16px" }}>
            🟢 EVACUATION PROTOCOL ACTIVE
          </div>
        ) : (
          <div style={{ background: "var(--accent-warning-bg)", color: "var(--accent-warning)", border: "1px solid var(--accent-warning-border)", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "800", marginBottom: "16px" }}>
            ⚠️ EVACUATION PROTOCOL PENDING ACTIVATION
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "10px", color: "var(--text-muted)" }}>Registered for Relocation</h4>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--text-primary)" }}>{Math.round(currentIncident.affected * 0.32).toLocaleString()}</p>
            <small style={{ color: "var(--text-subtle)" }}>32% of affected population</small>
          </div>
          <div style={{ background: "var(--bg-card-inner)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "10px", color: "var(--text-muted)" }}>Remaining in Danger Zone</h4>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--accent-danger)" }}>{(currentIncident.affected - Math.round(currentIncident.affected * 0.32)).toLocaleString()}</p>
            <small style={{ color: "var(--text-subtle)" }}>Requires urgent transport</small>
          </div>
        </div>

        <div className="recommend-site">
          <span>RECOMMENDED DESTINATION</span>
          <b>🟢 {recommendedSite.name}</b>
          <small>Distance: {recommendedSite.distance} • Available Capacity: {recommendedSite.available.toLocaleString()}</small>
        </div>
      </Modal>

      {/* NGO Coordination Modal */}
      <Modal
        isOpen={activeModal === "ngos"}
        onClose={() => setActiveModal(null)}
        title="NGO & Volunteer Team Coordination"
        footer={<button className="secondary-btn" onClick={() => setActiveModal(null)}>Close</button>}
      >
        <p style={{ marginBottom: "16px", color: "var(--text-muted)" }}>Deploy emergency response units to {currentIncident.name}:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { name: "Medical Volunteers", desc: "24 personnel standby", val: "Medical Volunteers" },
            { name: "Food & Water Distribution Team", desc: "38 personnel standby", val: "Food & Water Team" },
            { name: "Transport & Logistics Unit", desc: "17 personnel standby", val: "Transport Volunteers" },
            { name: "Search & Rescue Squad", desc: "12 personnel standby", val: "Search & Rescue" }
          ].map((group) => {
            const isDeployed = deployedNgos.includes(group.val);
            return (
              <div key={group.val} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card-inner)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "12px", color: "var(--text-primary)" }}>{group.name}</h4>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{group.desc}</span>
                </div>
                {isDeployed ? (
                  <span style={{ background: "var(--accent-success-bg)", color: "var(--accent-success)", border: "1px solid var(--accent-success-border)", padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>DEPLOYED</span>
                ) : (
                  <button style={{ background: "var(--accent-info)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }} onClick={() => deployNgo(group.val)}>Deploy</button>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Verified Relief Needs Modal */}
      <Modal
        isOpen={activeModal === "relief"}
        onClose={() => setActiveModal(null)}
        title="Verified Relief Needs & Requests"
        footer={<button className="secondary-btn" onClick={() => setActiveModal(null)}>Close</button>}
      >
        <p style={{ marginBottom: "12px", color: "var(--text-muted)" }}>Critical resource requirements for {currentIncident.name}:</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "var(--bg-card-inner)", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ padding: "8px", textAlign: "left" }}>Need Item</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Quantity</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Priority</th>
              <th style={{ padding: "8px", textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Drinking Water", qty: "2,500 L", priority: "HIGH", color: "var(--accent-warning)" },
              { name: "Food Ration Kits", qty: "1,100 kits", priority: "HIGH", color: "var(--accent-warning)" },
              { name: "Blankets", qty: "620 units", priority: "MEDIUM", color: "var(--accent-info)" },
              { name: "Medical First-Aid Kits", qty: "180 units", priority: "CRITICAL", color: "var(--accent-danger)" },
              { name: "Temporary Tents", qty: "420 units", priority: "HIGH", color: "var(--accent-warning)" }
            ].map((item) => {
              const isCoordinated = coordinatedNeeds.includes(item.name);
              return (
                <tr key={item.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 8px", fontWeight: "700", color: "var(--text-primary)" }}>{item.name}</td>
                  <td style={{ padding: "10px 8px" }}>{item.qty}</td>
                  <td style={{ padding: "10px 8px" }}><span style={{ color: item.color, fontWeight: "800", fontSize: "9px" }}>{item.priority}</span></td>
                  <td style={{ padding: "10px 8px" }}>
                    {isCoordinated ? (
                      <span style={{ color: "var(--accent-success)", fontWeight: "800" }}>COORDINATED</span>
                    ) : (
                      <button style={{ background: "var(--btn-secondary-bg)", color: "var(--btn-secondary-text)", border: "1px solid var(--btn-secondary-border)", padding: "4px 8px", borderRadius: "4px", fontSize: "9.5px", cursor: "pointer" }} onClick={() => coordinateNeed(item.name)}>Mark Coordinated</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Modal>

      {/* Manual Safe Site Override Modal */}
      <Modal
        isOpen={activeModal === "override"}
        onClose={() => setActiveModal(null)}
        title="MANUAL SAFE SITE OVERRIDE"
        footer={<button className="secondary-btn" onClick={() => setActiveModal(null)}>Close</button>}
      >
        <p style={{ color: "var(--text-muted)", marginBottom: "14px" }}>Select an alternative safe site destination for {currentIncident.name}:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.keys(activeScenario.safeSites).map((siteKey) => {
            const site = activeScenario.safeSites[siteKey];
            const isCurrent = recommendedSite.name === site.name;
            return (
              <div key={site.name} style={{ background: isCurrent ? "var(--accent-success-bg)" : "var(--bg-card-inner)", border: `1px solid ${isCurrent ? "var(--accent-success-border)" : "var(--border-subtle)"}`, borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "13px", color: "var(--text-primary)" }}>{site.name}</h4>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Distance: {site.distance} • Capacity: {site.capacity} • Available: {site.available}</div>
                </div>
                {isCurrent ? (
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "var(--accent-success)", background: "var(--accent-success-bg)", padding: "4px 8px", borderRadius: "4px" }}>SELECTED</span>
                ) : (
                  <button
                    style={{ background: "var(--accent-info)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedSiteName(site.name);
                      addActivityLog(`Safe site override selected: ${site.name}`, "info");
                      showToast(`Selected safe site: ${site.name}`, "info");
                      setActiveModal(null);
                    }}
                  >
                    SELECT SITE
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

// Toast Notifications Container
function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" role="alert" style={{ borderLeftColor: toast.type === "info" ? "var(--accent-info)" : "var(--accent-success)" }}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => onClose(toast.id)} aria-label="Dismiss message">&times;</button>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, tone }) { return <div className="stat"><span>{label}</span><b className={tone}>{value}</b></div>; }
function Incident({ name, type, risk, selected, onClick }) { return <button className={"incident " + (selected ? "selected" : "")} onClick={onClick}><div><b>{name}</b><small>{type}</small></div><span className={risk === "CRITICAL" ? "pill redpill" : "pill amberpill"}>{risk}</span></button>; }

createRoot(document.getElementById("root")).render(<App />);