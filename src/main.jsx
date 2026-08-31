import React, {useState, useEffect} from "react";
import {createRoot} from "react-dom/client";
import {MapContainer, TileLayer, Circle, Marker, Popup, Polygon, Polyline, useMap} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

// --- 5. SCENARIO DATA MODEL SYSTEMS ---
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
        center: [12.305, 76.655],
        recommendedSite: "Safe Site B",
        confidence: 94,
        explanation: "High rainfall combined with steep terrain poses active landslide threats, blockading the main highway. Relocating to Site B avoids vulnerable slip zones.",
        whySite: [
          "Low hazard exposure",
          "Sufficient capacity",
          "Good road access",
          "Near medical facility"
        ]
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
        center: [12.330, 76.665],
        recommendedSite: "Safe Site C",
        confidence: 89,
        explanation: "Low-lying urban areas are experiencing active drain backflow. Site C offers immediate shelter on elevated city structures.",
        whySite: [
          "Elevated terrain",
          "High road accessibility",
          "Equipped medical bay",
          "Established supply line"
        ]
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
        confidence: 91,
        explanation: "Industrial explosion hazard buffer requires moving citizens clear of chemical gas plume path. Site D sits upwind of the containment area.",
        whySite: [
          "Outside chemical range",
          "Ample emergency housing",
          "Rapid dispatch connection",
          "Direct backup generator"
        ]
      }
    },
    hazardZones: [
      { incident: "Village A", type: "polygon", severity: "CRITICAL", positions: [[12.31, 76.63], [12.34, 76.66], [12.31, 76.69], [12.28, 76.67], [12.29, 76.63]], color: "#dc4653" },
      { incident: "Village A", type: "circle", severity: "CRITICAL", center: [12.305, 76.655], radius: 1100, color: "#dc4653" },
      { incident: "Zone 7", type: "polygon", severity: "HIGH", positions: [[12.32, 76.64], [12.34, 76.68], [12.34, 76.65]], color: "#d39422" },
      { incident: "Zone 7", type: "circle", severity: "HIGH", center: [12.330, 76.665], radius: 800, color: "#d39422" },
      { incident: "Sector 4", type: "circle", severity: "MODERATE", center: [12.290, 76.640], radius: 700, color: "#1f5a8a" }
    ],
    safeSites: {
      "Safe Site B": { name: "Safe Site B", center: [12.322, 76.684], capacity: 3500, occupied: 620, available: 2880, distance: "4.2 km", hazardExposure: "LOW", roadAccess: "GOOD" },
      "Safe Site C": { name: "Safe Site C", center: [12.345, 76.658], capacity: 2500, occupied: 800, available: 1700, distance: "3.1 km", hazardExposure: "LOW", roadAccess: "GOOD" },
      "Safe Site D": { name: "Safe Site D", center: [12.282, 76.615], capacity: 1800, occupied: 450, available: 1350, distance: "2.8 km", hazardExposure: "MODERATE", roadAccess: "LIMITED" }
    },
    infrastructure: [
      { name: "District Hospital", center: [12.312, 76.671], icon: "🏥", abbrev: "H" },
      { name: "Police Station", center: [12.301, 76.662], icon: "👮", abbrev: "P" },
      { name: "Fire & Emergency Station", center: [12.325, 76.645], icon: "🚒", abbrev: "F" },
      { name: "Community Health Centre", center: [12.296, 76.635], icon: "🏥", abbrev: "C" }
    ],
    evacuationRoutes: [
      { name: "Village A → Safe Site B", incident: "Village A", positions: [[12.305, 76.655], [12.310, 76.668], [12.322, 76.684]], distance: "4.2 km", time: "11 min", status: "LIMITED ACCESS", congestion: "MODERATE" },
      { name: "Zone 7 → Safe Site C", incident: "Zone 7", positions: [[12.330, 76.665], [12.340, 76.660], [12.345, 76.658]], distance: "3.1 km", time: "8 min", status: "GOOD ACCESS", congestion: "LOW" }
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
        center: [12.935, 77.685],
        recommendedSite: "Outer Ring Road Camp",
        confidence: 96,
        explanation: "Bellandur lake backflow and heavy urban runoff has flooded roads up to 3 feet. Immediate relocation of ground floor apartments is advised.",
        whySite: [
          "Located on elevated highway bypass",
          "Dry conditions verified",
          "High capacity community center"
        ]
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
        center: [12.915, 77.645],
        recommendedSite: "Stadium Shelter",
        confidence: 88,
        explanation: "Main arterial drains are choked. Relocating street-level residents is recommended.",
        whySite: [
          "Large dry open stadium grounds",
          "Direct access via double-road",
          "Medical first-aid units available"
        ]
      }
    },
    hazardZones: [
      { incident: "Bellandur Layout", type: "circle", severity: "CRITICAL", center: [12.935, 77.685], radius: 1200, color: "#dc4653" },
      { incident: "HSR Sector 6", type: "circle", severity: "HIGH", center: [12.915, 77.645], radius: 800, color: "#d39422" }
    ],
    safeSites: {
      "Outer Ring Road Camp": { name: "Outer Ring Road Camp", center: [12.952, 77.702], capacity: 4000, occupied: 1200, available: 2800, distance: "2.5 km", hazardExposure: "LOW", roadAccess: "GOOD" },
      "Stadium Shelter": { name: "Stadium Shelter", center: [12.910, 77.625], capacity: 3000, occupied: 500, available: 2500, distance: "3.2 km", hazardExposure: "LOW", roadAccess: "GOOD" }
    },
    infrastructure: [
      { name: "Sakra Hospital", center: [12.932, 77.698], icon: "🏥", abbrev: "H" },
      { name: "HSR Police Station", center: [12.911, 77.640], icon: "👮", abbrev: "P" }
    ],
    evacuationRoutes: [
      { name: "Bellandur Layout → ORR Camp", incident: "Bellandur Layout", positions: [[12.935, 77.685], [12.945, 77.695], [12.952, 77.702]], distance: "2.5 km", time: "10 min", status: "CLEAR", congestion: "MODERATE" },
      { name: "HSR Sector 6 → Stadium", incident: "HSR Sector 6", positions: [[12.915, 77.645], [12.912, 77.632], [12.910, 77.625]], distance: "3.2 km", time: "12 min", status: "CLEAR", congestion: "LOW" }
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
        center: [12.424, 75.738],
        recommendedSite: "Madikeri Town Hall",
        confidence: 97,
        explanation: "Unprecedented slope movement detected by soil sensors. Heavy rainfall has fully washed out route joints.",
        whySite: [
          "Safe structural foundation on rock bed",
          "Access to medical hubs",
          "Ample dry supply stores"
        ]
      }
    },
    hazardZones: [
      { incident: "Makkandur Slip", type: "polygon", severity: "CRITICAL", positions: [[12.41, 75.72], [12.44, 75.75], [12.42, 75.76], [12.41, 75.72]], color: "#dc4653" }
    ],
    safeSites: {
      "Madikeri Town Hall": { name: "Madikeri Town Hall", center: [12.420, 75.742], capacity: 1500, occupied: 300, available: 1200, distance: "1.8 km", hazardExposure: "LOW", roadAccess: "GOOD" }
    },
    infrastructure: [
      { name: "General Hospital Madikeri", center: [12.422, 75.740], icon: "🏥", abbrev: "H" }
    ],
    evacuationRoutes: [
      { name: "Makkandur Slip → Town Hall", incident: "Makkandur Slip", positions: [[12.424, 75.738], [12.420, 75.742]], distance: "1.8 km", time: "9 min", status: "CLEAR", congestion: "LOW" }
    ]
  },
  "Industrial Fire — Bengaluru": {
    name: "Industrial Fire — Bengaluru",
    locationName: "Bengaluru (Peenya), Karnataka",
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
        confidence: 93,
        explanation: "Thermal radiation buffer expanded to 800m. Toxic chlorine gas plume is spreading downwind.",
        whySite: [
          "Sited safely upwind of industrial sector",
          "Spacious medical field hospital setup",
          "Dedicated transport terminal link"
        ]
      }
    },
    hazardZones: [
      { incident: "Peenya Phase II", type: "circle", severity: "CRITICAL", center: [13.031, 77.518], radius: 1000, color: "#dc4653" }
    ],
    safeSites: {
      "Jnanabharathi Camp": { name: "Jnanabharathi Camp", center: [12.980, 77.502], capacity: 5000, occupied: 1500, available: 3500, distance: "6.2 km", hazardExposure: "LOW", roadAccess: "GOOD" }
    },
    infrastructure: [
      { name: "Fortis Hospital", center: [13.001, 77.545], icon: "🏥", abbrev: "H" }
    ],
    evacuationRoutes: [
      { name: "Peenya Phase II → JB Camp", incident: "Peenya Phase II", positions: [[13.031, 77.518], [13.001, 77.508], [12.980, 77.502]], distance: "6.2 km", time: "18 min", status: "CLEAR", congestion: "MODERATE" }
    ]
  },
  "Cyclone — Coastal Karnataka": {
    name: "Cyclone — Coastal Karnataka",
    locationName: "Udupi, Karnataka",
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
        confidence: 95,
        explanation: "Cyclone storm surge is pushing seawater 2km inland. Maritime alert levels are critical.",
        whySite: [
          "Located 5km inland behind coastal forest buffer",
          "Equipped with backup power and storm shutters",
          "Dedicated emergency food stockpile"
        ]
      }
    },
    hazardZones: [
      { incident: "Malpe Harbour", type: "polygon", severity: "CRITICAL", positions: [[13.33, 74.67], [13.36, 74.67], [13.35, 74.70], [13.32, 74.69]], color: "#dc4653" }
    ],
    safeSites: {
      "Udupi Sports Complex": { name: "Udupi Sports Complex", center: [13.345, 74.745], capacity: 4000, occupied: 1100, available: 2900, distance: "6.5 km", hazardExposure: "LOW", roadAccess: "GOOD" }
    },
    infrastructure: [
      { name: "Adarsha Hospital Udupi", center: [13.343, 74.749], icon: "🏥", abbrev: "H" }
    ],
    evacuationRoutes: [
      { name: "Malpe Harbour → Sports Complex", incident: "Malpe Harbour", positions: [[13.342, 74.685], [13.345, 74.745]], distance: "6.5 km", time: "14 min", status: "CLEAR", congestion: "MODERATE" }
    ]
  }
};

