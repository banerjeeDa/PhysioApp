const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      // Return mock data for now since database isn't set up
      return this.getMockResponse(endpoint, options);
    }
  }

  // Mock responses for when backend is not available
  getMockResponse(endpoint, options) {
    switch (endpoint) {
      case '/api/assessment/create':
        return {
          success: true,
          data: { assessmentId: `mock-${Date.now()}` }
        };
      
      case '/api/assessment/submit':
        return {
          success: true,
          data: this.generateMockResults(options.body ? JSON.parse(options.body) : {})
        };
      
      case '/api/assessment':
        return {
          success: true,
          data: this.generateMockResults({})
        };
      
      case '/api/config':
        return {
          success: true,
          data: {
            appName: 'PhysioCheck',
            version: '1.0.0',
            steps: ['body-diagram', 'pain-level', 'symptoms']
          }
        };
      
      default:
        return { success: true, data: {} };
    }
  }

  // Generate mock assessment results
  generateMockResults(assessmentData) {
    const { selectedBodyParts = [], answers = {} } = assessmentData;
    
    // Simple risk assessment logic
    let riskScore = 0;
    let riskLevel = 'low';
    
    // Add points for pain level
    if (answers.painLevel) {
      riskScore += answers.painLevel * 5;
    }
    
    // Add points for number of body parts
    riskScore += selectedBodyParts.length * 3;
    
    // Add points for symptoms
    if (answers.symptoms) {
      riskScore += answers.symptoms.length * 2;
    }
    
    // Determine risk level
    if (riskScore >= 40) {
      riskLevel = 'high';
    } else if (riskScore >= 20) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      id: `mock-${Date.now()}`,
      status: 'completed',
      selectedBodyParts,
      answers,
      riskLevel,
      riskScore: Math.min(riskScore, 100),
      riskFactors: this.generateRiskFactors(selectedBodyParts, answers),
      summary: this.generateSummary(selectedBodyParts, answers, riskLevel),
      recommendations: this.generateRecommendations(riskLevel, selectedBodyParts),
      selfCareTips: this.generateSelfCareTips(selectedBodyParts),
      medicalAttention: this.generateMedicalAttention(riskLevel),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
  }

  generateRiskFactors(bodyParts, answers) {
    const factors = [];
    
    if (answers.painLevel && answers.painLevel >= 7) {
      factors.push('High pain level');
    }
    
    if (bodyParts.includes('head') || bodyParts.includes('neck')) {
      factors.push('Head/neck involvement');
    }
    
    if (bodyParts.includes('lower_back')) {
      factors.push('Lower back pain');
    }
    
    if (answers.symptoms && answers.symptoms.includes('Numbness')) {
      factors.push('Neurological symptoms');
    }
    
    return factors;
  }

  generateSummary(bodyParts, answers, riskLevel) {
    const partNames = bodyParts.map(part => part.replace('_', ' ')).join(', ');
    const painLevel = answers.painLevel || 'unknown';
    
    return `You reported ${painLevel}/10 pain in the following areas: ${partNames}. Based on your symptoms and pain level, your risk assessment indicates a ${riskLevel} risk level. This assessment helps identify potential issues that may require professional evaluation.`;
  }

  generateRecommendations(riskLevel, bodyParts) {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push('Seek immediate medical attention for proper evaluation');
      recommendations.push('Avoid strenuous activities that may worsen symptoms');
      recommendations.push('Consider consulting a physiotherapist or specialist');
    } else if (riskLevel === 'medium') {
      recommendations.push('Schedule an appointment with a healthcare provider');
      recommendations.push('Monitor symptoms for any changes');
      recommendations.push('Consider gentle stretching exercises if approved by a professional');
    } else {
      recommendations.push('Continue monitoring your symptoms');
      recommendations.push('Practice good posture and ergonomics');
      recommendations.push('Consider gentle exercises to maintain mobility');
    }
    
    return recommendations;
  }

  generateSelfCareTips(bodyParts) {
    const tips = [
      'Apply ice or heat therapy as appropriate for your condition',
      'Practice gentle stretching exercises',
      'Maintain good posture throughout the day',
      'Take regular breaks from prolonged sitting or standing',
      'Stay hydrated and maintain a healthy diet'
    ];
    
    if (bodyParts.includes('lower_back')) {
      tips.push('Use proper lifting techniques');
      tips.push('Consider using a lumbar support cushion');
    }
    
    if (bodyParts.includes('neck')) {
      tips.push('Adjust your computer monitor to eye level');
      tips.push('Take frequent breaks from looking down at devices');
    }
    
    return tips;
  }

  generateMedicalAttention(riskLevel) {
    if (riskLevel === 'high') {
      return [
        'Seek immediate medical attention if you experience severe pain',
        'Contact emergency services if you have difficulty moving or severe symptoms',
        'Consult a healthcare provider within 24-48 hours'
      ];
    } else if (riskLevel === 'medium') {
      return [
        'Schedule an appointment with a healthcare provider within a week',
        'Seek medical attention if symptoms worsen or persist',
        'Contact a physiotherapist for professional assessment'
      ];
    } else {
      return [
        'Monitor symptoms and seek medical attention if they worsen',
        'Consider consulting a healthcare provider if symptoms persist for more than a week',
        'Schedule a routine check-up to discuss your symptoms'
      ];
    }
  }

  // Get assessment configuration
  async getAssessmentConfig() {
    return this.request('/api/config');
  }

  // Create new assessment
  async createAssessment(data) {
    return this.request('/api/assessment/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update assessment
  async updateAssessment(id, data) {
    return this.request(`/api/assessment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Submit completed assessment
  async submitAssessment(id, data) {
    return this.request(`/api/assessment/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get assessment results
  async getAssessment(id) {
    return this.request(`/api/assessment/${id}`);
  }

  // Track analytics
  async trackAnalytics(assessmentId, eventData) {
    return this.request(`/api/assessment/${assessmentId}/analytics`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }
}

export const apiService = new ApiService(); 