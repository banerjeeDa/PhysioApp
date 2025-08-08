import React from 'react';
import { useAssessment } from '../../contexts/AssessmentContext.jsx';
import { apiService } from '../../services/api.js';

function BodyDiagramStep() {
  const { selectedBodyParts, dispatch, actions, assessmentId } = useAssessment();

  const bodyParts = [
    { id: 'head', name: 'Head', x: 200, y: 80 },
    { id: 'neck', name: 'Neck', x: 200, y: 120 },
    { id: 'shoulder_left', name: 'Left Shoulder', x: 160, y: 140 },
    { id: 'shoulder_right', name: 'Right Shoulder', x: 240, y: 140 },
    { id: 'chest', name: 'Chest', x: 200, y: 180 },
    { id: 'upper_back', name: 'Upper Back', x: 200, y: 200 },
    { id: 'lower_back', name: 'Lower Back', x: 200, y: 280 },
    { id: 'hip_left', name: 'Left Hip', x: 180, y: 320 },
    { id: 'hip_right', name: 'Right Hip', x: 220, y: 320 },
    { id: 'knee_left', name: 'Left Knee', x: 180, y: 440 },
    { id: 'knee_right', name: 'Right Knee', x: 220, y: 440 },
    { id: 'ankle_left', name: 'Left Ankle', x: 180, y: 520 },
    { id: 'ankle_right', name: 'Right Ankle', x: 220, y: 520 },
    { id: 'elbow_left', name: 'Left Elbow', x: 140, y: 240 },
    { id: 'elbow_right', name: 'Right Elbow', x: 260, y: 240 },
    { id: 'wrist_left', name: 'Left Wrist', x: 120, y: 320 },
    { id: 'wrist_right', name: 'Right Wrist', x: 280, y: 320 },
  ];

  const handlePartClick = async (partId) => {
    const newSelectedParts = selectedBodyParts.includes(partId)
      ? selectedBodyParts.filter(id => id !== partId)
      : [...selectedBodyParts, partId];

    dispatch({ type: actions.SET_BODY_PARTS, payload: newSelectedParts });

    // Track analytics
    if (assessmentId) {
      await apiService.trackAnalytics(assessmentId, {
        eventType: 'body_part_selected',
        bodyPart: partId,
        selected: !selectedBodyParts.includes(partId),
      });
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Where do you have symptoms?</h2>
        <p>Click on the body parts to select them. You can select multiple areas.</p>
      </div>
      
      <div className="body-diagram-container">
        <svg width="400" height="560" className="body-diagram">
          {/* Enhanced body outline */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f3f4f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#e5e7eb', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Head */}
          <circle cx="200" cy="80" r="25" fill="url(#bodyGradient)" stroke="#9ca3af" strokeWidth="2" />
          
          {/* Neck */}
          <rect x="190" y="105" width="20" height="15" fill="url(#bodyGradient)" stroke="#9ca3af" strokeWidth="2" />
          
          {/* Torso */}
          <path d="M 150 120 L 250 120 L 240 280 L 160 280 Z" fill="url(#bodyGradient)" stroke="#9ca3af" strokeWidth="2" />
          
          {/* Arms */}
          <path d="M 150 120 L 120 200 L 130 220 L 160 140 Z" fill="url(#bodyGradient)" stroke="#9ca3af" strokeWidth="2" />
          <path d="M 250 120 L 280 200 L 270 220 L 240 140 Z" fill="url(#bodyGradient)" stroke="#9ca3af" strokeWidth="2" />
          
          {/* Legs */}
          <path d="M 160 280 L 140 400 L 150 420 L 170 300 Z" fill="url(#bodyGradient)" stroke="#9ca3af" strokeWidth="2" />
          <path d="M 240 280 L 260 400 L 250 420 L 230 300 Z" fill="url(#bodyGradient)" stroke="#9ca3af" strokeWidth="2" />
          
          {/* Interactive body parts */}
          {bodyParts.map((part) => {
            const isSelected = selectedBodyParts.includes(part.id);
            return (
              <g key={part.id}>
                <circle
                  cx={part.x}
                  cy={part.y}
                  r={isSelected ? 20 : 15}
                  fill={isSelected ? '#f97316' : 'rgba(249, 115, 22, 0.3)'}
                  stroke={isSelected ? '#ea580c' : '#f97316'}
                  strokeWidth={isSelected ? 3 : 2}
                  className="body-part"
                  onClick={() => handlePartClick(part.id)}
                  style={{ cursor: 'pointer' }}
                />
                {isSelected && (
                  <text
                    x={part.x}
                    y={part.y - 25}
                    textAnchor="middle"
                    className="part-label"
                    style={{ fontSize: '10px', fontWeight: '600', fill: '#92400e' }}
                  >
                    {part.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {selectedBodyParts.length > 0 && (
        <div className="selected-parts">
          <h3>Selected Areas ({selectedBodyParts.length}):</h3>
          <div className="parts-list">
            {selectedBodyParts.map((partId) => {
              const part = bodyParts.find(p => p.id === partId);
              return (
                <span key={partId} className="part-tag">
                  {part?.name || partId}
                  <button 
                    onClick={() => handlePartClick(partId)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BodyDiagramStep; 