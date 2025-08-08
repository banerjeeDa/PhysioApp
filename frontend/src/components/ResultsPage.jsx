import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.js';

function ResultsPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAssessment(assessmentId);
        
        if (response.success) {
          setResults(response.data);
        } else {
          setError(response.error || 'Failed to load results');
        }
      } catch (err) {
        setError('An error occurred while loading results');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      loadResults();
    }
  }, [assessmentId]);

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return '✅';
      case 'medium': return '⚠️';
      case 'high': return '🚨';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="results-loading">
        <div className="loading-spinner"></div>
        <h2>Loading your assessment results...</h2>
        <p>Please wait while we analyze your responses.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-error">
        <h2>Error Loading Results</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Start New Assessment
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-error">
        <h2>No Results Found</h2>
        <p>The assessment results could not be found.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Start New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="results-page">
      <header className="results-header">
        <h1>Assessment Results</h1>
        <p>Your personalized physiotherapy assessment report</p>
      </header>

      <main className="results-content">
        {/* Risk Assessment */}
        <div className="results-section risk-assessment">
          <h2>Risk Assessment</h2>
          <div className="risk-summary">
            <div 
              className="risk-level"
              style={{ borderColor: getRiskLevelColor(results.riskLevel) }}
            >
              <span className="risk-icon">{getRiskLevelIcon(results.riskLevel)}</span>
              <div className="risk-info">
                <h3>Risk Level: {results.riskLevel || 'Not Assessed'}</h3>
                <p>Score: {results.riskScore || 'N/A'}/100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {results.summary && (
          <div className="results-section">
            <h2>Assessment Summary</h2>
            <div className="summary-content">
              <p>{results.summary}</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {results.recommendations && (
          <div className="results-section">
            <h2>Recommendations</h2>
            <div className="recommendations-list">
              {Array.isArray(results.recommendations) ? (
                results.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <span className="recommendation-icon">💡</span>
                    <p>{rec}</p>
                  </div>
                ))
              ) : (
                <p>{results.recommendations}</p>
              )}
            </div>
          </div>
        )}

        {/* Self-Care Tips */}
        {results.selfCareTips && (
          <div className="results-section">
            <h2>Self-Care Tips</h2>
            <div className="tips-list">
              {Array.isArray(results.selfCareTips) ? (
                results.selfCareTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <span className="tip-icon">🏠</span>
                    <p>{tip}</p>
                  </div>
                ))
              ) : (
                <p>{results.selfCareTips}</p>
              )}
            </div>
          </div>
        )}

        {/* Medical Attention */}
        {results.medicalAttention && (
          <div className="results-section medical-attention">
            <h2>When to Seek Medical Attention</h2>
            <div className="medical-list">
              {Array.isArray(results.medicalAttention) ? (
                results.medicalAttention.map((item, index) => (
                  <div key={index} className="medical-item">
                    <span className="medical-icon">🏥</span>
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <p>{results.medicalAttention}</p>
              )}
            </div>
          </div>
        )}

        {/* Assessment Details */}
        <div className="results-section assessment-details">
          <h2>Assessment Details</h2>
          <div className="details-grid">
            {results.selectedBodyParts && (
              <div className="detail-item">
                <h4>Affected Areas</h4>
                <div className="body-parts-list">
                  {results.selectedBodyParts.map((part, index) => (
                    <span key={index} className="body-part-tag">{part}</span>
                  ))}
                </div>
              </div>
            )}
            
            {results.answers?.painLevel && (
              <div className="detail-item">
                <h4>Pain Level</h4>
                <p>{results.answers.painLevel}/10</p>
              </div>
            )}

            {results.answers?.symptoms && (
              <div className="detail-item">
                <h4>Reported Symptoms</h4>
                <div className="symptoms-list">
                  {results.answers.symptoms.map((symptom, index) => (
                    <span key={index} className="symptom-tag">{symptom}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="results-footer">
        <div className="action-buttons">
          <button onClick={() => navigate('/')} className="btn-secondary">
            Start New Assessment
          </button>
          <button onClick={() => window.print()} className="btn-primary">
            Print Results
          </button>
        </div>
        
        <div className="disclaimer">
          <p>
            <strong>Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice. 
            Always consult with a qualified healthcare provider for proper diagnosis and treatment.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ResultsPage; 