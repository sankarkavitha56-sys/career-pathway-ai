# 🚀 Career Pathway - AI-Powered Job Search & Career Development Platform

A modern, full-featured web application designed to help job seekers find the perfect role, analyze their resumes, prepare for interviews, and upskill with AI-powered recommendations.

## ✨ Features

- **🔍 Smart Job Search** - Find jobs matching your skills using RapidAPI JSearch integration
- **📊 Resume Analyzer** - Get AI-powered ATS score and improvement suggestions
- **🎯 Job Matching** - AI-driven matching algorithm showing compatibility with jobs
- **📚 Recommended Courses** - Personalized course suggestions to fill skill gaps
- **🎤 Mock Interviews** - Practice interviews with AI (Grok API integration)
- **💼 Application Tracking** - Track your job application status
- **📝 Resume Generator** - Generate professional resumes easily
- **👤 Profile Management** - Manage your career profile

## 🛠 Tech Stack

- **Frontend**: React 18.3 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **APIs**: RapidAPI (JSearch), Grok API
- **PDF Handling**: PDF.js

## 📦 Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/careerpathway.git
cd careerpathway
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Add your API keys to `.env`**
```
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
VITE_GROK_API_KEY=your_grok_api_key_here
```

**Get your API keys:**
- RapidAPI JSearch: https://rapidapi.com/laimoon/api/jsearch
- Grok API: https://console.x.ai/

5. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🚀 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── routes/           # Route definitions
├── services/         # API calls and services
├── App.jsx           # Main app component
└── index.css         # Global styles
```

## 🔐 Security Notes

- **Never commit `.env` file** - It's already in `.gitignore`
- Use `.env.example` as a template for required environment variables
- Keep API keys private and regenerate them if accidentally exposed
- Sensitive data like `node_modules/` and `dist/` are also in `.gitignore`

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run dev` - Alternative dev command

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created by **Santhosh Kumar**

## 🙏 Acknowledgments

- RapidAPI for JSearch API
- Xai for Grok API
- React and Vite communities
