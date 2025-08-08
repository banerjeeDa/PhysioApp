// Assessment data processing utilities
export interface AssessmentData {
  selectedBodyParts: string[];
  answers: Record<string, any>;
  startTime?: Date;
  completedSteps?: number[];
}

export interface ProcessedAssessmentData {
  riskLevel: string;
  riskScore: number;
  riskFactors: string[];
  summary: string;
  recommendations: string[];
  selfCareTips: string[];
  medicalAttention: string[];
}

export function processAssessmentData(data: AssessmentData): ProcessedAssessmentData {
  const redFlags = checkRedFlags(data);
  const riskAssessment = assessRiskLevel(data);
  const summary = generateSummary(data);
  const recommendations = generateRecommendations(data, riskAssessment.level);
  const selfCareTips = generateSelfCareTips(data);
  const medicalAttention = generateMedicalAttention(riskAssessment.level, redFlags);

  return {
    riskLevel: riskAssessment.level,
    riskScore: riskAssessment.riskScore,
    riskFactors: riskAssessment.riskFactors,
    summary,
    recommendations,
    selfCareTips,
    medicalAttention,
  };
}

export function checkRedFlags(data: AssessmentData): string[] {
  const redFlags: string[] = [];
  const screeningAnswers = data.answers.screening_questions || {};

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

export function assessRiskLevel(data: AssessmentData) {
  const redFlags = checkRedFlags(data);
  const symptomAnswers = data.answers.symptom_onset || {};
  const functionalAnswers = data.answers.functional_assessment || {};
  const medicalAnswers = data.answers.medical_history || {};
  const screeningAnswers = data.answers.screening_questions || {};
  
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Red flags (highest weight - immediate high risk)
  if (redFlags.length > 0) {
    riskScore += redFlags.length * 15;
    riskFactors.push(`Red flags: ${redFlags.join(', ')}`);
  }

  // Pain level assessment (more sensitive)
  const painLevel = parseInt(symptomAnswers.pain_level) || 0;
  if (painLevel >= 9) {
    riskScore += 12;
    riskFactors.push(`Very severe pain (level ${painLevel}/10)`);
  } else if (painLevel >= 7) {
    riskScore += 8;
    riskFactors.push(`Severe pain (level ${painLevel}/10)`);
  } else if (painLevel >= 5) {
    riskScore += 5;
    riskFactors.push(`Moderate pain (level ${painLevel}/10)`);
  } else if (painLevel >= 3) {
    riskScore += 2;
    riskFactors.push(`Mild pain (level ${painLevel}/10)`);
  }

  // Duration assessment (more comprehensive)
  const duration = symptomAnswers.duration;
  if (duration === 'More than 6 months') {
    riskScore += 5;
    riskFactors.push('Chronic symptoms (>6 months)');
  } else if (duration === '3-6 months') {
    riskScore += 3;
    riskFactors.push('Prolonged symptoms (3-6 months)');
  } else if (duration === '1-3 months') {
    riskScore += 2;
    riskFactors.push('Persistent symptoms (1-3 months)');
  } else if (duration === '1-4 weeks') {
    riskScore += 1;
    riskFactors.push('Recent symptoms (1-4 weeks)');
  }

  // Functional impact (more detailed)
  const workImpact = functionalAnswers.work_impact;
  if (workImpact === 'Unable to work/perform activities') {
    riskScore += 8;
    riskFactors.push('Severe functional limitation');
  } else if (workImpact === 'Severely') {
    riskScore += 6;
    riskFactors.push('Significant functional impact');
  } else if (workImpact === 'Moderately') {
    riskScore += 4;
    riskFactors.push('Moderate functional impact');
  } else if (workImpact === 'Slightly') {
    riskScore += 2;
    riskFactors.push('Mild functional impact');
  }

  // Sleep impact (more sensitive)
  const sleepImpact = functionalAnswers.sleep_impact;
  if (sleepImpact === 'Unable to sleep due to symptoms') {
    riskScore += 7;
    riskFactors.push('Severe sleep disturbance');
  } else if (sleepImpact === 'Frequent sleep disturbance') {
    riskScore += 5;
    riskFactors.push('Frequent sleep problems');
  } else if (sleepImpact === 'Occasional sleep disturbance') {
    riskScore += 3;
    riskFactors.push('Occasional sleep problems');
  }

  // Pain patterns (more comprehensive)
  const painPattern = symptomAnswers.pain_pattern || [];
  if (painPattern.includes('Constant')) {
    riskScore += 6;
    riskFactors.push('Constant pain pattern');
  }
  if (painPattern.includes('At night')) {
    riskScore += 5;
    riskFactors.push('Night pain');
  }
  if (painPattern.includes('When moving')) {
    riskScore += 3;
    riskFactors.push('Movement-related pain');
  }
  if (painPattern.includes('In the morning')) {
    riskScore += 2;
    riskFactors.push('Morning stiffness/pain');
  }
  if (painPattern.includes('After activity')) {
    riskScore += 2;
    riskFactors.push('Post-activity pain');
  }

  // Pain type assessment
  const painType = symptomAnswers.pain_type || [];
  if (painType.includes('Sharp')) {
    riskScore += 4;
    riskFactors.push('Sharp pain');
  }
  if (painType.includes('Burning')) {
    riskScore += 3;
    riskFactors.push('Burning pain');
  }
  if (painType.includes('Tingling')) {
    riskScore += 3;
    riskFactors.push('Tingling sensation');
  }
  if (painType.includes('Numbness')) {
    riskScore += 4;
    riskFactors.push('Numbness');
  }
  if (painType.includes('Weakness')) {
    riskScore += 5;
    riskFactors.push('Muscle weakness');
  }

  // Medical history factors
  if (medicalAnswers.previous_injuries === 'yes') {
    riskScore += 3;
    riskFactors.push('Previous injuries to affected area');
  }
  
  const surgeryHistory = medicalAnswers.surgery_history || [];
  if (surgeryHistory.length > 0 && !surgeryHistory.includes('None')) {
    riskScore += 4;
    riskFactors.push('Previous surgeries');
  }

  const chronicConditions = medicalAnswers.chronic_conditions || [];
  if (chronicConditions.length > 0 && !chronicConditions.includes('None')) {
    riskScore += 3;
    riskFactors.push('Chronic medical conditions');
  }

  // Medication use
  if (medicalAnswers.medications === 'yes') {
    riskScore += 2;
    riskFactors.push('Currently taking medications');
  }

  // Accident/injury cause
  if (screeningAnswers.accident_cause === 'yes') {
    riskScore += 4;
    riskFactors.push('Symptoms caused by accident/fall');
  }

  // Body area severity assessment (individual area focus)
  const selectedAreas = data.selectedBodyParts;
  
  // Define risk categories for body areas
  const highRiskAreas = ['lower_back', 'upper_back', 'neck', 'head'];
  const moderateRiskAreas = ['shoulder_left', 'shoulder_right', 'knee_left', 'knee_right', 'hip_left', 'hip_right', 'chest'];
  const spineAreas = ['lower_back', 'upper_back', 'neck'];
  const jointAreas = ['shoulder_left', 'shoulder_right', 'knee_left', 'knee_right', 'hip_left', 'hip_right', 'elbow_left', 'elbow_right', 'ankle_left', 'ankle_right'];
  
  // Check for high-risk body areas
  const hasHighRiskArea = selectedAreas.some(area => highRiskAreas.includes(area));
  const hasModerateRiskArea = selectedAreas.some(area => moderateRiskAreas.includes(area));
  const hasSpineArea = selectedAreas.some(area => spineAreas.includes(area));
  const hasJointArea = selectedAreas.some(area => jointAreas.includes(area));
  
  // Add base risk for body areas
  if (hasHighRiskArea) {
    riskScore += 2;
    riskFactors.push('High-risk body area affected');
  }
  
  if (hasModerateRiskArea) {
    riskScore += 1;
    riskFactors.push('Moderate-risk body area affected');
  }

  // Spine-specific risk factors (back and neck)
  if (hasSpineArea) {
    // Additional risk for spine-related symptoms
    if (painType.includes('Tingling') || painType.includes('Numbness')) {
      riskScore += 3;
      riskFactors.push('Spine-related neurological symptoms');
    }
    if (painPattern.includes('Constant')) {
      riskScore += 2;
      riskFactors.push('Constant spine pain');
    }
    if (functionalAnswers.movement_patterns?.includes('Walking')) {
      riskScore += 2;
      riskFactors.push('Spine pain affecting walking');
    }
  }

  // Joint-specific risk factors (shoulders, knees, hips, elbows, ankles)
  if (hasJointArea) {
    if (painType.includes('Weakness')) {
      riskScore += 3;
      riskFactors.push('Joint-related muscle weakness');
    }
    if (functionalAnswers.assistance_needed === 'yes') {
      riskScore += 2;
      riskFactors.push('Joint requiring assistance');
    }
  }

  // Age factor (older adults at higher risk)
  const demographicsAnswers = data.answers.demographics || {};
  const age = demographicsAnswers.age;
  if (age === '70+ years') {
    riskScore += 3;
    riskFactors.push('Advanced age (70+)');
  } else if (age === '60 - 69 years') {
    riskScore += 2;
    riskFactors.push('Older age (60-69)');
  }

  // Activity level (high activity can increase risk)
  const activityLevel = demographicsAnswers.activity_level;
  if (activityLevel === 'Extremely active (very hard exercise, physical job)') {
    riskScore += 2;
    riskFactors.push('Extremely active lifestyle');
  }

  // Additional functional assessment factors
  const movementPatterns = functionalAnswers.movement_patterns || [];
  if (movementPatterns.includes('Lifting objects')) {
    riskScore += 2;
    riskFactors.push('Pain with lifting');
  }
  if (movementPatterns.includes('Reaching overhead')) {
    riskScore += 2;
    riskFactors.push('Pain with overhead activities');
  }
  if (movementPatterns.includes('Bending forward')) {
    riskScore += 3;
    riskFactors.push('Pain with forward bending');
  }
  if (movementPatterns.includes('Bending backward')) {
    riskScore += 3;
    riskFactors.push('Pain with backward bending');
  }
  if (movementPatterns.includes('Twisting/rotating')) {
    riskScore += 3;
    riskFactors.push('Pain with twisting/rotation');
  }
  if (movementPatterns.includes('Walking')) {
    riskScore += 4;
    riskFactors.push('Pain with walking');
  }
  if (movementPatterns.includes('Climbing stairs')) {
    riskScore += 3;
    riskFactors.push('Pain with stair climbing');
  }

  const activitiesAvoided = functionalAnswers.activities_avoided || [];
  if (activitiesAvoided.includes('Exercise/sports')) {
    riskScore += 2;
    riskFactors.push('Avoiding exercise due to pain');
  }
  if (activitiesAvoided.includes('Work activities')) {
    riskScore += 3;
    riskFactors.push('Work activities affected');
  }

  if (functionalAnswers.assistance_needed === 'yes') {
    riskScore += 4;
    riskFactors.push('Requires assistance with daily activities');
  }

  // Determine risk level (lowered thresholds)
  let level: string;
  if (riskScore >= 12 || redFlags.length > 0) {
    level = 'HIGH';
  } else if (riskScore >= 6) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return { level, riskScore, riskFactors };
}

export function generateSummary(data: AssessmentData): string {
  const areas = data.selectedBodyParts.map(partId => getBodyPartName(partId)).join(', ');
  return `Primary areas of concern: ${areas}`;
}

export function generateRecommendations(data: AssessmentData, riskLevel: string): string[] {
  const recommendations: string[] = [];
  const selectedAreas = data.selectedBodyParts;

  // Risk-based recommendations
  if (riskLevel === 'HIGH') {
    recommendations.push('Immediate medical evaluation is strongly recommended.');
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push('Schedule a medical evaluation within the next few days.');
  }

  // General recommendations
  recommendations.push('Schedule an appointment with a qualified physiotherapist for a comprehensive evaluation.');

  // Area-specific recommendations
  if (selectedAreas.some(area => area.includes('back'))) {
    recommendations.push('Consider core strengthening exercises to support your spine.');
  }

  if (selectedAreas.some(area => area.includes('knee'))) {
    recommendations.push('Avoid high-impact activities until evaluated by a healthcare professional.');
  }

  if (selectedAreas.some(area => area.includes('shoulder'))) {
    recommendations.push('Avoid overhead activities that may aggravate your shoulder symptoms.');
  }

  if (selectedAreas.some(area => area.includes('neck'))) {
    recommendations.push('Pay attention to posture and ergonomics in daily activities.');
  }

  return recommendations;
}

export function generateSelfCareTips(data: AssessmentData): string[] {
  const tips: string[] = [];
  const selectedAreas = data.selectedBodyParts;

  // General tips
  tips.push('Apply ice for acute pain (first 48-72 hours)');
  tips.push('Apply heat for chronic pain or stiffness');
  tips.push('Maintain gentle movement within pain-free range');
  tips.push('Practice good posture throughout the day');

  // Area-specific tips
  if (selectedAreas.some(area => area.includes('back'))) {
    tips.push('Use proper lifting techniques (bend at knees, not waist)');
    tips.push('Consider using a lumbar support pillow when sitting');
  }

  if (selectedAreas.some(area => area.includes('knee'))) {
    tips.push('Elevate your leg when resting');
    tips.push('Avoid prolonged sitting or standing in one position');
  }

  if (selectedAreas.some(area => area.includes('shoulder'))) {
    tips.push('Sleep with a pillow supporting your arm');
    tips.push('Avoid sleeping on the affected shoulder');
  }

  return tips;
}

export function generateMedicalAttention(riskLevel: string, redFlags: string[]): string[] {
  const medicalAttention: string[] = [];

  if (riskLevel === 'HIGH') {
    medicalAttention.push('Seek immediate medical attention due to the presence of red flags or concerning symptoms.');
  } else if (riskLevel === 'MEDIUM') {
    medicalAttention.push('Monitor symptoms closely and seek medical attention if they worsen.');
  }

  // Standard medical attention items
  medicalAttention.push(
    'Severe or worsening pain',
    'Numbness, tingling, or weakness in limbs',
    'Loss of bowel or bladder control',
    'Fever with back pain',
    'Pain that wakes you at night',
    'Inability to bear weight on affected area'
  );

  return medicalAttention;
}

export function getBodyPartName(partId: string): string {
  // This would ideally come from a configuration file
  const bodyPartNames: Record<string, string> = {
    'head': 'Head',
    'neck': 'Neck',
    'shoulder_left': 'Left Shoulder',
    'shoulder_right': 'Right Shoulder',
    'chest': 'Chest',
    'upper_back': 'Upper Back',
    'lower_back': 'Lower Back',
    'arm_left': 'Left Arm',
    'arm_right': 'Right Arm',
    'elbow_left': 'Left Elbow',
    'elbow_right': 'Right Elbow',
    'wrist_left': 'Left Wrist',
    'wrist_right': 'Right Wrist',
    'hand_left': 'Left Hand',
    'hand_right': 'Right Hand',
    'hip_left': 'Left Hip',
    'hip_right': 'Right Hip',
    'thigh_left': 'Left Thigh',
    'thigh_right': 'Right Thigh',
    'knee_left': 'Left Knee',
    'knee_right': 'Right Knee',
    'calf_left': 'Left Calf',
    'calf_right': 'Right Calf',
    'ankle_left': 'Left Ankle',
    'ankle_right': 'Right Ankle',
    'foot_left': 'Left Foot',
    'foot_right': 'Right Foot',
  };

  return bodyPartNames[partId] || partId;
} 