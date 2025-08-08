import { prisma } from './prisma';

export interface CreateAssessmentData {
  selectedBodyParts?: string[];
  answers?: Record<string, any>;
}

export interface UpdateAssessmentData {
  selectedBodyParts?: string[];
  answers?: Record<string, any>;
  status?: 'in_progress' | 'completed' | 'abandoned';
  riskLevel?: string;
  riskScore?: number;
  riskFactors?: string[];
  results?: Record<string, any>;
  summary?: string;
  recommendations?: string[];
  selfCareTips?: string[];
  medicalAttention?: string[];
}

export interface CreateAnalyticsData {
  assessmentId: string;
  eventType: string;
  eventData?: Record<string, any>;
  stepNumber?: number;
  stepId?: string;
  bodyPart?: string;
  painLevel?: number;
  duration?: number;
}

export class AssessmentService {
  // Create a new assessment
  async createAssessment(data: CreateAssessmentData): Promise<any> {
    return await prisma.assessment.create({
      data: {
        selectedBodyParts: data.selectedBodyParts || [],
        answers: data.answers || {},
      },
    });
  }

  // Get assessment by ID
  async getAssessment(id: string): Promise<any | null> {
    return await prisma.assessment.findUnique({
      where: { id },
      include: {
        analytics: true,
      },
    });
  }

  // Update assessment
  async updateAssessment(id: string, data: UpdateAssessmentData): Promise<any> {
    const updateData: any = { ...data };
    
    // Set completedAt if status is completed
    if (data.status === 'completed') {
      updateData.completedAt = new Date();
    }

    return await prisma.assessment.update({
      where: { id },
      data: updateData,
    });
  }

  // Get all assessments (for admin)
  async getAllAssessments(limit = 50, offset = 0): Promise<any[]> {
    return await prisma.assessment.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        analytics: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // Get assessment analytics
  async getAssessmentAnalytics(assessmentId: string): Promise<any[]> {
    return await prisma.analytics.findMany({
      where: { assessmentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Create analytics event
  async createAnalyticsEvent(data: CreateAnalyticsData): Promise<any> {
    return await prisma.analytics.create({
      data,
    });
  }

  // Get analytics summary
  async getAnalyticsSummary() {
    const totalAssessments = await prisma.assessment.count();
    const completedAssessments = await prisma.assessment.count({
      where: { status: 'completed' },
    });
    const highRiskAssessments = await prisma.assessment.count({
      where: { riskLevel: 'HIGH' },
    });
    const mediumRiskAssessments = await prisma.assessment.count({
      where: { riskLevel: 'MEDIUM' },
    });
    const lowRiskAssessments = await prisma.assessment.count({
      where: { riskLevel: 'LOW' },
    });

    // Get today's assessments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAssessments = await prisma.assessment.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Get average risk score
    const avgRiskScore = await prisma.assessment.aggregate({
      where: {
        riskScore: { not: null },
      },
      _avg: {
        riskScore: true,
      },
    });

    return {
      totalAssessments,
      completedAssessments,
      highRiskAssessments,
      mediumRiskAssessments,
      lowRiskAssessments,
      todayAssessments,
      averageRiskScore: avgRiskScore._avg.riskScore || 0,
      completionRate: totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0,
    };
  }

  // Get common body parts
  async getCommonBodyParts() {
    const assessments = await prisma.assessment.findMany({
      where: {
        selectedBodyParts: { not: null as any },
      },
      select: {
        selectedBodyParts: true,
      },
    });

    const bodyPartCounts: Record<string, number> = {};
    
    assessments.forEach((assessment: any) => {
      const bodyParts = assessment.selectedBodyParts as string[];
      bodyParts?.forEach(part => {
        bodyPartCounts[part] = (bodyPartCounts[part] || 0) + 1;
      });
    });

    return Object.entries(bodyPartCounts)
      .map(([part, count]) => ({ part, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Get risk level distribution
  async getRiskLevelDistribution() {
    const distribution = await prisma.assessment.groupBy({
      by: ['riskLevel'],
      where: {
        riskLevel: { not: null },
      },
      _count: {
        riskLevel: true,
      },
    });

    return distribution.map((item: any) => ({
      riskLevel: item.riskLevel,
      count: item._count.riskLevel,
    }));
  }
}

export const assessmentService = new AssessmentService(); 