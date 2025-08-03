# PhysioCheck Assessment System

A comprehensive, professional physiotherapy assessment tool inspired by [Physiocheck.co.uk](https://www.physiocheck.co.uk/check/start). This system provides a complete questionnaire flow from initial body area selection through detailed assessment to professional results and recommendations.

## 🚀 Features

### Enhanced Assessment Flow
- **Interactive Body Diagram**: Select multiple body areas with visual feedback
- **Medical Screening**: Comprehensive red flag detection for serious conditions
- **Demographics Collection**: Age, gender, occupation, and activity level
- **Medical History**: Previous injuries, surgeries, chronic conditions, medications
- **Symptom Details**: Onset, duration, pain level, type, and patterns
- **Functional Assessment**: Impact on daily activities, work, sleep, and movement
- **Treatment History**: Previous treatments and their effectiveness

### Professional Results System
- **Risk Assessment**: Automatic red flag detection and risk level calculation
- **Personalized Recommendations**: Area-specific advice and next steps
- **Self-Care Tips**: Practical advice for symptom management
- **Medical Attention Guidelines**: Clear indicators for when to seek professional help
- **Comprehensive Summary**: Detailed assessment overview with actionable insights

### Admin Dashboard
- **Analytics Overview**: Total assessments, risk levels, pain averages
- **Visual Charts**: Risk distribution, pain levels, common affected areas
- **Results Management**: View and export individual assessment results
- **Real-time Statistics**: Today's assessments and trending data

### Technical Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Progress Tracking**: Visual progress indicator throughout assessment
- **Data Export**: Print and export assessment results
- **Backend Storage**: Secure JSON-based result storage
- **API Endpoints**: RESTful API for data management
- **TypeScript**: Full type safety and modern development experience

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd physio-app-backend
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

The application will be available at:
- **Main Assessment**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3001/admin

## 📋 Assessment Flow

### 1. Body Area Selection
- Interactive body diagram with 22 selectable areas
- Visual feedback for selected areas
- Support for multiple area selection

### 2. Medical Screening (11 Questions)
Red flag detection for:
- Unexplained weight loss
- Accident-related symptoms
- Long-term corticosteroid use
- Constant pain patterns
- Cancer history
- General illness symptoms
- Night pain
- Weight-bearing issues
- Neurological symptoms
- Bowel/bladder changes
- Fever

### 3. Demographics
- Age groups (10-year intervals)
- Gender identification
- Occupation categories
- Activity level assessment

### 4. Medical History
- Previous injuries to affected areas
- Surgical history
- Chronic medical conditions
- Current medications
- Allergies

### 5. Symptom Details
- Symptom onset patterns
- Duration of symptoms
- Pain level (0-10 scale)
- Pain characteristics (sharp, dull, burning, etc.)
- Pain patterns (morning, night, activity-related)

### 6. Functional Assessment
- Work/daily activity impact
- Sleep disturbance levels
- Aggravating movements
- Avoided activities
- Need for assistance

### 7. Treatment History
- Previous treatment attempts
- Treatment effectiveness
- Current treatment status
- Surgical considerations

## 📊 Results & Recommendations

### Risk Assessment
- **HIGH RISK**: Red flags detected - immediate medical evaluation recommended
- **LOW RISK**: No immediate red flags - standard physiotherapy assessment appropriate

### Personalized Recommendations
- Area-specific advice based on selected body parts
- Professional consultation recommendations
- Activity modification suggestions
- Exercise and posture guidance

### Self-Care Tips
- Acute vs. chronic pain management
- Area-specific home care advice
- Posture and ergonomic recommendations
- Activity pacing strategies

### Medical Attention Guidelines
- Clear indicators for emergency care
- Warning signs requiring immediate attention
- Follow-up appointment recommendations

## 🔧 Configuration

### Assessment Configuration
The system uses `config/assessment-config.json` for:
- App settings and branding
- Assessment flow definition
- Question customization
- Result templates
- UI customization options

### Customization Options
- Primary and secondary colors
- Company branding
- Question text and options
- Result section content
- Progress bar and navigation settings

## 📡 API Endpoints

### Assessment Management
- `GET /api/config` - Get assessment configuration
- `POST /api/config` - Update assessment configuration
- `POST /api/assessment/submit` - Submit assessment results
- `GET /api/assessment/results` - Get all assessment results
- `GET /api/assessment/results/:id` - Get specific assessment result
- `GET /api/assessment/analytics` - Get assessment analytics

### System Health
- `GET /api/health` - System health check
- `GET /admin` - Admin dashboard

### Legacy Support
- `GET /api/questionnaire/start` - Legacy questionnaire start
- `POST /api/questionnaire/answer` - Legacy questionnaire navigation

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts for all screen sizes
- Optimized for accessibility

### Visual Feedback
- Progress indicators
- Interactive body diagram
- Color-coded risk levels
- Smooth animations and transitions

### Print Optimization
- Clean, professional print layout
- Hidden navigation elements
- Optimized typography for paper output

## 🔒 Data Security

### Storage
- Local JSON file storage
- No external database dependencies
- Secure result file naming
- Metadata tracking for audit trails

### Privacy
- No personal data collection beyond assessment needs
- Local processing and storage
- Optional data export for user control

## 🚀 Deployment

### Production Setup
1. Set environment variables for production
2. Configure reverse proxy (nginx recommended)
3. Set up SSL certificates
4. Configure logging and monitoring

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY public ./public
COPY config ./config
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 📈 Analytics & Reporting

### Admin Dashboard Features
- Real-time assessment statistics
- Risk level distribution charts
- Common affected areas analysis
- Pain level trends
- Recent assessment review

### Export Capabilities
- Individual assessment PDF export
- Bulk data export for analysis
- Analytics report generation
- Custom date range filtering

## 🤝 Contributing

### Development Setup
1. Install development dependencies
2. Set up TypeScript compilation
3. Configure linting and formatting
4. Set up testing framework

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits for version control

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Physiocheck.co.uk](https://www.physiocheck.co.uk/check/start)
- Built with modern web technologies
- Designed for healthcare professionals
- Focused on patient safety and professional standards

## 📞 Support

For technical support or feature requests, please contact the development team or create an issue in the repository.

---

**Disclaimer**: This assessment tool provides educational information and screening capabilities. It is not a substitute for professional medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical advice and treatment plans. 