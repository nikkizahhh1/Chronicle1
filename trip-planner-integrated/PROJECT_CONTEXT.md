# LocalSide - Project Context

**Last Updated**: 2026-03-01

## Project Overview

**LocalSide** is a comprehensive AI-powered travel planning application that helps users create personalized itineraries for location-based trips and multi-stop road trips. The application combines cloud-native serverless architecture, advanced AI (Claude via AWS Bedrock), and a beautiful mobile-first interface.

---

## Architecture

### Technology Stack

**Backend**
- Runtime: Python 3.9 on AWS Lambda (Serverless)
- Framework: Serverless Framework v4
- Cloud Provider: AWS
- Key Services: Cognito, DynamoDB, S3, Bedrock, Location Services
- Libraries: boto3, bcrypt, PyJWT, python-dotenv

**Mobile App**
- Framework: React Native with Expo v54
- Language: TypeScript
- Styling: NativeWind (Tailwind CSS for React Native)
- Navigation: React Navigation v7
- Maps: react-native-maps, AWS Geo
- Location: expo-location
- State Management: AWS Amplify + React Native Async Storage

**Frontend**
- Framework: React + Vite (build artifacts present in TripApp_AIChallange/frontend)

---

## Project Structure

```
LocalSide/
├── backend/                          # Python Lambda/Serverless backend
│   ├── handlers/                    # 8 Lambda function handlers
│   │   ├── auth.py                  # Authentication (signup, login, confirm)
│   │   ├── trips.py                 # Trip CRUD operations
│   │   ├── itinerary.py            # Itinerary management
│   │   ├── ai_itinerary.py         # AI-powered itinerary generation
│   │   ├── profile.py              # User profiles
│   │   ├── quiz.py                 # Interest quiz
│   │   ├── trip_planning.py        # Trip recommendations & costs
│   │   └── uploads.py              # File upload handling (S3)
│   ├── models/                      # Data models (User, Trip, POI)
│   ├── services/                    # 7 service modules
│   │   ├── claude_service.py       # Claude API integration
│   │   ├── prompt_builder.py       # AI prompt construction
│   │   ├── itinerary_parser.py     # Parse AI responses
│   │   ├── trip_calculator_service.py  # Cost calculations
│   │   └── ...                     # Other services
│   ├── utils/                       # Auth, DynamoDB, S3, response utilities
│   ├── prompts/                     # System, location, and roadtrip prompts
│   ├── requirements.txt             # Python dependencies
│   ├── serverless.yml              # Infrastructure as code (30+ Lambda functions)
│   └── .env.example                # Environment template
├── TripApp_AIChallange/
│   ├── frontend/                    # React frontend (build artifacts)
│   └── mobile/                      # React Native/Expo mobile app
│       ├── src/
│       │   ├── components/         # UI components (map, trip, buttons, inputs)
│       │   ├── screens/            # 20+ screen components
│       │   │   ├── Auth/           # Login, Signup, Welcome
│       │   │   ├── Home/           # Trip overview
│       │   │   ├── Planning/       # Questionnaire, builder, quiz
│       │   │   ├── TripViews/      # List, Day, Route, Map views
│       │   │   └── Features/       # Diary, Friends, Profile
│       │   ├── navigation/         # React Navigation setup
│       │   ├── services/           # API, auth services
│       │   └── types/              # TypeScript interfaces
│       ├── assets/                 # Icons, fonts, images
│       ├── app.json                # Expo configuration
│       ├── App.tsx                 # Root component
│       └── package.json            # Dependencies
├── infrastructure/                  # AWS setup scripts
│   ├── dynamodb_tables.py         # Create DynamoDB tables
│   └── COGNITO_SETUP.md           # Cognito setup guide
├── scraper/                        # POI data collection
│   ├── google_places_scraper.py   # Scrape Google Places API
│   ├── create_dynamodb_table.py   # POI table setup
│   └── query_pois.py              # Query POI data
├── DEPLOYMENT_GUIDE.md            # Comprehensive deployment instructions
└── .claude/                        # Claude workspace configuration
```

