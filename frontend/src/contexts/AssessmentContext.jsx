import { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  currentStep: 0,
  selectedBodyParts: [],
  answers: {},
  assessmentId: null,
  config: null,
  loading: false,
  error: null,
  results: null,
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONFIG: 'SET_CONFIG',
  SET_ASSESSMENT_ID: 'SET_ASSESSMENT_ID',
  SET_BODY_PARTS: 'SET_BODY_PARTS',
  SET_ANSWERS: 'SET_ANSWERS',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  SET_RESULTS: 'SET_RESULTS',
  RESET: 'RESET',
};

// Reducer
function assessmentReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_CONFIG:
      return { ...state, config: action.payload, loading: false };
    case ACTIONS.SET_ASSESSMENT_ID:
      return { ...state, assessmentId: action.payload };
    case ACTIONS.SET_BODY_PARTS:
      return { ...state, selectedBodyParts: action.payload };
    case ACTIONS.SET_ANSWERS:
      return { ...state, answers: { ...state.answers, ...action.payload } };
    case ACTIONS.NEXT_STEP:
      return { ...state, currentStep: state.currentStep + 1 };
    case ACTIONS.PREV_STEP:
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case ACTIONS.SET_RESULTS:
      return { ...state, results: action.payload, loading: false };
    case ACTIONS.RESET:
      return initialState;
    default:
      return state;
  }
}

// Create context
const AssessmentContext = createContext();

// Provider component
export function AssessmentProvider({ children }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  const value = {
    ...state,
    dispatch,
    actions: ACTIONS,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

// Custom hook
export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
} 