// --- 2. CUSTOM MAP MARKERS ---
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

// Helper component to center and zoom Leaflet map dynamically
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

// Landing Page View Component
function LandingPage({ onEnter }) {
  return (
    <div className="landing-page">
      {/* Background Sensor/Data Nodes */}
      <div className="sensor-nodes-container">
        <div className="sensor-node" style={{ top: "15%", left: "12%" }}></div>
        <div className="sensor-node red" style={{ top: "35%", left: "45%" }}></div>
        <div className="sensor-node green" style={{ top: "65%", left: "22%" }}></div>
        <div className="sensor-node" style={{ top: "80%", left: "75%" }}></div>
        <div className="sensor-node red" style={{ top: "25%", left: "70%" }}></div>
        <div className="sensor-node green" style={{ top: "50%", left: "85%" }}></div>
      </div>
      <div className="hero-radial-glow"></div>

      <nav className="landing-nav">
        <div className="landing-logo-container">
          <div className="landing-logo">
            🛡️ JANRAKSHAK<span style={{ color: "#3faf6a", fontSize: "14px", fontWeight: "800", marginLeft: "2px" }}>.gov</span>
          </div>
          <div className="landing-logo-sub">DISASTER INTELLIGENCE PLATFORM</div>
        </div>
        <div className="landing-nav-links">
          <a href="#platform" className="landing-nav-link">Platform</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#intelligence" className="landing-nav-link">Intelligence</a>
          <a href="#about" className="landing-nav-link">About</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="landing-nav-status">
            <span></span>SYSTEM OPERATIONAL
          </div>
          <button className="landing-nav-btn" onClick={onEnter}>
            ENTER COMMAND CENTER &rarr;
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero" id="platform">
        <div className="landing-hero-overlay"></div>
        <div className="landing-hero-gradient"></div>
        <div className="landing-hero-bg"></div>
        <div className="hero-left">
          <h1>AI-POWERED GEOSPATIAL DISASTER INTELLIGENCE</h1>
          <h2 style={{ textTransform: "uppercase" }}>
            KNOW THE RISK.<br />
            <span style={{ color: "#dc4653" }}>ACT BEFORE IT ESCALATES.</span>
          </h2>
          <p>
            JanRakshak combines geospatial intelligence, vulnerability analysis and AI-assisted decision support to help authorities detect risk, prioritize communities and coordinate response.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={onEnter}>ENTER COMMAND CENTER &rarr;</button>
            <a href="#how-it-works" className="hero-btn-secondary">EXPLORE HOW IT WORKS</a>
          </div>
          <div className="hero-bullet-indicators">
            <div className="hero-bullet-indicator">🔔 Early Warning</div>
            <div className="hero-bullet-indicator">🤖 AI-Assisted Decisions</div>
            <div className="hero-bullet-indicator">⚡ Faster Response</div>
            <div className="hero-bullet-indicator">🔌 Works Offline</div>
          </div>
        </div>
        
        {/* --- 5. HERO GIS VISUALIZATION --- */}
        <div className="hero-visual-gis">
          <div className="gis-header">
            <span>LIVE GEOSPATIAL INTELLIGENCE</span>
            <span className="live-indicator">
              <span className="pulse-dot"></span>LIVE
            </span>
          </div>
          
          <div className="gis-grid"></div>
          
          {/* Radar Circles */}
          <div className="gis-radar-ring r1"></div>
          <div className="gis-radar-ring r2"></div>
          <div className="gis-radar-ring r3"></div>
          
          {/* Radar Sweeper */}
          <div className="gis-scanner"></div>
          
          {/* Polygons & Routes */}
          <div className="gis-danger-poly"></div>
          <div className="gis-route-poly"></div>
          
          {/* Custom Markers */}
          <div className="gis-marker red" style={{ top: "160px", left: "140px" }}>
            <div className="dot"></div>
            <div className="pulse"></div>
          </div>
          
          <div className="gis-marker green" style={{ top: "250px", left: "270px" }}>
            <div className="dot"></div>
            <div className="pulse"></div>
          </div>

          <div className="gis-marker blue" style={{ top: "100px", left: "260px" }}>
            <div className="dot"></div>
            <div className="pulse"></div>
          </div>
          
          {/* GIS Labels */}
          <div className="gis-label red-lbl" style={{ top: "115px", left: "55px" }}>
            RED HAZARD ZONE • Risk Level: 92%
          </div>
          
          <div className="gis-label red-lbl" style={{ top: "185px", left: "120px" }}>
            2,140 PEOPLE AT RISK
          </div>
          
          <div className="gis-label green-lbl" style={{ top: "275px", left: "215px" }}>
            SAFE SITE B • Cap: 2,880 • Dist: 4.2 km
          </div>

          <div className="gis-label blue-lbl" style={{ top: "70px", left: "210px" }}>
            DISTRICT HOSPITAL
          </div>

          <div className="gis-label blue-lbl" style={{ top: "210px", left: "280px" }}>
            EVACUATION ROUTE • Limited Access
          </div>
          
          <div className="gis-footer">
            <span>GIS COMMAND RADAR • ACTIVE</span>
            <span>CRITICAL INFRASTRUCTURE</span>
          </div>
        </div>
      </section>

      {/* --- 6. DISASTER IMAGE INTEL MODULES STRIP --- */}
      <section className="disaster-strip-section">
        <div className="disaster-grid">
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80" alt="Flood Rescue" />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">01</span>
            </div>
            <div className="disaster-intel-info">
              <h5>FLOOD RESCUE</h5>
              <p>Rapid identification of affected communities and evacuation priorities.</p>
            </div>
          </div>
          
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img src="https://images.unsplash.com/photo-1599740831666-415c89893d87?auto=format&fit=crop&w=800&q=80" alt="Landslide Response" />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">02</span>
            </div>
            <div className="disaster-intel-info">
              <h5>LANDSLIDE RESPONSE</h5>
              <p>Terrain-aware risk intelligence for vulnerable mountain regions.</p>
            </div>
          </div>
          
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="Urban Flooding" />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">03</span>
            </div>
            <div className="disaster-intel-info">
              <h5>URBAN FLOODING</h5>
              <p>Geospatial analysis of critical infrastructure and population exposure.</p>
            </div>
          </div>
          
          <div className="disaster-intel-card">
            <div className="disaster-image-wrapper">
              <img src="https://images.unsplash.com/photo-1578357074759-38389e80ac5a?auto=format&fit=crop&w=800&q=80" alt="Emergency Responders" />
              <div className="disaster-image-overlay"></div>
              <span className="disaster-card-num">04</span>
            </div>
            <div className="disaster-intel-info">
              <h5>EMERGENCY RESPONDERS</h5>
              <p>Coordinate active response teams, essential resources and safe routes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 7. HOW JANRAKSHAK WORKS --- */}
      <section className="how-works-section" id="how-it-works" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="section-header" style={{ textAlign: "center", marginBottom: "60px" }}>
          <h3>Workflow Pipeline</h3>
          <h4>How JanRakshak Works</h4>
        </div>
        <div style={{ position: "relative" }}>
          <div className="how-works-line"></div>
          <div className="how-works-grid">
            <div className="how-works-card">
              <div className="how-works-circle">01</div>
              <div className="how-works-title">DETECT</div>
              <div className="how-works-desc">Monitor rainfall, terrain, infrastructure and incident signals.</div>
            </div>
            <div className="how-works-card">
              <div className="how-works-circle">02</div>
              <div className="how-works-title">ANALYZE</div>
              <div className="how-works-desc">Combine geospatial and vulnerability data to calculate risk.</div>
            </div>
            <div className="how-works-card">
              <div className="how-works-circle">03</div>
              <div className="how-works-title">PRIORITIZE</div>
              <div className="how-works-desc">Identify communities requiring immediate attention.</div>
            </div>
            <div className="how-works-card">
              <div className="how-works-circle">04</div>
              <div className="how-works-title">RESPOND</div>
              <div className="how-works-desc">Recommend evacuation routes, safe sites and coordinated action.</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 8. WHY JANRAKSHAK / CAPABILITY STRIP --- */}
      <section className="capability-section" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="section-header" style={{ textAlign: "center", marginBottom: "50px" }}>
          <h3>Platform Overview</h3>
          <h4>Why JanRakshak</h4>
        </div>
        <div className="capability-grid">
          <div className="capability-card">
            <div className="capability-icon">📡</div>
            <h5>EARLY WARNING</h5>
            <p>Identify emerging disaster risk before escalation levels trigger.</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🤖</div>
            <h5>AI-ASSISTED DECISIONS</h5>
            <p>Turn complex geospatial data layers into actionable recommendations.</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">🔌</div>
            <h5>OFFLINE RESILIENCE</h5>
            <p>Continue essential decision support processes during degraded connectivity.</p>
          </div>
          <div className="capability-card">
            <div className="capability-icon">⚡</div>
            <h5>COORDINATED RESPONSE</h5>
            <p>Connect emergency authorities, active responders and relief organizations.</p>
          </div>
        </div>
      </section>

      {/* --- 9. IMPACT METRICS --- */}
      <section className="impact-strip">
        <div className="impact-content">
          <div className="impact-title">REAL-TIME DECISION SUPPORT</div>
          <div className="impact-metrics">
            <div className="impact-metric">
              <b className="red">03</b>
              <span>ACTIVE RED ZONES</span>
            </div>
            <div className="impact-metric">
              <b className="blue">8,420</b>
              <span>PEOPLE AT RISK</span>
            </div>
            <div className="impact-metric">
              <b className="green">07</b>
              <span>SAFE SITES</span>
            </div>
            <div className="impact-metric">
              <b className="cyan">04</b>
              <span>EVACUATION ROUTES</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- 10. THE CHALLENGE --- */}
      <section className="challenge-section" id="about" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="section-header" style={{ textAlign: "center", marginBottom: "50px" }}>
          <h3>The Challenge</h3>
          <h4 style={{ fontSize: "28px", maxWidth: "600px", margin: "0 auto", textTransform: "uppercase" }}>
            DISASTERS MOVE FAST.<br />
            DECISIONS NEED TO MOVE FASTER.
          </h4>
          <p style={{ color: "#a9c1d2", fontSize: "13px", marginTop: "12px", maxWidth: "700px", margin: "12px auto 0 auto", lineHeight: "1.6" }}>
            Response teams need to understand where the hazard is, who is vulnerable, which routes remain accessible and where people can safely relocate.
          </p>
        </div>
        
        <div className="challenge-grid">
          <div className="challenge-card">
            <div className="challenge-card-icon">📡</div>
            <h5>RISK DETECTION</h5>
            <p>Identify emerging hazard zones through sensor inputs and geographical data layers.</p>
          </div>
          <div className="challenge-card">
            <div className="challenge-card-icon">👥</div>
            <h5>VULNERABILITY INTELLIGENCE</h5>
            <p>Understand population exposure and critical needs across affected villages.</p>
          </div>
          <div className="challenge-card">
            <div className="challenge-card-icon">🗺️</div>
            <h5>RESPONSE COORDINATION</h5>
            <p>Connect intelligence directly to evacuation and relief decisions on the command line.</p>
          </div>
        </div>
      </section>

      {/* --- 11. INTELLIGENCE SNAPSHOT --- */}
      <section className="intel-section" id="intelligence" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="intel-heading">
          <h3>GIS Intelligence</h3>
          <h4>FROM DATA TO ACTIONABLE INTELLIGENCE.</h4>
          <p>
            JanRakshak transforms complex geospatial maps and telemetry reports into a single, unified hazard matrix. Operations teams receive instant composite scores to trigger alerts before hazard thresholds are breached.
          </p>
        </div>
        
        <div className="intel-preview-card">
          <div className="intel-card-header">🤖 EMERGENCY INTELLIGENCE SNAPSHOT</div>
          <div className="intel-card-grid">
            <div className="intel-card-item">
              <span>Composite Hazard Score</span>
              <b className="red">87 / 100</b>
            </div>
            <div className="intel-card-item">
              <span>Flood Risk Index</span>
              <b className="red">92 / 100</b>
            </div>
            <div className="intel-card-item">
              <span>Landslide Risk Index</span>
              <b style={{ color: "#d39422" }}>41 / 100</b>
            </div>
            <div className="intel-card-item">
              <span>People Affected</span>
              <b>2,140</b>
            </div>
            <div className="intel-card-item">
              <span>Road Access</span>
              <b style={{ color: "#d39422" }}>LIMITED</b>
            </div>
            <div className="intel-card-item">
              <span>AI confidence score</span>
              <b className="green">94%</b>
            </div>
            <div className="intel-card-item full-width">
              <span>AI RECOMMENDATION</span>
              <b style={{ color: "#dc4653" }}>IMMEDIATE RELOCATION REQUIRED</b>
            </div>
          </div>
        </div>
      </section>

      {/* --- 12. REAL-WORLD / NETWORK-DEGRADED CAPABILITY --- */}
      <section className="resilience-section">
        <div className="resilience-banner-panel">
          <div className="resilience-left">
            <h4>BUILT FOR REAL-WORLD CONDITIONS</h4>
            <p>
              Disaster zones may lose connectivity when response is needed most. JanRakshak is designed to support network-degraded operational scenarios.
            </p>
          </div>
          <div className="resilience-status" style={{ borderColor: "#754425", color: "#ffd08a", background: "rgba(75, 48, 32, 0.4)" }}>
            <span style={{ background: "#ffd08a" }}></span>NETWORK-DEGRADED MODE
          </div>
        </div>
      </section>

      {/* --- 13. TRUST / BADGES STRIP --- */}
      <section style={{ padding: "0 40px 60px 40px", textAlign: "center", position: "relative", zIndex: "10" }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#1f5a8a", letterSpacing: "1.5px", textTransform: "uppercase" }}>
          BUILT FOR HIGH-PRESSURE DECISION MAKING
        </div>
        <div className="trust-badges-container">
          <span className="trust-badge">GIS INTELLIGENCE</span>
          <span className="trust-badge">AI-ASSISTED ANALYSIS</span>
          <span className="trust-badge">OFFLINE CAPABLE</span>
          <span className="trust-badge">HUMAN-IN-THE-LOOP</span>
        </div>
      </section>

      {/* --- 14. FINAL CTA --- */}
      <section className="cta-section">
        <h3>TURN DISASTER DATA<br />INTO DECISIVE ACTION.</h3>
        <p>
          Explore the JanRakshak command center and see how geospatial intelligence can support faster, safer disaster response.
        </p>
        <button className="hero-btn-primary" style={{ padding: "16px 36px", fontSize: "14px" }} onClick={onEnter}>
          ENTER COMMAND CENTER &rarr;
        </button>
      </section>

      {/* --- 15. FOOTER --- */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h4>🛡️ JANRAKSHAK.gov</h4>
            <p>AI-powered geospatial disaster intelligence and decision support.</p>
          </div>
          <div className="footer-column">
            <h5>Platform</h5>
            <a href="#platform">Overview</a>
            <a href="#intelligence">Features</a>
          </div>
          <div className="footer-column">
            <h5>How It Works</h5>
            <a href="#how-it-works">Pipeline</a>
            <a href="#about">Challenge</a>
          </div>
          <div className="footer-column">
            <h5>Command Center</h5>
            <a href="#platform" onClick={(e) => { e.preventDefault(); onEnter(); }}>Enter Console</a>
          </div>
        </div>
        <div className="footer-disclaimer">
          <span>© 2026 JanRakshak</span>
          <span>Decision-support prototype — not an autonomous relocation order.</span>
        </div>
      </footer>
    </div>
  );
}

