# Weather Traffic App

A full-stack web application that displays real-time weather information and live traffic maps for any city.

## Project Structure

\`\`\`
WeatherTrafficApp/
├── weather-backend/          # Node.js Express API server
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js           # Express server with weather API
└── weather-frontend-nextjs/ # Next.js React frontend
    ├── .env.local          # Frontend environment variables
    ├── package.json        # Frontend dependencies
    ├── next.config.mjs     # Next.js configuration
    └── src/
        ├── app/
        │   ├── layout.js   # Root layout
        │   ├── page.js     # Main page
        │   └── globals.css # Global styles
        └── components/
            ├── WeatherModal.js  # Modal component
            └── WeatherModal.css # Modal styles
\`\`\`

## Features

- **Weather Information**: Real-time weather data from OpenWeatherMap API
- **Traffic Map**: Interactive TomTom map with traffic flow and incidents
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live traffic data and weather conditions
- **Modern UI**: Clean, professional interface with dark mode support

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd weather-backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. The `.env` file is already configured with the required API keys:
   - `OPENWEATHER_API_KEY`: OpenWeatherMap API key
   - `FRONTEND_URL`: Frontend URL for CORS
   - `PORT`: Backend server port

4. Start the backend server:
   \`\`\`bash
   npm start
   \`\`\`

   The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd weather-frontend-nextjs
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. The `.env.local` file is already configured with:
   - `NEXT_PUBLIC_BACKEND_URL`: Backend API URL
   - `NEXT_PUBLIC_TOMTOM_API_KEY`: TomTom Maps API key

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

   The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Click the "Check Weather & Traffic" button to open the modal
3. Enter a city name and click "Get Weather" to fetch weather data
4. The traffic map will automatically load and center on the searched city
5. View real-time traffic flow (colored lines) and incident markers on the map

## API Endpoints

### Backend API

- `GET /api/weather?city={cityName}`: Get weather data for a specific city
- `GET /health`: Health check endpoint

### External APIs Used

- **OpenWeatherMap API**: Current weather data
- **TomTom Maps API**: Interactive maps with traffic data
- **TomTom Traffic API**: Real-time traffic incidents and flow

## Technologies Used

### Backend
- Node.js
- Express.js
- Axios (HTTP client)
- CORS middleware
- dotenv (environment variables)

### Frontend
- Next.js 14 (React framework)
- React Hooks (useState, useEffect, useRef)
- Axios (HTTP client)
- TomTom Maps SDK for Web
- CSS3 with responsive design
- CSS Grid and Flexbox layouts

## Environment Variables

### Backend (.env)
\`\`\`
OPENWEATHER_API_KEY=f9dc486a710840158e3c51e29260c030
FRONTEND_URL=http://localhost:3000
PORT=3001
\`\`\`

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_TOMTOM_API_KEY=FJnbXW5U865tZNIcyxFdmjJ8GFlLO20g
\`\`\`

## Development Notes

- The backend uses CORS to allow requests from the frontend
- Weather data includes temperature, humidity, wind speed, and conditions
- Traffic map shows color-coded traffic flow and incident markers
- The application is fully responsive and supports dark mode
- Error handling is implemented for both API calls and map loading

## Production Deployment

For production deployment:

1. Update environment variables with production URLs
2. Build the frontend: `npm run build`
3. Use a process manager like PM2 for the backend
4. Configure reverse proxy (nginx) if needed
5. Ensure HTTPS for production use
