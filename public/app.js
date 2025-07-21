class PhysioAssessmentApp {
    constructor() {
        this.config = null;
        this.currentStep = 0;
        this.assessmentData = {
            selectedBodyParts: [],
            answers: {},
            startTime: new Date(),
            completedSteps: []
        };
        this.elements = {};
        this.init();
    }

    async init() {
        try {
            await this.loadConfiguration();
            this.initializeElements();
            this.setupEventListeners();
            this.applyConfiguration();
            this.renderCurrentStep();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load assessment. Please refresh the page.');
        }
    }

    async loadConfiguration() {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load configuration:', error);
            // Fallback to default configuration
            this.config = await this.getDefaultConfig();
        }
    }

    async getDefaultConfig() {
        // Fallback configuration if server config fails
        return {
            appSettings: {
                title: "PhysioCheck Assessment",
                subtitle: "Professional Physiotherapy Assessment Tool",
                primaryColor: "#ff7b3d",
                secondaryColor: "#f4f4f9",
                textColor: "#333"
            },
            assessmentFlow: [
                {
                    id: "body_selection",
                    type: "body_diagram",
                    title: "Where do you have symptoms?",
                    description: "Please select the areas where you are experiencing symptoms.",
                    instruction: "Click on the body parts to select them. Selected areas will be highlighted.",
                    required: true,
                    bodyParts: [
                        { id: "head", name: "Head", coordinates: [200, 100] },
                        { id: "neck", name: "Neck", coordinates: [200, 140] },
                        { id: "shoulder_left", name: "Left Shoulder", coordinates: [160, 180] },
                        { id: "shoulder_right", name: "Right Shoulder", coordinates: [240, 180] },
                        { id: "chest", name: "Chest", coordinates: [200, 220] },
                        { id: "upper_back", name: "Upper Back", coordinates: [200, 200] },
                        { id: "lower_back", name: "Lower Back", coordinates: [200, 280] },
                        { id: "hip_left", name: "Left Hip", coordinates: [180, 320] },
                        { id: "hip_right", name: "Right Hip", coordinates: [220, 320] },
                        { id: "knee_left", name: "Left Knee", coordinates: [180, 440] },
                        { id: "knee_right", name: "Right Knee", coordinates: [220, 440] }
                    ]
                }
            ],
            customization: {
                showProgressBar: true,
                enableBackNavigation: true
            }
        };
    }

    initializeElements() {
        this.elements = {
            appTitle: document.getElementById('app-title'),
            appSubtitle: document.getElementById('app-subtitle'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            assessmentContainer: document.getElementById('assessment-container'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            loadingOverlay: document.getElementById('loading-overlay'),
            modal: document.getElementById('body-diagram-modal'),
            modalClose: document.getElementById('modal-close'),
            modalDone: document.getElementById('modal-done')
        };
    }

    setupEventListeners() {
        // Navigation buttons
        this.elements.prevBtn.addEventListener('click', () => this.previousStep());
        this.elements.nextBtn.addEventListener('click', () => this.nextStep());

        // Modal events
        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', () => this.closeModal());
        }
        if (this.elements.modalDone) {
            this.elements.modalDone.addEventListener('click', () => this.closeModal());
        }

        // Close modal on outside click
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !this.elements.prevBtn.disabled) {
                this.previousStep();
            } else if (e.key === 'ArrowRight' && !this.elements.nextBtn.disabled) {
                this.nextStep();
            } else if (e.key === 'Escape' && this.elements.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    applyConfiguration() {
        if (!this.config) return;

        const { appSettings } = this.config;
        
        // Apply app title and subtitle
        if (this.elements.appTitle) {
            this.elements.appTitle.textContent = appSettings.title;
        }
        if (this.elements.appSubtitle) {
            this.elements.appSubtitle.textContent = appSettings.subtitle;
        }

        // Apply color scheme
        if (appSettings.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', appSettings.primaryColor);
        }
        if (appSettings.secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', appSettings.secondaryColor);
        }
        if (appSettings.textColor) {
            document.documentElement.style.setProperty('--text-color', appSettings.textColor);
        }
    }

    renderCurrentStep() {
        if (!this.config || !this.config.assessmentFlow) return;

        const step = this.config.assessmentFlow[this.currentStep];
        if (!step) {
            this.showResults();
            return;
        }

        this.updateProgress();
        this.updateNavigation();

        // Clear previous content
        this.elements.assessmentContainer.innerHTML = '';

        // Create step content
        const stepContent = this.createStepContent(step);
        this.elements.assessmentContainer.appendChild(stepContent);

        // Scroll to top
        this.elements.assessmentContainer.scrollTop = 0;
    }

    createStepContent(step) {
        const container = document.createElement('div');
        container.className = 'step-content';

        // Step header
        const header = document.createElement('div');
        header.className = 'step-header';
        
        const title = document.createElement('h2');
        title.className = 'step-title';
        title.textContent = step.title;
        header.appendChild(title);

        if (step.description) {
            const description = document.createElement('p');
            description.className = 'step-description';
            description.textContent = step.description;
            header.appendChild(description);
        }

        if (step.instruction) {
            const instruction = document.createElement('p');
            instruction.className = 'step-instruction';
            instruction.textContent = step.instruction;
            header.appendChild(instruction);
        }

        container.appendChild(header);

        // Step content based on type
        const content = this.createStepTypeContent(step);
        container.appendChild(content);

        return container;
    }

    createStepTypeContent(step) {
        switch (step.type) {
            case 'body_diagram':
                return this.createBodyDiagramContent(step);
            case 'screening':
                return this.createScreeningContent(step);
            case 'demographics':
                return this.createDemographicsContent(step);
            case 'questionnaire':
                return this.createQuestionnaireContent(step);
            default:
                return this.createGenericContent(step);
        }
    }

    createBodyDiagramContent(step) {
        const container = document.createElement('div');
        container.className = 'body-diagram-container';

        // Gender selection
        const genderSelection = document.createElement('div');
        genderSelection.className = 'gender-selection';

        const femaleOption = this.createGenderOption('female', 'FEMALE', '👤');
        const maleOption = this.createGenderOption('male', 'MALE', '👤');

        genderSelection.appendChild(femaleOption);
        genderSelection.appendChild(maleOption);
        container.appendChild(genderSelection);

        // Body diagram
        const bodyDiagram = document.createElement('div');
        bodyDiagram.className = 'body-diagram';

        const bodyFigure = document.createElement('div');
        bodyFigure.className = 'body-figure';
        bodyFigure.id = 'body-figure';

        // Add body parts
        if (step.bodyParts) {
            step.bodyParts.forEach(part => {
                const bodyPart = document.createElement('div');
                bodyPart.className = 'body-part';
                bodyPart.dataset.partId = part.id;
                bodyPart.title = part.name;
                bodyPart.style.left = `${part.coordinates[0]}px`;
                bodyPart.style.top = `${part.coordinates[1]}px`;

                // Check if already selected
                if (this.assessmentData.selectedBodyParts.includes(part.id)) {
                    bodyPart.classList.add('selected');
                }

                bodyPart.addEventListener('click', () => this.toggleBodyPart(part.id, bodyPart));
                bodyFigure.appendChild(bodyPart);
            });
        }

        bodyDiagram.appendChild(bodyFigure);
        container.appendChild(bodyDiagram);

        return container;
    }

    createGenderOption(value, label, icon) {
        const option = document.createElement('div');
        option.className = 'gender-option';
        option.dataset.value = value;

        const iconDiv = document.createElement('div');
        iconDiv.className = 'gender-icon';
        iconDiv.textContent = icon;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'gender-label';
        labelDiv.textContent = label;

        option.appendChild(iconDiv);
        option.appendChild(labelDiv);

        // Check if already selected
        if (this.assessmentData.answers.gender === value) {
            option.classList.add('selected');
        }

        option.addEventListener('click', () => {
            // Remove selection from other options
            document.querySelectorAll('.gender-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select this option
            option.classList.add('selected');
            this.assessmentData.answers.gender = value;
            this.updateNavigation();
        });

        return option;
    }

    createScreeningContent(step) {
        const container = document.createElement('div');
        container.className = 'screening-content';

        if (step.questions) {
            step.questions.forEach((question, index) => {
                const questionContainer = this.createQuestionContainer(question, index + 1, step.id);
                container.appendChild(questionContainer);
            });
        }

        return container;
    }

    createDemographicsContent(step) {
        const container = document.createElement('div');
        container.className = 'demographics-content';

        if (step.fields) {
            step.fields.forEach((field, index) => {
                const fieldContainer = this.createFieldContainer(field, step.id);
                container.appendChild(fieldContainer);
            });
        }

        return container;
    }

    createQuestionnaireContent(step) {
        const container = document.createElement('div');
        container.className = 'questionnaire-content';

        if (step.questions) {
            step.questions.forEach((question, index) => {
                const questionContainer = this.createQuestionContainer(question, index + 1, step.id);
                container.appendChild(questionContainer);
            });
        }

        return container;
    }

    createQuestionContainer(question, number, stepId) {
        const container = document.createElement('div');
        container.className = 'question-container';

        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        
        if (number) {
            const questionNumber = document.createElement('span');
            questionNumber.className = 'question-number';
            questionNumber.textContent = number;
            questionText.appendChild(questionNumber);
        }
        
        const textSpan = document.createElement('span');
        textSpan.textContent = question.question;
        questionText.appendChild(textSpan);
        
        container.appendChild(questionText);

        // Create input based on question type
        const inputContainer = this.createQuestionInput(question, stepId);
        container.appendChild(inputContainer);

        return container;
    }

    createFieldContainer(field, stepId) {
        const container = document.createElement('div');
        container.className = 'question-container';

        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.textContent = field.question;
        container.appendChild(questionText);

        const inputContainer = this.createQuestionInput(field, stepId);
        container.appendChild(inputContainer);

        return container;
    }

    createQuestionInput(question, stepId) {
        const container = document.createElement('div');
        const questionKey = `${stepId}_${question.id}`;

        switch (question.type) {
            case 'yes_no':
                container.className = 'yes-no-container';
                
                const yesOption = this.createYesNoOption('Yes', 'yes', questionKey);
                const noOption = this.createYesNoOption('No', 'no', questionKey);
                
                container.appendChild(yesOption);
                container.appendChild(noOption);
                break;

            case 'select':
                container.className = 'options-container';
                
                question.options.forEach(option => {
                    const optionElement = this.createSelectOption(option, questionKey);
                    container.appendChild(optionElement);
                });
                break;

            case 'multiple_select':
                container.className = 'multiple-select-container';
                
                question.options.forEach(option => {
                    const optionElement = this.createMultipleSelectOption(option, questionKey);
                    container.appendChild(optionElement);
                });
                break;

            case 'scale':
                container.className = 'scale-container';
                
                const scaleInput = document.createElement('input');
                scaleInput.type = 'range';
                scaleInput.className = 'scale-input';
                scaleInput.min = question.min || 0;
                scaleInput.max = question.max || 10;
                scaleInput.value = this.assessmentData.answers[questionKey] || question.min || 0;
                
                const scaleValue = document.createElement('div');
                scaleValue.className = 'scale-value';
                scaleValue.textContent = scaleInput.value;
                
                const scaleLabels = document.createElement('div');
                scaleLabels.className = 'scale-labels';
                scaleLabels.innerHTML = `<span>${question.min || 0}</span><span>${question.max || 10}</span>`;
                
                scaleInput.addEventListener('input', (e) => {
                    scaleValue.textContent = e.target.value;
                    this.assessmentData.answers[questionKey] = parseInt(e.target.value);
                    this.updateNavigation();
                });
                
                container.appendChild(scaleValue);
                container.appendChild(scaleInput);
                container.appendChild(scaleLabels);
                break;

            default:
                container.innerHTML = '<p>Unsupported question type</p>';
        }

        return container;
    }

    createYesNoOption(text, value, questionKey) {
        const option = document.createElement('div');
        option.className = `yes-no-option ${value}`;
        option.textContent = text;
        option.dataset.value = value;

        if (this.assessmentData.answers[questionKey] === value) {
            option.classList.add('selected');
        }

        option.addEventListener('click', () => {
            // Remove selection from other options
            document.querySelectorAll(`[data-question-key="${questionKey}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select this option
            option.classList.add('selected');
            this.assessmentData.answers[questionKey] = value;
            this.updateNavigation();
        });

        option.dataset.questionKey = questionKey;
        return option;
    }

    createSelectOption(optionText, questionKey) {
        const option = document.createElement('div');
        option.className = 'option-item';

        const radio = document.createElement('div');
        radio.className = 'option-radio';

        const text = document.createElement('div');
        text.className = 'option-text';
        text.textContent = optionText;

        option.appendChild(radio);
        option.appendChild(text);

        if (this.assessmentData.answers[questionKey] === optionText) {
            option.classList.add('selected');
        }

        option.addEventListener('click', () => {
            // Remove selection from other options
            document.querySelectorAll(`[data-question-key="${questionKey}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select this option
            option.classList.add('selected');
            this.assessmentData.answers[questionKey] = optionText;
            this.updateNavigation();
        });

        option.dataset.questionKey = questionKey;
        return option;
    }

    createMultipleSelectOption(optionText, questionKey) {
        const option = document.createElement('div');
        option.className = 'multiple-option';

        const checkbox = document.createElement('div');
        checkbox.className = 'multiple-checkbox';

        const text = document.createElement('div');
        text.className = 'option-text';
        text.textContent = optionText;

        option.appendChild(checkbox);
        option.appendChild(text);

        // Initialize answers array if not exists
        if (!this.assessmentData.answers[questionKey]) {
            this.assessmentData.answers[questionKey] = [];
        }

        if (this.assessmentData.answers[questionKey].includes(optionText)) {
            option.classList.add('selected');
        }

        option.addEventListener('click', () => {
            const isSelected = option.classList.contains('selected');
            
            if (isSelected) {
                option.classList.remove('selected');
                const index = this.assessmentData.answers[questionKey].indexOf(optionText);
                if (index > -1) {
                    this.assessmentData.answers[questionKey].splice(index, 1);
                }
            } else {
                option.classList.add('selected');
                this.assessmentData.answers[questionKey].push(optionText);
            }
            
            this.updateNavigation();
        });

        return option;
    }

    createGenericContent(step) {
        const container = document.createElement('div');
        container.innerHTML = '<p>Generic step content</p>';
        return container;
    }

    toggleBodyPart(partId, element) {
        const index = this.assessmentData.selectedBodyParts.indexOf(partId);
        
        if (index > -1) {
            // Remove from selection
            this.assessmentData.selectedBodyParts.splice(index, 1);
            element.classList.remove('selected');
        } else {
            // Add to selection
            this.assessmentData.selectedBodyParts.push(partId);
            element.classList.add('selected');
        }
        
        this.updateNavigation();
    }

    updateProgress() {
        if (!this.config || !this.config.customization?.showProgressBar) return;

        const totalSteps = this.config.assessmentFlow.length;
        const currentProgress = ((this.currentStep + 1) / totalSteps) * 100;
        
        this.elements.progressFill.style.width = `${currentProgress}%`;
        this.elements.progressText.textContent = `Step ${this.currentStep + 1} of ${totalSteps}`;
    }

    updateNavigation() {
        const canGoBack = this.currentStep > 0 && this.config?.customization?.enableBackNavigation;
        const canGoForward = this.isCurrentStepValid();

        this.elements.prevBtn.disabled = !canGoBack;
        this.elements.nextBtn.disabled = !canGoForward;
    }

    isCurrentStepValid() {
        if (!this.config || !this.config.assessmentFlow) return false;

        const step = this.config.assessmentFlow[this.currentStep];
        if (!step) return false;

        switch (step.type) {
            case 'body_diagram':
                return this.assessmentData.selectedBodyParts.length > 0 && this.assessmentData.answers.gender;
            
            case 'screening':
                if (!step.questions) return true;
                return step.questions.every(question => {
                    const questionKey = `${step.id}_${question.id}`;
                    return this.assessmentData.answers[questionKey] !== undefined;
                });
            
            case 'demographics':
                if (!step.fields) return true;
                return step.fields.every(field => {
                    const fieldKey = `${step.id}_${field.id}`;
                    return this.assessmentData.answers[fieldKey] !== undefined;
                });
            
            case 'questionnaire':
                if (!step.questions) return true;
                return step.questions.every(question => {
                    const questionKey = `${step.id}_${question.id}`;
                    const answer = this.assessmentData.answers[questionKey];
                    
                    if (question.type === 'multiple_select') {
                        return Array.isArray(answer) && answer.length > 0;
                    }
                    
                    return answer !== undefined && answer !== null && answer !== '';
                });
            
            default:
                return true;
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderCurrentStep();
        }
    }

    nextStep() {
        if (this.isCurrentStepValid()) {
            this.assessmentData.completedSteps.push(this.currentStep);
            this.currentStep++;
            this.renderCurrentStep();
        }
    }

    showResults() {
        this.elements.assessmentContainer.innerHTML = '';
        
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'results-container';

        const title = document.createElement('h2');
        title.className = 'results-title';
        title.textContent = 'Assessment Complete';
        resultsContainer.appendChild(title);

        const content = document.createElement('div');
        content.className = 'results-content';

        // Summary section
        const summarySection = document.createElement('div');
        summarySection.className = 'results-section';
        
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Summary';
        summarySection.appendChild(summaryTitle);

        const summaryText = document.createElement('p');
        summaryText.textContent = 'Based on your responses, we have identified the following areas of concern:';
        summarySection.appendChild(summaryText);

        // Selected body parts
        if (this.assessmentData.selectedBodyParts.length > 0) {
            const selectedAreas = document.createElement('div');
            selectedAreas.className = 'selected-areas';
            
            this.assessmentData.selectedBodyParts.forEach(partId => {
                const bodyPart = this.getBodyPartName(partId);
                const tag = document.createElement('span');
                tag.className = 'area-tag';
                tag.textContent = bodyPart;
                selectedAreas.appendChild(tag);
            });
            
            summarySection.appendChild(selectedAreas);
        }

        content.appendChild(summarySection);

        // Recommendations section
        const recommendationsSection = document.createElement('div');
        recommendationsSection.className = 'results-section';
        
        const recommendationsTitle = document.createElement('h3');
        recommendationsTitle.textContent = 'Recommendations';
        recommendationsSection.appendChild(recommendationsTitle);

        const recommendationsText = document.createElement('p');
        recommendationsText.textContent = 'We recommend consulting with a qualified healthcare professional for a comprehensive evaluation and personalized treatment plan.';
        recommendationsSection.appendChild(recommendationsText);

        content.appendChild(recommendationsSection);

        // Disclaimer section
        const disclaimerSection = document.createElement('div');
        disclaimerSection.className = 'results-section';
        
        const disclaimerTitle = document.createElement('h3');
        disclaimerTitle.textContent = 'Disclaimer';
        disclaimerSection.appendChild(disclaimerTitle);

        const disclaimerText = document.createElement('p');
        disclaimerText.textContent = 'This assessment provides an indication of the condition(s) that you may be experiencing. For a complete diagnosis and treatment plan, please consult with a qualified healthcare professional.';
        disclaimerSection.appendChild(disclaimerText);

        content.appendChild(disclaimerSection);

        resultsContainer.appendChild(content);

        // Action buttons
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'results-actions';
        actionsContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;';

        const printBtn = document.createElement('button');
        printBtn.className = 'nav-btn nav-btn-secondary';
        printBtn.innerHTML = '🖨️ Print Results';
        printBtn.addEventListener('click', () => window.print());

        const restartBtn = document.createElement('button');
        restartBtn.className = 'nav-btn nav-btn-primary';
        restartBtn.innerHTML = '🔄 Start New Assessment';
        restartBtn.addEventListener('click', () => this.restartAssessment());

        actionsContainer.appendChild(printBtn);
        actionsContainer.appendChild(restartBtn);
        resultsContainer.appendChild(actionsContainer);

        this.elements.assessmentContainer.appendChild(resultsContainer);

        // Hide navigation
        this.elements.prevBtn.style.display = 'none';
        this.elements.nextBtn.style.display = 'none';

        // Update progress to 100%
        this.elements.progressFill.style.width = '100%';
        this.elements.progressText.textContent = 'Assessment Complete';
    }

    getBodyPartName(partId) {
        if (!this.config || !this.config.assessmentFlow) return partId;
        
        const bodyStep = this.config.assessmentFlow.find(step => step.type === 'body_diagram');
        if (!bodyStep || !bodyStep.bodyParts) return partId;
        
        const bodyPart = bodyStep.bodyParts.find(part => part.id === partId);
        return bodyPart ? bodyPart.name : partId;
    }

    restartAssessment() {
        this.currentStep = 0;
        this.assessmentData = {
            selectedBodyParts: [],
            answers: {},
            startTime: new Date(),
            completedSteps: []
        };
        
        // Show navigation
        this.elements.prevBtn.style.display = 'flex';
        this.elements.nextBtn.style.display = 'flex';
        
        this.renderCurrentStep();
    }

    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
        }
    }

    showError(message) {
        this.elements.assessmentContainer.innerHTML = `
            <div class="error-container" style="text-align: center; padding: 2rem;">
                <h2 style="color: var(--danger-color); margin-bottom: 1rem;">Error</h2>
                <p style="color: var(--text-light); margin-bottom: 2rem;">${message}</p>
                <button class="nav-btn nav-btn-primary" onclick="location.reload()">
                    Reload Page
                </button>
            </div>
        `;
    }

    showLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'none';
        }
    }

    // Save assessment data to localStorage
    saveProgress() {
        try {
            const progressData = {
                currentStep: this.currentStep,
                assessmentData: this.assessmentData,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('physio-assessment-progress', JSON.stringify(progressData));
        } catch (error) {
            console.warn('Failed to save progress:', error);
        }
    }

    // Load assessment data from localStorage
    loadProgress() {
        try {
            const savedData = localStorage.getItem('physio-assessment-progress');
            if (savedData) {
                const progressData = JSON.parse(savedData);
                
                // Check if data is not too old (24 hours)
                const savedTime = new Date(progressData.timestamp);
                const now = new Date();
                const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    this.currentStep = progressData.currentStep;
                    this.assessmentData = progressData.assessmentData;
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load progress:', error);
        }
        return false;
    }

    // Export assessment results
    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            selectedBodyParts: this.assessmentData.selectedBodyParts,
            answers: this.assessmentData.answers,
            duration: new Date() - this.assessmentData.startTime
        };

        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `physio-assessment-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhysioAssessmentApp();
});
