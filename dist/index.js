"use strict";
// import express, { Express, Request, Response } from 'express';
// import cors from 'cors';
// import questionnaireData from './questionnaire.json';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// interface Questionnaire {
//   question: string;
//   options: { answer: string; next?: string; result?: string }[];
// }
// const questionnaire: Record<string, Questionnaire> = questionnaireData as Record<string, Questionnaire>;
// const app: Express = express();
// const port = process.env.PORT || 3001;
// app.use(cors());
// app.use(express.json());
// // API routes
// app.get('/api/questionnaire/start', (req: Request, res: Response) => {
//   console.log('[server] GET /api/questionnaire/start hit');
//   res.json(questionnaire.start);
// });
// app.post('/api/questionnaire/answer', (req: Request, res: Response) => {
//   const { answer, next } = req.body;
//   if (!next || !questionnaire[next]) {
//     return res.status(400).json({ error: 'Invalid next question specified' });
//   }
//   const nextQuestion = questionnaire[next];
//   res.json(nextQuestion);
// });
// // Serve static files for the frontend
// app.use(express.static('public'));
// // CATCH-ALL: Log any request that hasn't been handled by a route yet
// app.use((req: Request, res: Response, next) => {
//   console.log(`[server] Unhandled request received for: ${req.method} ${req.path}`);
//   next();
// });
// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
// Load configuration files
const configPath = path_1.default.join(__dirname, '../config/assessment-config.json');
const questionnairePath = path_1.default.join(__dirname, '../questionnaire.json');
let assessmentConfig = null;
let questionnaire = null;
// Load assessment configuration
try {
    if (fs_1.default.existsSync(configPath)) {
        assessmentConfig = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
        console.log('[server] Successfully loaded assessment configuration');
    }
    else {
        console.warn('[server] Assessment config not found, using fallback');
        assessmentConfig = null;
    }
}
catch (error) {
    console.error('[server] Error loading assessment config:', error);
    assessmentConfig = null;
}
// Load legacy questionnaire for backward compatibility
try {
    if (fs_1.default.existsSync(questionnairePath)) {
        questionnaire = JSON.parse(fs_1.default.readFileSync(questionnairePath, 'utf-8'));
        console.log('[server] Successfully loaded legacy questionnaire with keys:', Object.keys(questionnaire));
    }
}
catch (error) {
    console.warn('[server] Legacy questionnaire not found or invalid:', error);
}
// API Routes
// Get assessment configuration
app.get('/api/config', (req, res) => {
    if (assessmentConfig) {
        res.json(assessmentConfig);
    }
    else {
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
        fs_1.default.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        assessmentConfig = newConfig;
        console.log('[server] Assessment configuration updated');
        res.json({ success: true, message: 'Configuration updated successfully' });
    }
    catch (error) {
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
        const resultsPath = path_1.default.join(__dirname, '../results', filename);
        // Ensure results directory exists
        const resultsDir = path_1.default.dirname(resultsPath);
        if (!fs_1.default.existsSync(resultsDir)) {
            fs_1.default.mkdirSync(resultsDir, { recursive: true });
        }
        // Add metadata
        const resultData = Object.assign(Object.assign({}, assessmentData), { submittedAt: timestamp, id: Date.now().toString() });
        // Save to file
        fs_1.default.writeFileSync(resultsPath, JSON.stringify(resultData, null, 2));
        console.log('[server] Assessment result saved:', filename);
        res.json({
            success: true,
            message: 'Assessment submitted successfully',
            id: resultData.id
        });
    }
    catch (error) {
        console.error('[server] Error saving assessment result:', error);
        res.status(500).json({ error: 'Failed to save assessment result' });
    }
});
// Get assessment results (for admin/review purposes)
app.get('/api/assessment/results', (req, res) => {
    try {
        const resultsDir = path_1.default.join(__dirname, '../results');
        if (!fs_1.default.existsSync(resultsDir)) {
            return res.json([]);
        }
        const files = fs_1.default.readdirSync(resultsDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
            const filePath = path_1.default.join(resultsDir, file);
            const data = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
            return {
                id: data.id,
                submittedAt: data.submittedAt,
                selectedBodyParts: data.selectedBodyParts,
                answersCount: Object.keys(data.answers || {}).length
            };
        })
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        res.json(files);
    }
    catch (error) {
        console.error('[server] Error retrieving assessment results:', error);
        res.status(500).json({ error: 'Failed to retrieve assessment results' });
    }
});
// Get specific assessment result
app.get('/api/assessment/results/:id', (req, res) => {
    try {
        const { id } = req.params;
        const resultsDir = path_1.default.join(__dirname, '../results');
        const files = fs_1.default.readdirSync(resultsDir).filter(file => file.endsWith('.json'));
        for (const file of files) {
            const filePath = path_1.default.join(resultsDir, file);
            const data = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
            if (data.id === id) {
                return res.json(data);
            }
        }
        res.status(404).json({ error: 'Assessment result not found' });
    }
    catch (error) {
        console.error('[server] Error retrieving assessment result:', error);
        res.status(500).json({ error: 'Failed to retrieve assessment result' });
    }
});
// Legacy questionnaire endpoints (for backward compatibility)
app.get('/api/questionnaire/start', (req, res) => {
    if (questionnaire && questionnaire.start) {
        res.json(questionnaire.start);
    }
    else {
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
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[server] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// 404 handler
app.use((req, res) => {
    console.log(`[server] 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found' });
});
app.listen(port, () => {
    console.log(`[server]: Enhanced PhysioCheck server is running at http://localhost:${port}`);
    console.log(`[server]: Assessment config loaded: ${assessmentConfig ? 'Yes' : 'No (using defaults)'}`);
    console.log(`[server]: Legacy questionnaire loaded: ${questionnaire ? 'Yes' : 'No'}`);
});
