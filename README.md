# Central Tax Engine Hub

A standalone tax intelligence platform providing global tax data integration, mobility tracking, pro rata calculations, compliance monitoring, and audit capabilities.

## Features

- **Global Tax Pull** — Real-time data from Tapestry Compliance (100+ jurisdictions)
- **Mobility & Pro Rata** — Cross-border work-day allocation calculations
- **Tax Import** — REST API and file-based tax data ingestion
- **Tax Calculator** — RSU, ESPP, and Options tax liability computation
- **Compliance** — Local law validation and statutory deadline tracking
- **Audit & Flag** — Full audit trail with anomaly detection

## Tech Stack

- React 18 + Vite 4
- Tailwind CSS 3
- Node.js v16+

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn

### Installation

```bash
cd Tax_Engine_Hub
npm install
```

### Development

```bash
npm run dev
```

Runs on `http://localhost:5174` by default.

### Build

```bash
npm run build
```

Outputs to `dist/` directory.

## Project Structure

```
Tax_Engine_Hub/
├── src/
│   ├── App.jsx              # Main app shell
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind CSS
│   └── components/
│       └── TaxEngineHub.jsx # Hub diagram and integrations
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .claude/launch.json
```

## Integration Points

The Tax Engine Hub integrates with:

1. **Tapestry Compliance** — https://database.tapestrycompliance.com/
2. Mobility tracking system (future: REST API)
3. Tax calculation engine (future: REST API)
4. Audit log system (future: REST API)

## License

Internal use only.
