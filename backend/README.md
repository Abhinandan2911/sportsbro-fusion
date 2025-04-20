# SportsBro Backend Server

## Getting Started

Follow these steps to start the backend server:

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up your environment variables:
   - Make sure you have a `.env` file in the backend directory
   - Required variables are already in the `.env` file

### Starting the Server

#### Option 1: Using npm

```
npm run dev
```

#### Option 2: Using convenience scripts

**Windows**:
- Double-click the `start.bat` file in the backend folder

**Mac/Linux**:
- Make the script executable: `chmod +x start.sh`
- Run the script: `./start.sh`

### Troubleshooting

If you encounter the "Backend Connection Status" error in the frontend:

1. Make sure the backend server is running
2. Check your `.env` file to ensure the PORT is set to 5003
3. Verify that the frontend's `.env` file has `VITE_API_URL=http://localhost:5003/api`
4. Check for any errors in the terminal where the backend is running

### API Endpoints

- Health Check: `GET /api/health`
- Authentication: `POST /api/auth/login`
- User Profile: `GET /api/auth/profile`

For more details, see the API documentation or explore the code in the routes directory.

## Available Scripts

- `npm run dev`: Starts the development server with hot reload
- `npm run build`: Builds the TypeScript code for production
- `npm start`: Starts the production server using built files

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/profile`: Get current user's profile (protected)
- `PUT /api/auth/profile`: Update current user's profile (protected)

### Product Endpoints

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get product by ID
- `POST /api/products`: Create new product (admin only)
- `PUT /api/products/:id`: Update product (admin only)
- `DELETE /api/products/:id`: Delete product (admin only)

### Team Endpoints

- `GET /api/teams`: Get all teams
- `GET /api/teams/:id`: Get team by ID
- `POST /api/teams`: Create new team (protected)
- `PUT /api/teams/:id`: Update team (protected, creator only)
- `DELETE /api/teams/:id`: Delete team (protected, creator only)
- `POST /api/teams/:id/join`: Join a team (protected)
- `POST /api/teams/:id/leave`: Leave a team (protected)

## Database Models

### User
- fullName: string
- email: string
- password: string (hashed)
- gender: string (optional)
- sports: string[] (optional)
- achievements: array of objects (optional)
- profilePhoto: string (optional)

### Product
- name: string
- category: string
- price: number
- rating: number
- image: string
- description: string
- tags: string[]
- stock: number

### Team
- name: string
- sport: string
- city: string
- skillLevel: string (Beginner, Intermediate, Advanced)
- members: array of User references
- maxSize: number
- description: string
- contactDetails: string
- imgUrl: string (optional)
- createdBy: User reference 