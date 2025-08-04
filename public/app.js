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
                return this.assessmentData.selectedBodyParts.length > 0;
            
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

        // Generate comprehensive results
        const results = this.generateResults();

        // Summary section
        const summarySection = this.createResultsSection('Summary', results.summary);
        content.appendChild(summarySection);

        // Risk Assessment section
        if (results.riskAssessment) {
            const riskSection = this.createResultsSection('Risk Assessment', results.riskAssessment);
            content.appendChild(riskSection);
        }

        // Recommendations section
        const recommendationsSection = this.createResultsSection('Recommendations', results.recommendations);
        content.appendChild(recommendationsSection);

        // Self-Care Tips section
        if (results.selfCareTips) {
            const selfCareSection = this.createResultsSection('Self-Care Tips', results.selfCareTips);
            content.appendChild(selfCareSection);
        }

        // When to Seek Medical Attention section
        const medicalAttentionSection = this.createResultsSection('When to Seek Medical Attention', results.medicalAttention);
        content.appendChild(medicalAttentionSection);

        // Disclaimer section
        const disclaimerSection = this.createResultsSection('Disclaimer', results.disclaimer);
        content.appendChild(disclaimerSection);

        resultsContainer.appendChild(content);

        // Action buttons
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'results-actions';
        actionsContainer.style.cssText = 'display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;';

        const exportBtn = document.createElement('button');
        exportBtn.className = 'nav-btn nav-btn-secondary';
        exportBtn.innerHTML = '📄 Export Results';
        exportBtn.addEventListener('click', () => this.exportResults());

        const printBtn = document.createElement('button');
        printBtn.className = 'nav-btn nav-btn-secondary';
        printBtn.innerHTML = '🖨️ Print Results';
        printBtn.addEventListener('click', () => window.print());

        const restartBtn = document.createElement('button');
        restartBtn.className = 'nav-btn nav-btn-primary';
        restartBtn.innerHTML = '🔄 Start New Assessment';
        restartBtn.addEventListener('click', () => this.restartAssessment());

        actionsContainer.appendChild(exportBtn);
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

        // Submit results to server
        this.submitResults();
    }

    createResultsSection(title, content) {
        const section = document.createElement('div');
        section.className = 'results-section';
        
        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);

        if (Array.isArray(content)) {
            content.forEach(item => {
                const paragraph = document.createElement('p');
                paragraph.textContent = item;
                section.appendChild(paragraph);
            });
        } else {
            const paragraph = document.createElement('p');
            paragraph.textContent = content;
            section.appendChild(paragraph);
        }

        return section;
    }

    generateResults() {
        const results = {
            summary: [],
            riskAssessment: null,
            recommendations: [],
            selfCareTips: [],
            medicalAttention: [],
            disclaimer: 'This assessment provides an indication of the condition(s) that you may be experiencing. For a complete diagnosis and treatment plan, please consult with a qualified healthcare professional.'
        };

        // Generate summary
        if (this.assessmentData.selectedBodyParts.length > 0) {
            const areas = this.assessmentData.selectedBodyParts.map(partId => this.getBodyPartName(partId)).join(', ');
            results.summary.push(`Primary areas of concern: ${areas}`);
        }

        // Comprehensive risk assessment
        const riskLevel = this.assessRiskLevel();
        results.riskAssessment = riskLevel.assessment;
        
        if (riskLevel.level === 'HIGH') {
            results.recommendations.push('Immediate medical evaluation is strongly recommended.');
            results.medicalAttention.push('Seek immediate medical attention due to the presence of red flags or concerning symptoms.');
        } else if (riskLevel.level === 'MEDIUM') {
            results.recommendations.push('Schedule a medical evaluation within the next few days.');
            results.medicalAttention.push('Monitor symptoms closely and seek medical attention if they worsen.');
        }

        // Generate recommendations based on body areas
        const recommendations = this.generateRecommendations();
        results.recommendations.push(...recommendations);

        // Generate self-care tips
        const selfCareTips = this.generateSelfCareTips();
        results.selfCareTips.push(...selfCareTips);

        // Standard medical attention items
        results.medicalAttention.push(
            'Severe or worsening pain',
            'Numbness, tingling, or weakness in limbs',
            'Loss of bowel or bladder control',
            'Fever with back pain',
            'Pain that wakes you at night',
            'Inability to bear weight on affected area'
        );

        return results;
    }

    assessRiskLevel() {
        const redFlags = this.checkRedFlags();
        const symptomAnswers = this.assessmentData.answers.symptom_onset || {};
        const functionalAnswers = this.assessmentData.answers.functional_assessment || {};
        
        let riskScore = 0;
        const riskFactors = [];

        // Red flags (high weight)
        if (redFlags.length > 0) {
            riskScore += redFlags.length * 10;
            riskFactors.push(`Red flags: ${redFlags.join(', ')}`);
        }

        // Pain level assessment
        const painLevel = parseInt(symptomAnswers.pain_level) || 0;
        if (painLevel >= 8) {
            riskScore += 8;
            riskFactors.push(`Severe pain (level ${painLevel}/10)`);
        } else if (painLevel >= 6) {
            riskScore += 4;
            riskFactors.push(`Moderate to severe pain (level ${painLevel}/10)`);
        }

        // Duration assessment
        const duration = symptomAnswers.duration;
        if (duration === 'More than 6 months') {
            riskScore += 3;
            riskFactors.push('Chronic symptoms (>6 months)');
        } else if (duration === '3-6 months') {
            riskScore += 2;
            riskFactors.push('Prolonged symptoms (3-6 months)');
        }

        // Functional impact
        const workImpact = functionalAnswers.work_impact;
        if (workImpact === 'Unable to work/perform activities') {
            riskScore += 6;
            riskFactors.push('Severe functional limitation');
        } else if (workImpact === 'Severely') {
            riskScore += 4;
            riskFactors.push('Significant functional impact');
        }

        // Sleep impact
        const sleepImpact = functionalAnswers.sleep_impact;
        if (sleepImpact === 'Unable to sleep due to symptoms') {
            riskScore += 5;
            riskFactors.push('Severe sleep disturbance');
        } else if (sleepImpact === 'Frequent sleep disturbance') {
            riskScore += 3;
            riskFactors.push('Frequent sleep problems');
        }

        // Pain patterns
        const painPattern = symptomAnswers.pain_pattern || [];
        if (painPattern.includes('Constant')) {
            riskScore += 4;
            riskFactors.push('Constant pain pattern');
        }
        if (painPattern.includes('At night')) {
            riskScore += 3;
            riskFactors.push('Night pain');
        }

        // Multiple body areas
        const bodyAreas = this.assessmentData.selectedBodyParts.length;
        if (bodyAreas >= 4) {
            riskScore += 3;
            riskFactors.push(`Multiple affected areas (${bodyAreas} areas)`);
        } else if (bodyAreas >= 2) {
            riskScore += 1;
            riskFactors.push(`Multiple affected areas (${bodyAreas} areas)`);
        }

        // Determine risk level
        let level, assessment;
        if (riskScore >= 15 || redFlags.length > 0) {
            level = 'HIGH';
            assessment = `HIGH RISK - Multiple concerning factors: ${riskFactors.join(', ')}`;
        } else if (riskScore >= 8) {
            level = 'MEDIUM';
            assessment = `MEDIUM RISK - Some concerning factors: ${riskFactors.join(', ')}`;
        } else {
            level = 'LOW';
            assessment = 'LOW RISK - No immediate concerning factors detected';
        }

        return { level, assessment, riskScore, riskFactors };
    }

    checkRedFlags() {
        const redFlags = [];
        const screeningAnswers = this.assessmentData.answers.screening_questions || {};

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

    generateRecommendations() {
        const recommendations = [];
        const selectedAreas = this.assessmentData.selectedBodyParts;

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

    generateSelfCareTips() {
        const tips = [];
        const selectedAreas = this.assessmentData.selectedBodyParts;

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

    async submitResults() {
        try {
            const resultData = {
                ...this.assessmentData,
                completedAt: new Date().toISOString(),
                results: this.generateResults()
            };

            const response = await fetch('/api/assessment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resultData)
            });

            if (response.ok) {
                console.log('Results submitted successfully');
            } else {
                console.error('Failed to submit results');
            }
        } catch (error) {
            console.error('Error submitting results:', error);
        }
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