---

## Core Features

### 1. Authentication & User Management
- **AWS Cognito Integration**: Email-based user registration with verification
- **Password Requirements**: Min 8 chars, uppercase, lowercase, number
- **Endpoints**:
  - `POST /auth/signup` - User registration
  - `POST /auth/login` - Login with JWT token
  - `POST /auth/confirm` - Email verification
  - `POST /auth/resend` - Resend verification code
- **Profile Management**: User profiles, settings, preferences
  - `GET /profile` - Get user profile
  - `PUT /profile` - Update user profile
  - `GET /settings`, `PUT /settings` - Manage settings

### 2. Trip Planning & Management
- **Trip Types**:
  1. **Location Trips**: Single destination planning
  2. **Road Trips**: Multi-stop route planning with gas cost calculation
- **CRUD Operations**:
  - `GET /trips` - List user's trips
  - `POST /trips` - Create new trip
  - `GET /trips/{trip_id}` - Get trip details
  - `PUT /trips/{trip_id}` - Update trip
  - `DELETE /trips/{trip_id}` - Delete trip
- **Trip Features**:
  - Trip questionnaire (duration, budget, travelers, intensity)
  - Manual trip builder
  - Interest quiz for personalization
  - Cost calculations and budgets
  - Route optimization

### 3. AI-Powered Itinerary Generation
- **Claude Service** (`claude_service.py`):
  - Model: Claude Sonnet 4.6 (via AWS Bedrock)
  - Max tokens: 4096
  - Temperature: 0.7 (balanced creativity)
  - Supports both Claude and Nova models
- **Endpoint**: `POST /ai/itinerary/generate`
- **Prompt System**:
  - Expert travel planner guidelines
  - Structured JSON output format
  - Daily activities with times
  - Cost estimates
  - Booking requirements
  - Local tips
- **Output Parser**: Validates and structures AI responses

### 4. Itinerary Management
- **Add/Remove POIs**: `POST /trips/{trip_id}/itinerary/pois`, `DELETE .../pois/{poi_id}`
- **Update Activities**: `PUT /trips/{trip_id}/itinerary/pois/{poi_id}`
- **Reorder Itinerary**: `POST /trips/{trip_id}/itinerary/reorder`
- **Calculate Routes**: Optimal route calculation using AWS Location Services

### 5. Recommendations & Planning Tools
- **Recommendations**: `GET /trips/{trip_id}/recommendations` - Activity suggestions
- **Cost Calculator**: `GET /trips/{trip_id}/costs` - Budget breakdown
- **Interest Quiz**: `GET /quiz`, `POST /quiz/submit` - Personalization questionnaire

### 6. File Uploads & Storage
- **S3 Integration**: Secure file storage
- **Upload Types**:
  - Profile photos: `POST /uploads/profile-photo`
  - Trip photos: `POST /uploads/trip-photo`
  - POI images: `POST /uploads/poi-image`
  - Itinerary PDFs: `POST /uploads/itinerary-pdf`
- **Delete**: `DELETE /uploads` - Remove uploaded files

### 7. Mobile App Screens
1. **Authentication**: Login, Signup, Welcome screens
2. **Home Screen**: Trip list with overview
3. **Trip Planning**:
   - Trip Questionnaire (duration, budget, travelers, intensity)
   - Manual Trip Builder
   - Interest Quiz
   - Trip Preview
4. **Trip Views**:
   - Trip List View (all trips)
   - Trip Day List View (daily breakdown)
   - Trip Route View (map-based view)
   - Trip Map View (interactive map)
5. **Features**:
   - Travel Diary: Photo uploads, daily notes, memories per day
   - Friends Feature: Share trips, collaborative planning
   - Edit Activities: Modify itinerary
   - Trip Memories: Store trip experiences
   - Share Trip: Share with friends
   - Profile: User profile management

### 8. Travel Diary (In Progress)
- Document trip experiences
- Upload photos per day
- Write notes and memories
- View previous entries

