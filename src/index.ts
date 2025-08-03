import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);
const host = process.env.HOST || '0.0.0.0';

// Enhanced CORS configuration for external access
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Replace with your actual domain
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.static('public'));

// Load configuration files
const configPath = path.join(__dirname, '../config/assessment-config.json');
const questionnairePath = path.join(__dirname, '../questionnaire.json');

let assessmentConfig: any = null;
let questionnaire: any = null;

// Load assessment configuration
try {
  if (fs.existsSync(configPath)) {
    assessmentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('[server] Successfully loaded assessment configuration');
  } else {
    console.warn('[server] Assessment config not found, using fallback');
    assessmentConfig = null;
  }
} catch (error) {
  console.error('[server] Error loading assessment config:', error);
  assessmentConfig = null;
}

// Load legacy questionnaire for backward compatibility
try {
  if (fs.existsSync(questionnairePath)) {
    questionnaire = JSON.parse(fs.readFileSync(questionnairePath, 'utf-8'));
    console.log('[server] Successfully loaded legacy questionnaire with keys:', Object.keys(questionnaire));
  }
} catch (error) {
  console.warn('[server] Legacy questionnaire not found or invalid:', error);
}

// API Routes

// Get assessment configuration
app.get('/api/config', (req, res) => {
  if (assessmentConfig) {
    res.json(assessmentConfig);
  } else {
    // Return default configuration if file not found
    res.json({
      appSettings: {
        title: "PhysioCheck Assessment",
        subtitle: "Professional Physiotherapy Assessment Tool",
        primaryColor: "#ff7b3d",
        secondaryColor: "#f4f4f9",
        textColor: "#333"
      },
      assessmentFlow: [
        {
          id: "body_selection",
          type: "body_diagram",
          title: "Where do you have symptoms?",
          description: "Please select the areas where you are experiencing symptoms.",
          instruction: "Click on the body parts to select them. Selected areas will be highlighted.",
          required: true,
          bodyParts: [
            { id: "head", name: "Head", coordinates: [200, 100] },
            { id: "neck", name: "Neck", coordinates: [200, 140] },
            { id: "shoulder_left", name: "Left Shoulder", coordinates: [160, 180] },
            { id: "shoulder_right", name: "Right Shoulder", coordinates: [240, 180] },
            { id: "chest", name: "Chest", coordinates: [200, 220] },
            { id: "upper_back", name: "Upper Back", coordinates: [200, 200] },
            { id: "lower_back", name: "Lower Back", coordinates: [200, 280] },
            { id: "hip_left", name: "Left Hip", coordinates: [180, 320] },
            { id: "hip_right", name: "Right Hip", coordinates: [220, 320] },
            { id: "knee_left", name: "Left Knee", coordinates: [180, 440] },
            { id: "knee_right", name: "Right Knee", coordinates: [220, 440] }
          ]
        }
      ],
      customization: {
        showProgressBar: true,
        enableBackNavigation: true
      }
    });
  }
});

// Update assessment configuration
app.post('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    
    // Validate configuration structure
    if (!newConfig.appSettings || !newConfig.assessmentFlow) {
      return res.status(400).json({ error: 'Invalid configuration structure' });
    }
    
    // Save to file
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    assessmentConfig = newConfig;
    
    console.log('[server] Assessment configuration updated');
    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('[server] Error updating configuration:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Save assessment results
app.post('/api/assessment/submit', (req, res) => {
  try {
    const assessmentData = req.body;
    const timestamp = new Date().toISOString();
    const filename = `assessment-${timestamp.split('T')[0]}-${Date.now()}.json`;
    const resultsPath = path.join(__dirname, '../results', filename);
    
    // Ensure results directory exists
    const resultsDir = path.dirname(resultsPath);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Process and enhance the assessment data
    const enhancedData = processAssessmentData(assessmentData);
    
    // Add metadata
    const resultData = {
      ...enhancedData,
      submittedAt: timestamp,
      id: Date.now().toString(),
      version: '2.0.0'
    };
    
    // Save to file
    fs.writeFileSync(resultsPath, JSON.stringify(resultData, null, 2));
    
    console.log('[server] Assessment result saved:', filename);
    res.json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      id: resultData.id,
      riskLevel: enhancedData.riskLevel
    });
  } catch (error) {
    console.error('[server] Error saving assessment result:', error);
    res.status(500).json({ error: 'Failed to save assessment result' });
  }
});

// Process and enhance assessment data
function processAssessmentData(data: any) {
  const enhanced = { ...data };
  
  // Calculate risk level based on red flags
  const redFlags = checkRedFlags(data);
  enhanced.riskLevel = redFlags.length > 0 ? 'HIGH' : 'LOW';
  enhanced.redFlags = redFlags;
  
  // Generate summary statistics
  enhanced.summary = generateSummary(data);
  
  // Add processing timestamp
  enhanced.processedAt = new Date().toISOString();
  
  return enhanced;
}

