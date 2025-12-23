# Flyola - Cadet Portal

A modern web application for flying club cadets to track their flying progress, manage flight details, and access their licenses and documents.

## Features

- 🛫 **Flight Tracking**: Record and manage detailed information about each flight
- 📊 **Progress Dashboard**: View statistics including total flights and flight hours
- 📄 **Document Management**: Store and manage licenses, certificates, and medical documents
- 🔐 **User Authentication**: Secure login and signup system
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Initial Access

When you first visit the app, you'll see the welcome page with options to:
- **Login**: Access your existing account
- **Sign Up**: Create a new account
- **Skip to Dashboard**: View the dashboard without logging in (demo mode)

### Tracking Flights

1. Navigate to the **Flights** page
2. Click **Add New Flight**
3. Fill in the flight details:
   - Date
   - Aircraft type
   - Duration
   - Location
   - Instructor (if applicable)
   - Additional notes
4. Save your flight

### Managing Documents

1. Go to the **Documents** page
2. Click **Add Document**
3. Enter document information:
   - Document name and type
   - Issue and expiry dates
   - Document number
   - Issuer
   - Notes
4. The app will alert you when documents are expiring soon or have expired

## Technology Stack

- **React 18**: Modern UI library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **Lucide React**: Beautiful icon library
- **LocalStorage**: Client-side data persistence

## Project Structure

```
flying-club-app/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx   # Main layout with navigation
│   ├── context/         # React context providers
│   │   └── AuthContext.jsx  # Authentication state
│   ├── pages/           # Page components
│   │   ├── WelcomePage.jsx
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Flights.jsx
│   │   ├── FlightDetail.jsx
│   │   └── Documents.jsx
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Data Storage

Currently, all data is stored in the browser's localStorage. This means:
- Data persists between sessions for the same browser
- Data is stored locally and not synced across devices
- To backup data, users should export important information manually

## Future Enhancements

- Backend API integration for cloud storage
- File upload for document attachments
- Flight route visualization
- Export flight logs to PDF
- Multi-user support with admin panel
- Email notifications for expiring documents

## License

This project is open source and available for use.