### 9. Friends Feature (In Progress)
- Add friends
- View shared trips
- Collaborate on planning

---

## Database Schema

### DynamoDB Tables

**Users Table**
```
PK: user_id (UUID)
Attributes:
- email (string)
- quiz_results (map)
- created_at (timestamp)
```

**Trips Table**
```
PK: trip_id (UUID)
Attributes:
- user_id (UUID)
- type (string: "location" | "roadtrip")
- destination (string)
- questionnaire (map: duration, budget, travel_style, etc.)
- itinerary (list)
- status (string)
- created_at (timestamp)
```

**Travel POIs Table**
```
PK: poi_id (UUID)
Attributes:
- name (string)
- category (string)
- location (map: lat, lng, address)
- description (string)
- rating (number)
- estimated_cost (number)
- booking_required (boolean)
- tips (list)
- created_at (timestamp)
```

---

## AWS Services Used

1. **Lambda**: Serverless compute for 30+ handler functions
2. **API Gateway**: REST API endpoints
3. **Cognito**: User authentication and email verification
4. **DynamoDB**: NoSQL database for users, trips, POIs
5. **S3**: File storage (photos, PDFs)
6. **Bedrock**: Claude AI API access
7. **Location Services**: Maps, place search, route calculation
8. **IAM**: Fine-grained access control policies
9. **CloudFormation**: Infrastructure as code (via Serverless Framework)

**Region**: `us-east-1` (Free tier eligible)

---

## Environment Variables

```bash
# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX

# Authentication
JWT_SECRET=<secure-secret>

# AWS Services
S3_BUCKET_NAME=travel-assistant-uploads-XXX
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-6-20260217-v1:0

# AWS Location Services
LOCATION_MAP_NAME=TripMapView
LOCATION_PLACE_INDEX_NAME=TripPlaceIndex
```

---

## Data Collection

### POI Scraper (`scraper/`)
- **Purpose**: Collect hidden gem Points of Interest for cities
- **Data Source**: Google Places API
- **Features**:
  - City-based searches
  - Blacklist filters (chains, medical, adult content)
  - Search templates: restaurants, museums, galleries, parks, nightlife
  - Stores in DynamoDB for app recommendations
- **Files**:
  - `google_places_scraper.py` - Main scraper
  - `create_dynamodb_table.py` - POI table setup
  - `query_pois.py` - Query scraped data

---

## Design System

