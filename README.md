# Form Maker Application

A comprehensive form builder application built with the MERN stack, supporting three types of interactive questions: Categorize, Cloze, and Comprehension.

## Features

- **Categorize Questions**: Drag-and-drop items into categories
- **Cloze Questions**: Fill-in-the-blanks with drag-and-drop options
- **Comprehension Questions**: Reading passages with multiple sub-questions
- **Image Support**: Upload images for forms and questions
- **Form Management**: Create, edit, delete, and preview forms
- **Responsive Design**: Built with Tailwind CSS

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB locally:**
   - Windows: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB service:**
   - Windows: MongoDB should start automatically after installation
   - macOS/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`

3. **Install and run the application:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   npm run dev

   # In a new terminal, install frontend dependencies
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 2: MongoDB Atlas (Cloud Database)

1. **Set up MongoDB Atlas:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster
   - Create a database user with read/write permissions
   - Get your connection string

2. **Update the .env file:**
   ```bash
   cd backend
   # Edit .env file and replace the MONGODB_URI with your Atlas connection string
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/formmaker?retryWrites=true&w=majority
   ```

3. **Install and run:**
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev

   # Frontend (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

## Image Upload Setup (Optional)

To enable image uploads, you need to set up Cloudinary:

1. **Create a Cloudinary account:**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get your credentials:**
   - Go to your Cloudinary dashboard
   - Copy Cloud Name, API Key, and API Secret

3. **Update .env file:**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## Project Structure

```
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── server.js        # Express server
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get single form
- `POST /api/forms` - Create new form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `POST /api/forms/upload` - Upload image

## Troubleshooting

### MongoDB Connection Issues
- **Local MongoDB**: Ensure MongoDB service is running
- **MongoDB Atlas**: Check your connection string and network access settings

### Image Upload Issues
- Verify Cloudinary credentials in .env file
- Check that all three Cloudinary environment variables are set

### Port Conflicts
- Backend runs on port 5000, frontend on port 3000
- Change ports in the respective configuration files if needed

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Uses Vite dev server with hot reload
```

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Production
```bash
cd backend
npm start
```

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, React Router, React Beautiful DnD
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Image Upload**: Cloudinary
- **Development**: Nodemon, ESLint

## License

MIT License