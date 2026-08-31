# JANRAKSHAK — SIH26191 Prototype

## What this prototype demonstrates
- Disaster command-center dashboard
- Simulated multi-hazard GIS red zone
- Vulnerability snapshot
- Relocation priority
- Safe-site recommendation + carrying capacity
- Authority/NGO action buttons
- Offline/degraded connectivity simulation
- OpenStreetMap base map

## Run locally

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Important for the hackathon
This is a decision-support prototype using simulated scenario data. Do not claim that it is connected to live police, army, hospital, government finance, or satellite systems unless those integrations are actually implemented.

For the next build step, replace the scenario object in `src/main.jsx` with your backend/API data and add the second screen for verified relief management.