### Color Palette
- **Primary**: Dark Green (#1F3D2B)
- **Accent**: Terracotta/Orange (#D87C52)
- **Background**: Cream/Beige (#F4EBDC)
- **Secondary**: Tan (#E5D4C1)
- **Text**: Dark gray/brown (#8B7355)

### Design Patterns
- Modal-based features (diary, friends)
- Tab-based navigation
- Card-based layouts
- Icon-based navigation
- Clean, minimalist aesthetic

---

## Configuration Files

### Mobile
- `app.json` - Expo configuration (plugins: location, maps, fonts)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS setup
- `babel.config.js` - Babel transpilation

### Backend
- `serverless.yml` - Complete AWS infrastructure (30+ functions)
- `requirements.txt` - Python dependencies
- `.env.example` - Environment variables template

---

## Documentation Files

- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `infrastructure/COGNITO_SETUP.md` - AWS Cognito configuration
- `TRAVEL_DIARY.md` - Travel diary feature specification
- `FRIENDS_FEATURE.md` - Friends feature specification
- `MAP_SETUP.md` - Map configuration guide
- `EXPO_GO_FIX.md` - Expo troubleshooting
- `BACKEND_SETUP.md` - Backend setup guide

---

## API Endpoints Summary

### Authentication
- `POST /auth/signup` - Register user
- `POST /auth/login` - Login
- `POST /auth/confirm` - Confirm email
- `POST /auth/resend` - Resend verification

### Trips
- `GET /trips` - List trips
- `POST /trips` - Create trip
- `GET /trips/{trip_id}` - Get trip
- `PUT /trips/{trip_id}` - Update trip
- `DELETE /trips/{trip_id}` - Delete trip

### Itinerary
- `POST /trips/{trip_id}/itinerary/pois` - Add POI
- `DELETE /trips/{trip_id}/itinerary/pois/{poi_id}` - Remove POI
- `PUT /trips/{trip_id}/itinerary/pois/{poi_id}` - Update POI
- `POST /trips/{trip_id}/itinerary/reorder` - Reorder

### AI & Planning
- `POST /ai/itinerary/generate` - Generate AI itinerary
- `GET /trips/{trip_id}/recommendations` - Get recommendations
- `GET /trips/{trip_id}/costs` - Calculate costs

### User
- `GET /profile` - Get profile
- `PUT /profile` - Update profile
- `GET /settings` - Get settings
- `PUT /settings` - Update settings

### Uploads
- `POST /uploads/profile-photo` - Upload profile photo
- `POST /uploads/trip-photo` - Upload trip photo
- `POST /uploads/poi-image` - Upload POI image
- `POST /uploads/itinerary-pdf` - Upload PDF
- `DELETE /uploads` - Delete file

### Quiz
- `GET /quiz` - Get quiz
- `POST /quiz/submit` - Submit answers

---

## Development Status

### Completed Features
- User authentication with Cognito
- Trip CRUD operations
- AI-powered itinerary generation (Claude)
- Interest quiz system
- Profile and settings management
- File uploads to S3
- POI management
- Trip cost calculations
- Route optimization
- Mobile app UI (all screens)
- Friends feature UI
- Travel diary UI

### In Progress / Planned
- Photo picker integration
- Camera integration
- Travel diary backend integration
- Real-time collaboration
- Export to PDF
- Social media sharing

---

## Git History

**Current Branch**: `main`

**Recent Commits**:
1. `f6d468c` - Add mobile app features and backend AI itinerary service
2. `32ddc45` - Add React frontend and React Native mobile applications
3. `dd8a57a` - Updated backend infrastructure
4. `922fd13` - Initial commit: backend

---

## Key Dependencies

### Backend (Python)
- boto3 - AWS SDK
- bcrypt - Password hashing
- PyJWT - JWT tokens
- python-dotenv - Environment management

### Mobile (Node/React Native)
- expo - Mobile framework
- react-navigation - Navigation
- react-native-maps - Maps
- expo-location - Location services
- aws-amplify - AWS integration
- nativewind - Tailwind CSS
- @aws-sdk/client-geo-maps - AWS maps
- @aws-sdk/client-geo-places - AWS places
- @aws-sdk/client-geo-routes - AWS routing

---

## Deployment

### Prerequisites
1. AWS CLI installed and configured
2. AWS account with free-tier eligible services
3. Serverless Framework v4 installed
4. Node.js and npm
5. Python 3.9+
6. Expo CLI

### Deployment Steps
1. Configure AWS credentials
2. Create Cognito user pool
3. Set up S3 bucket
4. Create DynamoDB tables
5. Deploy backend with Serverless
6. Configure environment variables
7. Deploy frontend/mobile apps

**See `DEPLOYMENT_GUIDE.md` for detailed instructions**

---

## Cost Estimates

### Free Tier (First 12 months)
- Lambda: 1M requests/month free
- API Gateway: 1M calls/month free
- DynamoDB: 25GB storage, 200M requests/month free
- Cognito: 50,000 MAU free forever
- S3: 5GB storage, 20,000 GET, 2,000 PUT free
- Bedrock: Pay-per-use (Claude API calls)

**Estimated Monthly Cost**: $0-$10 for personal use (mostly Bedrock usage)

---

## Summary

LocalSide is a production-ready, AI-powered travel planning application built on modern cloud-native architecture. It combines serverless AWS infrastructure, advanced AI (Claude), and a beautiful mobile-first experience to help users discover and plan personalized trips. The project demonstrates best practices in full-stack development, serverless architecture, AI integration, and cross-platform mobile development.
