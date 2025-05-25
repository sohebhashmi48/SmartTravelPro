# SmartTravel Pro

An intelligent travel planning platform powered by AI agents that negotiate and curate the best travel deals for you.

## Features

- **AI-Powered Travel Planning**: 5 specialized AI agents work together to find the best deals
- **Gmail Integration**: Get the best 3 deals sent directly to your Gmail inbox with beautiful HTML emails
- **Real-time Agent Negotiations**: Watch AI agents compete to offer you the best prices
- **Comprehensive Deal Comparison**: Compare prices, ratings, and inclusions across multiple agents
- **Interactive Chat Logs**: View detailed conversations between AI agents
- **Admin Dashboard**: Monitor agent performance and analytics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL with Drizzle ORM
- **Email Service**: Nodemailer with Gmail SMTP
- **UI Components**: shadcn/ui
- **Animations**: GSAP
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Gmail account with App Password (for email features)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SmartTravelPro
```

2. Install dependencies:
```bash
npm install
```

3. Set up your MySQL database and update the connection details in the environment variables.

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smarttravel
DB_PORT=3306

# Gmail SMTP Configuration for Email Service
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5000

# Optional: OmniDimension API
OMNIDIMENSION_API_KEY=your_api_key_here
OMNIDIMENSION_ENDPOINT=https://api.omnidimension.com/v1

# Development Environment
NODE_ENV=development
```

### Setting up Gmail SMTP

To enable email functionality:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password in `GMAIL_APP_PASSWORD`
3. **Use your Gmail address** in `GMAIL_USER`

## Email Features

### 📧 Gmail Integration

- **Send All Deals**: Get the top 3 AI-curated deals sent to your Gmail
- **Individual Deal Emails**: Email specific deals with detailed information
- **Beautiful HTML Templates**: Professional email design with deal comparisons
- **Responsive Email Design**: Emails look great on all devices

### Email Templates Include:

- **Deal Comparison**: Side-by-side comparison of all 3 deals
- **Agent Information**: Details about which AI agent found each deal
- **Pricing Breakdown**: Original price, discounted price, and savings
- **Inclusions**: What's included in each package
- **Hotel Ratings**: Star ratings and amenities
- **Booking Links**: Direct links to view full details and book

## Project Structure

```
SmartTravelPro/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── email-service.ts    # Email service with Gmail SMTP
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
└── migrations/            # Database migrations
```

## API Endpoints

### Trip & Deal Management
- `POST /api/trips` - Create a new trip and generate deals
- `GET /api/trips` - Get all trips
- `GET /api/deals` - Get all deals
- `GET /api/deals/:tripId` - Get deals for specific trip

### Email Features
- `POST /api/trips/:tripId/email-deals` - Send all 3 best deals to email
- `POST /api/deals/:id/email` - Send individual deal to email

### Agent & Analytics
- `GET /api/logs` - Get agent activity logs
- `GET /api/agents` - Get agent information
- `GET /api/analytics` - Get agent performance analytics
- `POST /api/logs/sheets` - Export logs to Google Sheets

### Chat Logs
- `GET /api/chat-logs/trip/:tripId` - Get chat logs for specific trip
- `GET /api/chat-logs/agent/:agent` - Get chat logs for specific agent

## Usage

1. **Plan Your Trip**: Fill out the trip form with your destination, dates, and preferences
2. **Watch AI Agents Work**: See 5 AI agents negotiate and find the best deals
3. **Compare Deals**: Review the top 3 deals with detailed information
4. **Email to Gmail**: Click "Get Deals in Gmail" to receive all deals in your inbox
5. **View Chat Logs**: See the complete conversation history between AI agents
6. **Book Your Trip**: Use the provided links to complete your booking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
