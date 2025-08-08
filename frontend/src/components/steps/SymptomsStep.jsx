import React from 'react';
import { useAssessment } from '../../contexts/AssessmentContext.jsx';
import { apiService } from '../../services/api.js';

function SymptomsStep() {
  const { answers, dispatch, actions, assessmentId } = useAssessment();

  const symptomCategories = [
    {
      category: 'Pain Type',
      symptoms: [
        'Sharp pain',
        'Dull ache',
        'Throbbing pain',
        'Burning sensation',
        'Stabbing pain',
        'Cramping',
        'Tingling',
        'Numbness'
      ]
    },
    {
      category: 'Movement Issues',
      symptoms: [
        'Difficulty moving',
        'Stiffness',
        'Weakness',
        'Loss of range of motion',
        'Instability',
        'Clicking or popping',
        'Locking sensation'
      ]
    },
    {
      category: 'Other Symptoms',
      symptoms: [
        'Swelling',
        'Bruising',
        'Redness',
        'Warmth to touch',
        'Fatigue',
        'Dizziness',
        'Nausea',
        'Headache'
      ]
    }
  ];

  const handleSymptomToggle = async (symptom) => {
    const currentSymptoms = answers.symptoms || [];
    const newSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];

    dispatch({ 
      type: actions.SET_ANSWERS, 
      payload: { symptoms: newSymptoms } 
    });

    // Track analytics
    if (assessmentId) {
      await apiService.trackAnalytics(assessmentId, {
        eventType: 'symptom_selected',
        symptom: symptom,
        selected: !currentSymptoms.includes(symptom),
      });
    }
  };

  const currentSymptoms = answers.symptoms || [];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>What symptoms are you experiencing?</h2>
        <p>Select all symptoms that apply to your condition.</p>
      </div>

      <div className="symptoms-container">
        {symptomCategories.map((category) => (
          <div key={category.category} className="symptom-category">
            <h3 className="category-title">{category.category}</h3>
            <div className="symptoms-grid">
              {category.symptoms.map((symptom) => {
                const isSelected = currentSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    className={`symptom-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSymptomToggle(symptom)}
                  >
                    <span className="symptom-text">{symptom}</span>
                    {isSelected && (
                      <span className="checkmark">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {currentSymptoms.length > 0 && (
        <div className="selected-symptoms">
          <h3>Selected Symptoms ({currentSymptoms.length}):</h3>
          <div className="symptoms-list">
            {currentSymptoms.map((symptom) => (
              <span key={symptom} className="symptom-tag">
                {symptom}
                <button 
                  onClick={() => handleSymptomToggle(symptom)}
                  className="remove-btn"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomsStep; 