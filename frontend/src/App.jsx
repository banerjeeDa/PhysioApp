import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AssessmentProvider, useAssessment } from './contexts/AssessmentContext.jsx';
import { apiService } from './services/api.js';
import BodyDiagramStep from './components/steps/BodyDiagramStep.jsx';
import PainLevelStep from './components/steps/PainLevelStep.jsx';
import SymptomsStep from './components/steps/SymptomsStep.jsx';
import ResultsPage from './components/ResultsPage.jsx';
import './App.css';

// Assessment Flow Component
function AssessmentFlow() {
  const { 
    currentStep, 
    selectedBodyParts, 
    answers, 
    assessmentId, 
    dispatch, 
    actions,
    loading,
    error 
  } = useAssessment();
  const navigate = useNavigate();

  // Initialize assessment on component mount
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        dispatch({ type: actions.SET_LOADING, payload: true });
        
        // Create new assessment
        const response = await apiService.createAssessment({
          selectedBodyParts: [],
          answers: {}
        });
        
        if (response.success) {
          dispatch({ type: actions.SET_ASSESSMENT_ID, payload: response.data.assessmentId });
        } else {
          dispatch({ type: actions.SET_ERROR, payload: 'Failed to initialize assessment' });
        }
      } catch (err) {
        dispatch({ type: actions.SET_ERROR, payload: 'Failed to start assessment' });
      } finally {
        dispatch({ type: actions.SET_LOADING, payload: false });
      }
    };

    if (!assessmentId) {
      initializeAssessment();
    }
  }, [assessmentId, dispatch, actions]);

  // Define assessment steps
  const steps = [
    {
      id: 'body-diagram',
      title: 'Select Body Areas',
      component: BodyDiagramStep,
      canProceed: () => selectedBodyParts.length > 0
    },
    {
      id: 'pain-level',
      title: 'Pain Level',
      component: PainLevelStep,
      canProceed: () => answers.painLevel
    },
    {
      id: 'symptoms',
      title: 'Symptoms',
      component: SymptomsStep,
      canProceed: () => true // Can always proceed from symptoms
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStepData?.canProceed();

  const handleNext = async () => {
    if (!canProceed) return;

    if (isLastStep) {
      // Submit assessment
      try {
        dispatch({ type: actions.SET_LOADING, payload: true });
        
        const assessmentData = {
          selectedBodyParts,
          answers
        };

        const response = await apiService.submitAssessment(assessmentId, assessmentData);
        
        if (response.success) {
          // Navigate to results
          navigate(`/results/${assessmentId}`);
        } else {
          dispatch({ type: actions.SET_ERROR, payload: response.error || 'Failed to submit assessment' });
        }
      } catch (err) {
        dispatch({ type: actions.SET_ERROR, payload: 'Failed to submit assessment' });
      } finally {
        dispatch({ type: actions.SET_LOADING, payload: false });
      }
    } else {
      // Move to next step
      dispatch({ type: actions.NEXT_STEP });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      dispatch({ type: actions.PREV_STEP });
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>Loading Assessment...</h2>
        <p>Please wait while we prepare your assessment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const CurrentStepComponent = currentStepData?.component;

  return (
    <div className="app">
      <header className="header">
        <h1>PhysioCheck Assessment</h1>
        <p>Professional Physiotherapy Assessment Tool</p>
      </header>

      <main className="main">
        <div className="assessment-card">
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          {/* Step Title */}
          <div className="step-title">
            <h2>{currentStepData?.title}</h2>
          </div>

          {/* Current Step Component */}
          {CurrentStepComponent && <CurrentStepComponent />}

          {/* Navigation */}
          <div className="navigation">
            {currentStep > 0 && (
              <button onClick={handlePrevious} className="btn-secondary">
                Previous
              </button>
            )}
            <button 
              onClick={handleNext} 
              className="btn-primary"
              disabled={!canProceed}
            >
              {isLastStep ? 'Submit Assessment' : 'Next Step'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <AssessmentProvider>
        <Routes>
          <Route path="/" element={<AssessmentFlow />} />
          <Route path="/results/:assessmentId" element={<ResultsPage />} />
        </Routes>
      </AssessmentProvider>
    </Router>
  );
}

export default App;