// Check for red flags in screening questions
function checkRedFlags(data: any): string[] {
  const redFlags: string[] = [];
  const screeningAnswers = data.answers?.screening_questions || {};
  
  const redFlagQuestions = [
    'weight_loss', 'corticosteroids', 'constant_pain', 'cancer_history',
    'general_symptoms', 'night_pain', 'weight_bearing', 'neurological_symptoms',
    'bowel_bladder', 'fever'
  ];
  
  redFlagQuestions.forEach(question => {
    if (screeningAnswers[question] === 'yes') {
      redFlags.push(question.replace('_', ' '));
    }
  });
  
  return redFlags;
}

// Generate summary statistics
function generateSummary(data: any) {
  const summary: any = {};
  
  // Body areas affected
  if (data.selectedBodyParts) {
    summary.affectedAreas = data.selectedBodyParts.length;
    summary.primaryAreas = data.selectedBodyParts;
  }
  
  // Pain level if available
  const symptomAnswers = data.answers?.symptom_onset || {};
  if (symptomAnswers.pain_level) {
    summary.averagePainLevel = parseInt(symptomAnswers.pain_level);
  }
  
  // Duration of symptoms
  if (symptomAnswers.duration) {
    summary.symptomDuration = symptomAnswers.duration;
  }
  
  // Functional impact
  const functionalAnswers = data.answers?.functional_assessment || {};
  if (functionalAnswers.work_impact) {
    summary.workImpact = functionalAnswers.work_impact;
  }
  
  return summary;
}

// Get assessment results (for admin/review purposes)
app.get('/api/assessment/results', (req, res) => {
  try {
    const resultsDir = path.join(__dirname, '../results');
    
    if (!fs.existsSync(resultsDir)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(resultsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(resultsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return {
          id: data.id,
          submittedAt: data.submittedAt,
          selectedBodyParts: data.selectedBodyParts,
          answersCount: Object.keys(data.answers || {}).length
        };
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    
    res.json(files);
  } catch (error) {
    console.error('[server] Error retrieving assessment results:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment results' });
  }
});

// Get specific assessment result
app.get('/api/assessment/results/:id', (req, res) => {
  try {
    const { id } = req.params;
    const resultsDir = path.join(__dirname, '../results');
    
    const files = fs.readdirSync(resultsDir).filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(resultsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      if (data.id === id) {
        return res.json(data);
      }
    }
    
    res.status(404).json({ error: 'Assessment result not found' });
  } catch (error) {
    console.error('[server] Error retrieving assessment result:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment result' });
  }
});

// Get assessment analytics and statistics
app.get('/api/assessment/analytics', (req, res) => {
  try {
    const resultsDir = path.join(__dirname, '../results');
    
    if (!fs.existsSync(resultsDir)) {
      return res.json({
        totalAssessments: 0,
        riskLevels: { HIGH: 0, LOW: 0 },
        commonAreas: {},
        averagePainLevel: 0,
        recentAssessments: []
      });
    }
    
    const files = fs.readdirSync(resultsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(resultsDir, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      });
    
    // Calculate analytics
    const analytics = {
      totalAssessments: files.length,
      riskLevels: { HIGH: 0, LOW: 0 },
      commonAreas: {} as Record<string, number>,
      averagePainLevel: 0,
      recentAssessments: files
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 10)
        .map(assessment => ({
          id: assessment.id,
          submittedAt: assessment.submittedAt,
          riskLevel: assessment.riskLevel || 'UNKNOWN',
          affectedAreas: assessment.selectedBodyParts?.length || 0
        }))
    };
    
    let totalPainLevel = 0;
    let painLevelCount = 0;
    
    files.forEach(assessment => {
      // Risk levels
      if (assessment.riskLevel) {
        analytics.riskLevels[assessment.riskLevel as keyof typeof analytics.riskLevels]++;
      }
      
      // Common body areas
      if (assessment.selectedBodyParts) {
        assessment.selectedBodyParts.forEach((area: string) => {
          analytics.commonAreas[area] = (analytics.commonAreas[area] || 0) + 1;
        });
      }
      
      // Average pain level
      if (assessment.summary?.averagePainLevel) {
        totalPainLevel += assessment.summary.averagePainLevel;
        painLevelCount++;
      }
    });
    
    if (painLevelCount > 0) {
      analytics.averagePainLevel = Math.round(totalPainLevel / painLevelCount * 10) / 10;
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('[server] Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Legacy questionnaire endpoints (for backward compatibility)
app.get('/api/questionnaire/start', (req, res) => {
  if (questionnaire && questionnaire.start) {
    res.json(questionnaire.start);
  } else {
    res.status(404).json({ error: 'Legacy questionnaire not available' });
  }
});

app.post('/api/questionnaire/answer', (req, res) => {
  const { answer, next } = req.body;
  
  if (!questionnaire || !next || !questionnaire[next]) {
    return res.status(400).json({ error: 'Invalid next question' });
  }
  
  res.json(questionnaire[next]);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Admin dashboard route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log(`[server] 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, host, () => {
  console.log(`[server]: Enhanced PhysioCheck server is running at http://${host}:${port}`);
  console.log(`[server]: Local access: http://localhost:${port}`);
  console.log(`[server]: Network access: http://0.0.0.0:${port}`);
  console.log(`[server]: Assessment config loaded: ${assessmentConfig ? 'Yes' : 'No (using defaults)'}`);
  console.log(`[server]: Legacy questionnaire loaded: ${questionnaire ? 'Yes' : 'No'}`);
});
