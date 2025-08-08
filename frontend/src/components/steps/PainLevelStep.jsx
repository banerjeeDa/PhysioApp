import React from 'react';
import { useAssessment } from '../../contexts/AssessmentContext.jsx';
import { apiService } from '../../services/api.js';

function PainLevelStep() {
  const { answers, dispatch, actions, assessmentId } = useAssessment();

  const painLevels = [
    { value: 1, label: 'Very Mild', description: 'Barely noticeable discomfort' },
    { value: 2, label: 'Mild', description: 'Slight discomfort, easily ignored' },
    { value: 3, label: 'Moderate', description: 'Noticeable but manageable pain' },
    { value: 4, label: 'Moderately Severe', description: 'Significant pain, affects daily activities' },
    { value: 5, label: 'Severe', description: 'Intense pain, difficult to ignore' },
    { value: 6, label: 'Very Severe', description: 'Very intense pain, affects concentration' },
    { value: 7, label: 'Extremely Severe', description: 'Overwhelming pain, affects sleep' },
    { value: 8, label: 'Intense', description: 'Very intense pain, affects all activities' },
    { value: 9, label: 'Excruciating', description: 'Extreme pain, barely tolerable' },
    { value: 10, label: 'Unbearable', description: 'Worst pain imaginable' },
  ];

  const handlePainLevelSelect = async (level) => {
    dispatch({ 
      type: actions.SET_ANSWERS, 
      payload: { painLevel: level } 
    });

    // Track analytics
    if (assessmentId) {
      await apiService.trackAnalytics(assessmentId, {
        eventType: 'pain_level_selected',
        painLevel: level,
      });
    }
  };

  const currentPainLevel = answers.painLevel;

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>How would you rate your pain level?</h2>
        <p>Please select the level that best describes your current pain experience.</p>
      </div>

      <div className="pain-scale">
        <div className="scale-header">
          <span className="scale-label">No Pain</span>
          <span className="scale-label">Worst Pain</span>
        </div>
        
        <div className="scale-bar">
          <div className="scale-fill" style={{ width: `${(currentPainLevel || 0) * 10}%` }}></div>
        </div>
        
        <div className="scale-numbers">
          {[0, 2, 4, 6, 8, 10].map(num => (
            <span key={num} className="scale-number">{num}</span>
          ))}
        </div>
      </div>

      <div className="pain-options">
        {painLevels.map((level) => (
          <button
            key={level.value}
            className={`pain-option ${currentPainLevel === level.value ? 'selected' : ''}`}
            onClick={() => handlePainLevelSelect(level.value)}
          >
            <div className="pain-level-header">
              <span className="pain-number">{level.value}</span>
              <span className="pain-label">{level.label}</span>
            </div>
            <p className="pain-description">{level.description}</p>
          </button>
        ))}
      </div>

      {currentPainLevel && (
        <div className="selected-pain">
          <h3>Selected Pain Level: {currentPainLevel}/10</h3>
          <p>{painLevels.find(l => l.value === currentPainLevel)?.description}</p>
        </div>
      )}
    </div>
  );
}

export default PainLevelStep; 