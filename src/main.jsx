import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {MapContainer, TileLayer, Circle, Marker, Popup, Polygon} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

const village = {
  name: "Village A",
  population: 2840,
  affected: 2140,
  hazard: 87,
  flood: 92,
  landslide: 41,
  rainfall: 187,
  road: "Limited",
  priority: "IMMEDIATE",
  site: "Safe Site B",
  siteCapacity: 3500,
  siteOccupied: 620,
  siteAvailable: 2880,
  distance: "4.2 km"
};

const safeIcon = new L.DivIcon({
  className: "custom-marker",
  html: '<div class="marker safe">S</div>',
  iconSize: [28,28],
  iconAnchor: [14,14]
});
const riskIcon = new L.DivIcon({
  className: "custom-marker",
  html: '<div class="marker risk">!</div>',
  iconSize: [28,28],
  iconAnchor: [14,14]
});

function App(){
  const [selected, setSelected] = useState("Village A");
  const [offline, setOffline] = useState(false);
  const [alerts, setAlerts] = useState(false);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">JANRAKSHAK</div>
          <div className="tagline">AI-POWERED GEOSPATIAL DISASTER INTELLIGENCE</div>
        </div>
        <div className="header-actions">
          <span className={"status " + (offline ? "offline":"online")}>
            {offline ? "● OFFLINE / DEGRADED" : "● SYSTEM ONLINE"}
          </span>
          <button onClick={()=>setOffline(!offline)}>{offline ? "Restore Network":"Simulate Network Failure"}</button>
        </div>
      </header>

      <section className="stats">
        <Stat label="ACTIVE RED ZONES" value="03" tone="red"/>
        <Stat label="PEOPLE AT RISK" value="8,420" tone="red"/>
        <Stat label="SAFE SITES" value="07" tone="green"/>
        <Stat label="ACTIVE ALERTS" value={alerts ? "16":"12"} tone="blue"/>
      </section>

      <main className="grid">
        <aside className="left">
          <div className="panel">
            <div className="panel-title">ACTIVE INCIDENTS</div>
            <Incident name="Village A" type="Flood + Landslide" risk="CRITICAL" selected={selected==="Village A"} onClick={()=>setSelected("Village A")}/>
            <Incident name="Zone 7" type="Urban Flooding" risk="HIGH"/>
            <Incident name="Sector 4" type="Industrial Fire" risk="HIGH"/>
          </div>

          <div className="panel">
            <div className="panel-title">HAZARD ANALYSIS</div>
            <Metric label="Flood risk" value="92 / 100" tone="red"/>
            <Metric label="Landslide risk" value="41 / 100" tone="amber"/>
            <Metric label="Rainfall" value="187 mm" tone="red"/>
            <Metric label="Road accessibility" value="LIMITED" tone="amber"/>
            <div className="score">
              <div><span>COMPOSITE HAZARD SCORE</span><strong>87</strong></div>
              <small>CRITICAL • requires immediate assessment</small>
            </div>
          </div>
        </aside>

        <section className="map-panel">
          <div className="map-header">
            <div>
              <div className="panel-title">LIVE GIS COMMAND MAP</div>
              <div className="subtle">Simulated disaster scenario • Village A</div>
            </div>
            <div className="legend"><span className="dot red"></span> Red zone <span className="dot green"></span> Safe site</div>
          </div>
          <MapContainer center={[12.305,76.655]} zoom={13} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polygon
              positions={[[12.31,76.63],[12.34,76.66],[12.31,76.69],[12.28,76.67],[12.29,76.63]]}
              pathOptions={{color:"#dc4653", fillColor:"#dc4653", fillOpacity:.28}}
            />
            <Circle center={[12.305,76.655]} radius={1100}
              pathOptions={{color:"#dc4653", fillColor:"#dc4653", fillOpacity:.12}}/>
            <Marker position={[12.305,76.655]} icon={riskIcon}>
              <Popup><b>Village A</b><br/>Critical — relocation priority: IMMEDIATE</Popup>
            </Marker>
            <Marker position={[12.322,76.684]} icon={safeIcon}>
              <Popup><b>Safe Site B</b><br/>Available capacity: 2,880</Popup>
            </Marker>
          </MapContainer>
          <div className="map-callout">
            <b>🔴 RED ZONE DETECTED</b>
            <span>2,140 people potentially affected</span>
          </div>
        </section>

        <aside className="right">
          <div className="panel recommendation">
            <div className="panel-title">AI RECOMMENDATION</div>
            <div className="critical">IMMEDIATE RELOCATION</div>
            <p>Village A has high flood exposure and limited evacuation access.</p>
            <div className="recommend-site">
              <span>RECOMMENDED SAFE SITE</span>
              <b>🟢 Safe Site B</b>
              <small>{village.distance} • {village.siteAvailable.toLocaleString()} capacity available</small>
            </div>
            <div className="why">
              <b>WHY SITE B?</b>
              <div>✓ Low hazard exposure</div>
              <div>✓ Sufficient capacity</div>
              <div>✓ Good road access</div>
              <div>✓ Near medical facility</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">VULNERABILITY SNAPSHOT</div>
            <div className="big-number">{village.affected.toLocaleString()}</div>
            <div className="subtle">people potentially affected</div>
            <div className="mini-grid">
              <Mini label="Children" value="384"/>
              <Mini label="Elderly" value="296"/>
              <Mini label="Disability" value="71"/>
              <Mini label="Medical" value="18"/>
            </div>
          </div>

          <div className="panel actions">
            <div className="panel-title">RESPONSE ACTIONS</div>
            <button className="primary" onClick={()=>setAlerts(true)}>🚨 SEND AUTHORITY ALERTS</button>
            <button>📍 OPEN EVACUATION MODE</button>
            <button>🤝 COORDINATE NGOs / VOLUNTEERS</button>
            <button>💰 VIEW VERIFIED RELIEF NEEDS</button>
          </div>
        </aside>
      </main>

      <footer>
        <span>JANRAKSHAK • SIH26191 PROTOTYPE</span>
        <span>Decision-support prototype — not an autonomous relocation order</span>
      </footer>
    </div>
  )
}

function Stat({label,value,tone}){return <div className="stat"><span>{label}</span><b className={tone}>{value}</b></div>}
function Incident({name,type,risk,selected,onClick}){return <button className={"incident "+(selected?"selected":"")} onClick={onClick}><div><b>{name}</b><small>{type}</small></div><span className={risk==="CRITICAL"?"pill redpill":"pill amberpill"}>{risk}</span></button>}
function Metric({label,value,tone}){return <div className="metric"><span>{label}</span><b className={tone}>{value}</b></div>}
function Mini({label,value}){return <div><b>{value}</b><small>{label}</small></div>}

createRoot(document.getElementById("root")).render(<App/>);