function App(){
  // --- 3. CLIENT SIDE HASH ROUTING STATE ---
  const [view, setView] = useState(() => {
    return window.location.hash === "#/dashboard" ? "dashboard" : "landing";
  });

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === "#/dashboard" ? "dashboard" : "landing");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateToDashboard = () => {
    window.location.hash = "/dashboard";
    setView("dashboard");
  };

  // --- 5. SCENARIO STATE SELECTOR ---
  const [scenarioName, setScenarioName] = useState("Flood — Mysuru");
  
  const activeScenario = scenariosData[scenarioName] || scenariosData["Flood — Mysuru"];

  const [selected, setSelected] = useState(() => {
    return Object.keys(activeScenario.incidents)[0];
  });
  
  const [offline, setOffline] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [alertsCount, setAlertsCount] = useState(12);
  const [evacuationActive, setEvacuationActive] = useState(false);
  const [deployedNgos, setDeployedNgos] = useState([]);
  const [coordinatedNeeds, setCoordinatedNeeds] = useState([]);
  const [toasts, setToasts] = useState([]);

  // --- 1. LAYER TOGGLES STATE ---
  const [showHazards, setShowHazards] = useState(true);
  const [showSafeSites, setShowSafeSites] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showInfra, setShowInfra] = useState(true);

  // Custom center and zoom map controller state
  const [customCenter, setCustomCenter] = useState(null);
  const [customZoom, setCustomZoom] = useState(null);

  // Dynamic AI site recommendation override state
  const [selectedSiteName, setSelectedSiteName] = useState(null);

  // --- 2. ALERT DISPATCH TIMESTAMPS STATE ---
  const [dispatchedTimestamp, setDispatchedTimestamp] = useState(null);

  // --- 4. RECENT SYSTEM ACTIVITY STATE ---
  const [activities, setActivities] = useState([
    { time: "17:28:10", text: "System initialized and maps loaded.", type: "info" },
    { time: "17:29:45", text: "Risk assessment updated for scenario.", type: "info" },
    { time: "17:31:02", text: "Safe site capacity verified by local agents.", type: "info" },
    { time: "17:32:15", text: "Heavy rainfall alert registered from met station.", type: "critical" }
  ]);

  // Action logging function
  const addActivityLog = (text, type = "info") => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setActivities((prev) => [{ time: timeStr, text, type }, ...prev]);
  };

  // --- 5. MAP HEADER LIVE TIMESTAMP ---
  const [lastUpdated, setLastUpdated] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toTimeString().split(" ")[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset custom states when selected incident or scenario changes
  useEffect(() => {
    setCustomCenter(null);
    setCustomZoom(null);
    setSelectedSiteName(null);
    setDispatchedTimestamp(null);
    setEvacuationActive(false);
  }, [selected, scenarioName]);

  // Sync selected incident when scenario changes
  useEffect(() => {
    const incidentKeys = Object.keys(activeScenario.incidents);
    setSelected(incidentKeys[0]);
    addActivityLog(`Scenario loaded: ${activeScenario.name}`, "info");
    showToast(`Loaded scenario: ${activeScenario.name}`, "info");
  }, [scenarioName]);

  const currentIncident = activeScenario.incidents[selected] || activeScenario.incidents[Object.keys(activeScenario.incidents)[0]];
  const mapCenter = currentIncident.center;

  // Resolved safe site recommendation
  const recommendedSite = activeScenario.safeSites[selectedSiteName || currentIncident.recommendedSite] || Object.values(activeScenario.safeSites)[0];

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const closeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
    addActivityLog(`Emergency alerts dispatched to response units for ${selected}.`, "critical");
    showToast("Authority alerts dispatched successfully.", "success");
  };

  const handleStartEvacuation = () => {
    setEvacuationActive(true);
    addActivityLog(`Evacuation protocol activated for ${selected} → ${recommendedSite.name}`, "critical");
    showToast("Evacuation plan activated successfully.", "success");
  };

  if (view === "landing") {
    return <LandingPage onEnter={navigateToDashboard} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button style={{ background: "transparent", border: "none", color: "#a9c1d2", fontSize: "12px", cursor: "pointer", padding: 0 }} onClick={() => { window.location.hash = "/"; setView("landing"); }}>
            &larr; BACK
          </button>
          <div>
            <div className="brand">JANRAKSHAK</div>
            <div className="tagline">AI-POWERED GEOSPATIAL DISASTER INTELLIGENCE</div>
          </div>
        </div>

        {/* --- 5. SCENARIO SELECTOR INTERFACE --- */}
        <div className="scenario-selector-container">
          <label htmlFor="scenario-select">ACTIVE SCENARIO:</label>
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

        <div className="header-actions">
          {/* --- 4. SIMULATION BADGE --- */}
          <div className="simulation-banner">
            <span></span>SIMULATION MODE
          </div>
          <span className={"status " + (offline ? "offline":"online")}>
            {offline ? "● OFFLINE / DEGRADED" : "● SYSTEM ONLINE"}
          </span>
          <button onClick={() => {
            setOffline(!offline);
            addActivityLog(offline ? "Network connection restored." : "Degraded system state simulated.", offline ? "info" : "critical");
          }}>{offline ? "Restore Network" : "Simulate Network Failure"}</button>
        </div>
      </header>

      <section className="stats">
        <Stat label="ACTIVE RED ZONES" value="03" tone="red"/>
        <Stat label="PEOPLE AT RISK" value={currentIncident.affected.toLocaleString()} tone="red"/>
        <Stat label="SAFE SITES" value={`0${Object.keys(activeScenario.safeSites).length}`} tone="green"/>
        <Stat label="ACTIVE ALERTS" value={alertsCount.toString()} tone="blue"/>
      </section>

      <main className="grid">
        <aside className="left">
          {/* --- 3. INTERACTIVE INCIDENT SELECTION --- */}
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

          <div className="panel">
            <div className="panel-title">HAZARD ANALYSIS</div>
            <Metric label="Flood risk" value={`${currentIncident.floodRisk} / 100`} tone="red"/>
            <Metric label="Landslide risk" value={`${currentIncident.landslideRisk} / 100`} tone="amber"/>
            <Metric label="Rainfall" value={`${currentIncident.rainfall} mm`} tone="red"/>
            <Metric label="Road accessibility" value={currentIncident.roadAccess} tone="amber"/>
            <div className="score">
              <div><span>COMPOSITE HAZARD SCORE</span><strong>{currentIncident.hazardScore}</strong></div>
              <small>{currentIncident.risk} • requires immediate assessment</small>
            </div>
          </div>

          {/* --- 4. RECENT SYSTEM ACTIVITY PANEL --- */}
          <div className="panel">
            <div className="panel-title">RECENT SYSTEM ACTIVITY</div>
            <div className="activity-log">
              {activities.map((act, index) => (
                <div key={index} className={`activity-item ${act.type === "critical" ? "critical" : ""}`}>
                  <span>{act.text}</span>
                  <small>{act.time}</small>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="map-panel">
          {/* --- 5. MAP HEADER IMPROVEMENT --- */}
          <div className="map-header">
            <div>
              <div className="panel-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                LIVE GIS COMMAND MAP
                <span className="live-badge">
                  <span className="pulse-dot"></span>LIVE DATA
                </span>
              </div>
              <div className="subtle">SIMULATED DISASTER SCENARIO • {activeScenario.locationName.toUpperCase()} • Last updated: {lastUpdated}</div>
            </div>
            <div className="legend"><span className="dot red"></span> Red zone <span className="dot green"></span> Safe site</div>
          </div>

          {/* --- 6. MAP STATISTICS BAR --- */}
          <div style={{ padding: "0 15px" }}>
            <div className="map-stats-strip">
              <div className="map-stat-item">
                <span>Red Zones</span>
                <b className="red">03</b>
              </div>
              <div className="map-stat-item">
                <span>Safe Sites</span>
                <b className="green">{`0${Object.keys(activeScenario.safeSites).length}`}</b>
              </div>
              <div className="map-stat-item">
                <span>Evacuation Routes</span>
                <b className="blue">{`0${activeScenario.evacuationRoutes.length}`}</b>
              </div>
              <div className="map-stat-item">
                <span>People at Risk</span>
                <b className="red">{currentIncident.affected.toLocaleString()}</b>
              </div>
            </div>
          </div>

          <div className="map-container-wrapper">
            {/* --- 3. MAP CONTROL PANEL --- */}
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
                  Critical Infrastructure
                </label>
              </div>
              <div className="map-control-actions">
                <button className="map-control-btn" onClick={() => {
                  setCustomCenter(currentIncident.center);
                  setCustomZoom(13);
                }}>
                  FOCUS INCIDENT
                </button>
                <button className="map-control-btn" onClick={() => {
                  setCustomCenter(activeScenario.mapCenter);
                  setCustomZoom(activeScenario.mapZoom);
                }}>
                  FIT RESPONSE AREA
                </button>
              </div>
            </div>

            {/* --- 4. INCIDENT SUMMARY OVERLAY --- */}
            <div className="map-summary-overlay">
              <div className="map-summary-header">
                <h4 className="map-summary-title">{currentIncident.name}</h4>
                <span className="map-summary-tag">{currentIncident.priority}</span>
              </div>
              <p className="map-summary-type">{currentIncident.type}</p>
              <div className="map-summary-stat-row">
                <span>Affected:</span>
                <strong>{currentIncident.affected.toLocaleString()}</strong>
              </div>
              <div className="map-summary-stat-row">
                <span>Hazard Score:</span>
                <strong className="red">{currentIncident.hazardScore} / 100</strong>
              </div>
              <div className="map-summary-stat-row">
                <span>Access:</span>
                <strong>{currentIncident.roadAccess}</strong>
              </div>
            </div>

            <MapContainer center={mapCenter} zoom={activeScenario.mapZoom} scrollWheelZoom={true}>
              <MapController center={customCenter || mapCenter} zoom={customZoom || activeScenario.mapZoom} />
              
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* A. HAZARD ZONES LAYER */}
              {showHazards && activeScenario.hazardZones.map((zone, idx) => {
                if (zone.incident !== selected) return null;
                if (zone.type === "polygon") {
                  return (
                    <Polygon
                      key={`poly-${idx}`}
                      positions={zone.positions}
                      pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: 0.22}}
                    />
                  );
                } else if (zone.type === "circle") {
                  return (
                    <Circle
                      key={`circle-${idx}`}
                      center={zone.center}
                      radius={zone.radius}
                      pathOptions={{color: zone.color, fillColor: zone.color, fillOpacity: 0.1}}
                    />
                  );
                }
                return null;
              })}

              {/* B. SAFE SITES LAYER */}
              {showSafeSites && Object.keys(activeScenario.safeSites).map((key) => {
                const site = activeScenario.safeSites[key];
                const isSelectedOverride = recommendedSite.name === site.name;
                return (
                  <Marker
                    key={site.name}
                    position={site.center}
                    icon={createSafeIcon(isSelectedOverride)}
                  >
                    {/* --- 8. SAFE SITE POPUP --- */}
                    <Popup>
                      <div style={{ minWidth: "160px", fontFamily: "Inter, sans-serif" }}>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: "800", color: "#1f5a8a", borderBottom: "1px solid #edf1f4", paddingBottom: "4px" }}>
                          {site.name.toUpperCase()}
                        </h4>
                        <table style={{ width: "100%", fontSize: "9px", borderCollapse: "collapse", marginBottom: "8px" }}>
                          <tbody>
                            <tr><td style={{ color: "#687b8a" }}>Capacity:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{site.capacity.toLocaleString()}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Occupied:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{site.occupied.toLocaleString()}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Available:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{site.available.toLocaleString()}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Distance:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{site.distance}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Exposure:</td><td style={{ textAlign: "right", fontWeight: "700", color: site.hazardExposure === "LOW" ? "#3faf6a" : "#d39422" }}>{site.hazardExposure}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Road Access:</td><td style={{ textAlign: "right", fontWeight: "700", color: "#3faf6a" }}>{site.roadAccess}</td></tr>
                          </tbody>
                        </table>
                        <button
                          className="primary-btn"
                          style={{
                            width: "100%",
                            padding: "6px",
                            background: isSelectedOverride ? "#3faf6a" : "#1f5a8a",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "700",
                            fontSize: "9px",
                            cursor: "pointer"
                          }}
                          onClick={() => {
                            setSelectedSiteName(site.name);
                            addActivityLog(`AI recommended safe site overridden to: ${site.name}`, "info");
                            showToast(`Recommended safe site overridden to: ${site.name}`, "info");
                          }}
                        >
                          {isSelectedOverride ? "✓ RECOMMENDED SITE" : "SELECT SITE"}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* C. CRITICAL INFRASTRUCTURE LAYER */}
              {showInfra && activeScenario.infrastructure.map((infra) => (
                <Marker
                  key={infra.name}
                  position={infra.center}
                  icon={createInfraIcon(infra.icon)}
                >
                  <Popup>
                    <div style={{ fontSize: "10px", fontFamily: "Inter, sans-serif" }}>
                      <strong>{infra.name}</strong>
                      <div style={{ marginTop: "4px", color: "#687b8a" }}>Status: Full Operational Capacity</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* D. EVACUATION ROUTES LAYER */}
              {showRoutes && activeScenario.evacuationRoutes.map((route, idx) => {
                if (route.incident !== selected) return null;
                return (
                  <Polyline
                    key={`route-${idx}`}
                    positions={route.positions}
                    pathOptions={{color: "#1f5a8a", weight: 4, dashArray: "5, 5", opacity: 0.85}}
                  >
                    {/* --- 9. EVACUATION ROUTE POPUP --- */}
                    <Popup>
                      <div style={{ minWidth: "180px", fontFamily: "Inter, sans-serif" }}>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "10px", fontWeight: "800", color: "#1f5a8a" }}>EVACUATION ROUTE</h4>
                        <p style={{ margin: "0 0 8px 0", fontSize: "9px", color: "#687b8a", fontWeight: "600" }}>{route.name}</p>
                        <table style={{ width: "100%", fontSize: "9px", borderCollapse: "collapse", marginBottom: "8px" }}>
                          <tbody>
                            <tr><td style={{ color: "#687b8a" }}>Distance:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{route.distance}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Est. Time:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{route.time}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Road Status:</td><td style={{ textAlign: "right", fontWeight: "700", color: route.status.includes("LIMIT") ? "#d39422" : "#3faf6a" }}>{route.status}</td></tr>
                            <tr><td style={{ color: "#687b8a" }}>Congestion:</td><td style={{ textAlign: "right", fontWeight: "700" }}>{route.congestion}</td></tr>
                          </tbody>
                        </table>
                        <button
                          className="primary-btn"
                          style={{
                            width: "100%",
                            padding: "6px",
                            background: "#dc4653",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "700",
                            fontSize: "9px",
                            cursor: "pointer"
                          }}
                          onClick={() => setActiveModal("evacuation")}
                        >
                          OPEN EVACUATION MODE
                        </button>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}

              {/* Current Active Incident Location Pin */}
              <Marker position={mapCenter} icon={createRiskIcon(currentIncident.risk === "CRITICAL")}>
                <Popup>
                  <div style={{ fontSize: "10px", fontFamily: "Inter, sans-serif" }}>
                    <b>{currentIncident.name}</b>
                    <br />
                    Type: {currentIncident.type}
                    <br />
                    Priority: {currentIncident.priority}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
            <div className="map-callout">
              <b>🔴 RED ZONE DETECTED</b>
              <span>{activeScenario.locationName} • Prototype Data</span>
            </div>
          </div>
        </section>

        <aside className="right">
          {/* --- 5. AI RECOMMENDATION & DECISION BASIS --- */}
          <div className="panel recommendation">
            <div className="panel-title">AI RECOMMENDATION</div>
            <div className="critical">{currentIncident.priority === "IMMEDIATE" ? "IMMEDIATE RELOCATION" : "MONITOR SITUATION"}</div>
            
            <p style={{ margin: "0 0 10px 0" }}>{currentIncident.name} has high exposure and evacuation constraints.</p>
            
            <div className="recommend-site" style={{ marginBottom: "12px" }}>
              <span>RECOMMENDED SAFE SITE</span>
              <b>🟢 {recommendedSite.name}</b>
              <small>{recommendedSite.distance} • {recommendedSite.available.toLocaleString()} capacity available</small>
            </div>

            <div style={{ fontSize: "9px", color: "#687b8a", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>
              Decision Rationale:
            </div>
            <p style={{ fontSize: "9.5px", margin: "0 0 12px 0", color: "#192634", lineHeight: "1.4" }}>
              {currentIncident.explanation}
            </p>

            <div className="why">
              <b>WHY {recommendedSite.name.toUpperCase()}?</b>
              {currentIncident.whySite.map((why, idx) => (
                <div key={idx}>✓ {why}</div>
              ))}
            </div>

            <div className="ai-basis-grid">
              <div className="ai-basis-item">
                <span>Flood Exposure</span>
                <b className="red">{currentIncident.floodRisk}%</b>
              </div>
              <div className="ai-basis-item">
                <span>Road Status</span>
                <b>{currentIncident.roadAccess}</b>
              </div>
              <div className="ai-basis-item">
                <span>At Risk</span>
                <b>{currentIncident.affected.toLocaleString()}</b>
              </div>
              <div className="ai-basis-item">
                <span>Site Capacity</span>
                <b className="green">{recommendedSite.available.toLocaleString()}</b>
              </div>
              <div className="ai-basis-item">
                <span>Distance</span>
                <b>{recommendedSite.distance}</b>
              </div>
              <div className="ai-basis-item">
                <span>AI Confidence</span>
                <b className="blue">{currentIncident.confidence}%</b>
              </div>
            </div>

            <div className="ai-confidence-badge">
              🧠 AI System Confidence: {currentIncident.confidence}%
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">VULNERABILITY SNAPSHOT</div>
            <div className="big-number">{currentIncident.affected.toLocaleString()}</div>
            <div className="subtle">people potentially affected</div>
            <div className="mini-grid">
              <Mini label="Children" value={Math.round(currentIncident.affected * 0.18).toLocaleString()}/>
              <Mini label="Elderly" value={Math.round(currentIncident.affected * 0.14).toLocaleString()}/>
              <Mini label="Disability" value={Math.round(currentIncident.affected * 0.03).toLocaleString()}/>
              <Mini label="Medical" value={Math.round(currentIncident.affected * 0.01).toLocaleString()}/>
            </div>
          </div>

          <div className="panel actions">
            <div className="panel-title">RESPONSE ACTIONS</div>
            <button className="primary" onClick={() => setActiveModal("alerts")}>🚨 SEND AUTHORITY ALERTS</button>
            <button onClick={() => setActiveModal("evacuation")}>📍 OPEN EVACUATION MODE</button>
            <button onClick={() => setActiveModal("ngos")}>🤝 COORDINATE NGOs / VOLUNTEERS</button>
            <button onClick={() => setActiveModal("relief")}>💰 VIEW VERIFIED RELIEF NEEDS</button>
          </div>
        </aside>
      </main>

      <footer>
        <span>JANRAKSHAK • SIH26191 PROTOTYPE</span>
        <span>Decision-support prototype • Simulated scenario for {activeScenario.name}</span>
      </footer>

      {/* Reusable Modal & Toast Components */}
      <ToastContainer toasts={toasts} onClose={closeToast} />

      {/* Modal 1: Send Authority Alerts */}
      <Modal
        isOpen={activeModal === "alerts"}
        onClose={() => setActiveModal(null)}
        title="Emergency Authority Alert"
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
        <p style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "700", color: "#dc4653" }}>Incident: {currentIncident.name}</p>
        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e0e7ed", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
            <span>Type:</span><strong>{currentIncident.type}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
            <span>Hazard Score:</span><strong>{currentIncident.hazardScore}/100</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
            <span>People Affected:</span><strong>{currentIncident.affected.toLocaleString()}</strong>
          </div>
        </div>
        <p style={{ margin: "0 0 16px 0", fontWeight: "700", color: "#dc4653", fontStyle: "italic" }}>
          ⚠️ Immediate relocation recommended.
        </p>
        
        <div style={{ fontWeight: "700", marginBottom: "6px", fontSize: "11px", color: "#687b8a" }}>ALERT RECIPIENTS:</div>
        <div className="recipients-checklist">
          <label className="recipient-label">
            <input type="checkbox" defaultChecked disabled />
            District Disaster Management Authority (DDMA)
          </label>
          <label className="recipient-label">
            <input type="checkbox" defaultChecked disabled />
            Local Police Department
          </label>
          <label className="recipient-label">
            <input type="checkbox" defaultChecked disabled />
            Medical Response Team
          </label>
          <label className="recipient-label">
            <input type="checkbox" defaultChecked disabled />
            NGOs / Volunteers Command
          </label>
        </div>

        {dispatchedTimestamp && (
          <div className="alert-success-banner">
            🚀 ALERTS DISPATCHED AT {dispatchedTimestamp}
          </div>
        )}
      </Modal>

      {/* Modal 2: Evacuation Mode */}
      <Modal
        isOpen={activeModal === "evacuation"}
        onClose={() => setActiveModal(null)}
        title="EVACUATION MODE"
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
          <span className="evac-alert-badge">PRIORITY: IMMEDIATE</span>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "800" }}>{currentIncident.name} Evacuation Plan</h3>
          <p style={{ margin: "0", color: "#687b8a" }}>{currentIncident.affected.toLocaleString()} people potentially affected</p>
        </div>

        {evacuationActive ? (
          <div className="evac-status-banner" style={{ background: "#eff9f2", color: "#276543", borderColor: "#ccebd6" }}>
            🟢 EVACUATION PLAN ACTIVE
          </div>
        ) : (
          <div className="evac-status-banner" style={{ background: "#fff1d2", color: "#a26b00", borderColor: "#ffe3a8", animation: "none" }}>
            ⚠️ EVACUATION PLAN PENDING ACTIVATION
          </div>
        )}

        <div className="evac-details-grid">
          <div className="evac-card">
            <h4>Registered for Relocation</h4>
            <p>{Math.round(currentIncident.affected * 0.32).toLocaleString()}</p>
            <small>32% of affected population</small>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: "32%" }}></div>
            </div>
          </div>
          <div className="evac-card">
            <h4>Remaining in Danger Zone</h4>
            <p>{(currentIncident.affected - Math.round(currentIncident.affected * 0.32)).toLocaleString()}</p>
            <small>Requires urgent transport</small>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: "68%", background: "#dc4653" }}></div>
            </div>
          </div>
        </div>

        <div className="evac-destination">
          <h4 style={{ color: "#1f5a8a" }}>Recommended Destination</h4>
          <p style={{ color: "#1f5a8a" }}>🟢 {recommendedSite.name}</p>
          <small style={{ color: "#687b8a" }}>
            Distance: {recommendedSite.distance} • Available Capacity: {recommendedSite.available.toLocaleString()}
          </small>
        </div>

        <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #cbd8e2", marginBottom: "16px", fontSize: "10px" }}>
          <div><strong>Recommended Evacuation Route:</strong> {currentIncident.name} → {recommendedSite.name}</div>
          <div style={{ marginTop: "4px" }}><strong>Est. Travel Time:</strong> 11 min</div>
          <div style={{ marginTop: "4px" }}><strong>Route Status:</strong> <span style={{ color: "#3faf6a", fontWeight: "700" }}>CLEAR</span></div>
        </div>
      </Modal>

      {/* Modal 3: Coordinate NGOs */}
      <Modal
        isOpen={activeModal === "ngos"}
        onClose={() => setActiveModal(null)}
        title="NGO & Volunteer Coordination"
        footer={
          <button className="secondary-btn" onClick={() => setActiveModal(null)}>Close</button>
        }
      >
        <p style={{ marginBottom: "16px", color: "#687b8a" }}>Select emergency teams to deploy to {currentIncident.name} coordinates:</p>
        <div className="ngo-list">
          {[
            { name: "Medical Volunteers", desc: "24 personnel available", val: "Medical Volunteers" },
            { name: "Food & Water Team", desc: "38 personnel available", val: "Food & Water Team" },
            { name: "Transport Volunteers", desc: "17 personnel available", val: "Transport Volunteers" },
            { name: "Search & Rescue", desc: "12 personnel available", val: "Search & Rescue" }
          ].map((group) => {
            const isDeployed = deployedNgos.includes(group.val);
            return (
              <div key={group.val} className="ngo-row">
                <div className="ngo-info">
                  <h4>{group.name}</h4>
                  <span>{group.desc}</span>
                </div>
                {isDeployed ? (
                  <span className="ngo-deployed-badge">DEPLOYED</span>
                ) : (
                  <button className="ngo-deploy-btn" onClick={() => deployNgo(group.val)}>Deploy</button>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Modal 4: View Relief Needs */}
      <Modal
        isOpen={activeModal === "relief"}
        onClose={() => setActiveModal(null)}
        title="Verified Relief Needs"
        footer={
          <button className="secondary-btn" onClick={() => setActiveModal(null)}>Close</button>
        }
      >
        <p style={{ marginBottom: "12px", color: "#687b8a" }}>Current supply requests and critical shortfalls for {currentIncident.name}:</p>
        <table className="relief-table">
          <thead>
            <tr>
              <th>Need Item</th>
              <th>Quantity</th>
              <th>Priority</th>
              <th>Status / Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Drinking Water", qty: "2,500 L", priority: "HIGH", colorClass: "high" },
              { name: "Food Kits", qty: "1,100 kits", priority: "HIGH", colorClass: "high" },
              { name: "Blankets", qty: "620 units", priority: "MEDIUM", colorClass: "medium" },
              { name: "Medical Kits", qty: "180 units", priority: "CRITICAL", colorClass: "critical" },
              { name: "Temporary Shelters", qty: "420 units", priority: "HIGH", colorClass: "high" }
            ].map((item) => {
              const isCoordinated = coordinatedNeeds.includes(item.name);
              return (
                <tr key={item.name}>
                  <td style={{ fontWeight: "600" }}>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>
                    <span className={`relief-priority ${item.colorClass}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    {isCoordinated ? (
                      <span className="relief-coordinated-text">COORDINATED</span>
                    ) : (
                      <button className="relief-coordinate-btn" onClick={() => coordinateNeed(item.name)}>
                        Mark as Coordinated
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Modal>
    </div>
  )
}

function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
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
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <footer className="modal-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" role="alert" style={{ borderLeftColor: toast.type === "info" ? "#1f5a8a" : "#3faf6a" }}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => onClose(toast.id)} aria-label="Dismiss message">&times;</button>
        </div>
      ))}
    </div>
  );
}

function Stat({label,value,tone}){return <div className="stat"><span>{label}</span><b className={tone}>{value}</b></div>}
function Incident({name,type,risk,selected,onClick}){return <button className={"incident "+(selected?"selected":"")} onClick={onClick}><div><b>{name}</b><small>{type}</small></div><span className={risk==="CRITICAL"?"pill redpill":"pill amberpill"}>{risk}</span></button>}
function Metric({label,value,tone}){return <div className="metric"><span>{label}</span><b className={tone}>{value}</b></div>}
function Mini({label,value}){return <div><b>{value}</b><small>{label}</small></div>}

createRoot(document.getElementById("root")).render(<App/>);