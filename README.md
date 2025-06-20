# PDF Data Extraction App

This React application allows users to view PDFs and extract data using AGX™ technology. The application can run in both mock mode (for development) and live mode (for production).

## Features

- PDF file viewing and management
- Data extraction from PDFs
- Markdown conversion and download
- Search functionality
- Toast notifications for user feedback
- Responsive design

## Running the Application

The application can run in two modes: Mock (for development) and Live (for production).

### Mock Mode

Mock mode uses predefined sample PDFs and mock data, perfect for development and testing:

```bash
# Start in mock mode
npm run start:mock
```

Features in mock mode:
- Uses sample PDFs from `/public/sample/` directory
- Instant responses with mock data
- Works offline
- Great for UI development and testing
- Includes sample PDFs:
  - test_quote.pdf
  - EXTERNAL RFQ 6000243598.pdf

### Live Mode

Live mode connects to the actual API server for real PDF processing:

```bash
# Start in live mode
npm run start:live
```

Features in live mode:
- Connects to real backend API
- Real PDF processing
- Requires active internet connection
- Production-like environment

### Environment Configuration

The application uses different environment files for different modes:

- `.env.development` - Development settings (mock mode)
- `.env.production` - Production settings (live mode)

You can customize the API endpoint by modifying these files.

## Available Scripts

In the project directory, you can run:

### `npm start:mock`

Runs the app in development mode with mock data.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm start:live`

Runs the app in development mode with live API connection.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Verifying the Mode

When the application starts, you can verify the current mode by:

1. Opening browser developer tools (F12)
2. Checking the console for:
   - "Running in MOCK mode" or "Running in LIVE mode"
   - The API URL being used

## Error Handling

The application includes comprehensive error handling:
- Network connection issues
- API errors
- PDF processing errors
- File download issues

All errors are displayed using toast notifications for better user experience.

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- react-hot-toast for notifications
- PDF.js for PDF viewing
- Mock API system for development
