# QOF Calculator

A tool for analyzing QOF (Quality and Outcomes Framework) data for GP practices.

## Features

- Search for practices by name, code, or postcode
- View practice QOF indicators and financial data
- Compare practice prevalence with SUB ICB averages
- Calculate potential financial opportunities
- Interactive charts and visualizations

## Setup

1. Clone the repository:
```bash
git clone https://github.com/DrWillGao/cvdqofcalculator.git
cd cvdqofcalculator
```

2. Install dependencies for both frontend and backend:
```bash
npm run install:all
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:8080
- Frontend development server on http://localhost:8000

## Project Structure

```
cvdqofcalculator/
├── frontend/           # React frontend
│   ├── src/           # Source files
│   └── public/        # Static files
├── backend/           # Express.js backend
│   ├── data/         # CSV data files
│   └── server.js     # Server implementation
└── package.json      # Root package.json
```

## Technologies Used

- Frontend:
  - React
  - Vite
  - Recharts
  - TailwindCSS
- Backend:
  - Node.js
  - Express
  - csv-parse

## Development

- Frontend code is in `frontend/src/`
- Backend code is in `backend/`
- CSV data is stored in `backend/data/`

## License

MIT 