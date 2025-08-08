import { Router, Request, Response } from 'express';
import { assessmentService } from '../services/assessmentService';
import { processAssessmentData, checkRedFlags, generateSummary } from '../utils/assessmentUtils';

const router = Router();

// Create new assessment
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { selectedBodyParts, answers } = req.body;
    
    const assessment = await assessmentService.createAssessment({
      selectedBodyParts,
      answers,
    });

    // Track assessment start
    await assessmentService.createAnalyticsEvent({
      assessmentId: assessment.id,
      eventType: 'assessment_started',
      eventData: { selectedBodyParts },
    });

    res.json({
      success: true,
      assessmentId: assessment.id,
      message: 'Assessment created successfully',
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
    });
  }
});

// Update assessment
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assessment = await assessmentService.updateAssessment(id, updateData);

    res.json({
      success: true,
      assessment,
      message: 'Assessment updated successfully',
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assessment',
    });
  }
});

// Submit completed assessment
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assessmentData = req.body;

    // Process assessment data (existing logic)
    const processedData = processAssessmentData(assessmentData);
    
    // Update assessment with results
    const assessment = await assessmentService.updateAssessment(id, {
      ...assessmentData,
      ...processedData,
      status: 'completed',
    });

    // Track assessment completion
    await assessmentService.createAnalyticsEvent({
      assessmentId: id,
      eventType: 'assessment_completed',
      eventData: {
        riskLevel: processedData.riskLevel,
        riskScore: processedData.riskScore,
        bodyPartsCount: assessmentData.selectedBodyParts?.length || 0,
      },
    });

    res.json({
      success: true,
      assessment,
      message: 'Assessment submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
    });
  }
});

// Get assessment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const assessment = await assessmentService.getAssessment(id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    res.json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error('Error getting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assessment',
    });
  }
});

// Get all assessments (admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const assessments = await assessmentService.getAllAssessments(limit, offset);
    
    res.json({
      success: true,
      assessments,
      pagination: {
        limit,
        offset,
        hasMore: assessments.length === limit,
      },
    });
  } catch (error) {
    console.error('Error getting assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assessments',
    });
  }
});

// Analytics tracking
router.post('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const analyticsData = req.body;
    
    const analytics = await assessmentService.createAnalyticsEvent({
      assessmentId: id,
      ...analyticsData,
    });

    res.json({
      success: true,
      analytics,
      message: 'Analytics event recorded',
    });
  } catch (error) {
    console.error('Error recording analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record analytics',
    });
  }
});

// Get analytics summary
router.get('/analytics/summary', async (req: Request, res: Response) => {
  try {
    const summary = await assessmentService.getAnalyticsSummary();
    const commonBodyParts = await assessmentService.getCommonBodyParts();
    const riskDistribution = await assessmentService.getRiskLevelDistribution();
    
    res.json({
      success: true,
      summary,
      commonBodyParts,
      riskDistribution,
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics summary',
    });
  }
});

export default router; 