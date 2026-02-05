// ==========================================
// Data Management
// ==========================================
class CBTApp {
    constructor() {
        this.config = null;
        this.answers = [];
        this.correctAnswers = [];
        this.timerInterval = null;
        this.remainingSeconds = 0;
        this.init();
    }

    init() {
        this.loadConfig();
        this.loadAppState();
        this.setupEventListeners();
        this.updateChoiceNamesInput();
        this.restoreState();
    }

    // ==========================================
    // Event Listeners
    // ==========================================
    setupEventListeners() {
        // Custom number stepper buttons
        document.querySelectorAll('.stepper-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleStepperClick(e.currentTarget);
            });
        });

        // Setup form submission
        document.getElementById('setupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSetupSubmit();
        });

        // No time limit checkbox
        document.getElementById('noTimeLimit').addEventListener('change', (e) => {
            const timeLimitInput = document.getElementById('timeLimit');
            timeLimitInput.disabled = e.target.checked;
            if (e.target.checked) {
                timeLimitInput.value = 0;
            }
        });

        // Choice count change - auto-generate choice names
        document.getElementById('choiceCount').addEventListener('input', () => {
            this.updateChoiceNamesInput();
        });

        // Save answers button
        document.getElementById('saveAnswersBtn').addEventListener('click', () => {
            this.saveAnswers();
        });

        // Back to setup button
        document.getElementById('backToSetupBtn').addEventListener('click', () => {
            this.showMode('setupMode');
            this.stopTimer();
        });

        // Input correct answers button
        document.getElementById('inputCorrectBtn').addEventListener('click', () => {
            this.enableCorrectAnswerInput();
        });

        // Show results button
        document.getElementById('showResultsBtn').addEventListener('click', () => {
            this.calculateAndShowResults();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
    }

    // ==========================================
    // Number Stepper
    // ==========================================
    handleStepperClick(button) {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const currentValue = parseInt(input.value) || 0;
        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || Infinity;
        const isPlus = button.classList.contains('stepper-plus');

        let newValue = currentValue;
        if (isPlus) {
            newValue = Math.min(currentValue + 1, max);
        } else {
            newValue = Math.max(currentValue - 1, min);
        }

        input.value = newValue;

        // Trigger input event to update choice names if needed
        if (targetId === 'choiceCount') {
            this.updateChoiceNamesInput();
        }
    }

    // ==========================================
    // Setup Mode
    // ==========================================
    updateChoiceNamesInput() {
        const choiceCount = parseInt(document.getElementById('choiceCount').value) || 5;
        const choiceLabelsInput = document.getElementById('choiceLabels');

        // Auto-generate choice names (A, B, C, D, E...)
        const autoNames = [];
        for (let i = 0; i < choiceCount; i++) {
            autoNames.push(String.fromCharCode(65 + i)); // A=65 in ASCII
        }

        if (!choiceLabelsInput.value || choiceLabelsInput.value.split(',').length !== choiceCount) {
            choiceLabelsInput.value = autoNames.join(', ');
        }
    }

    handleSetupSubmit() {
        const questionCount = parseInt(document.getElementById('questionCount').value);
        const choiceCount = parseInt(document.getElementById('choiceCount').value);
        const choiceLabelsRaw = document.getElementById('choiceLabels').value;
        const noTimeLimit = document.getElementById('noTimeLimit').checked;
        const timeLimit = noTimeLimit ? null : parseInt(document.getElementById('timeLimit').value);

        // Parse choice names
        const choiceNames = choiceLabelsRaw.split(',').map(name => name.trim()).filter(name => name);

        // Validate
        if (choiceNames.length !== choiceCount) {
            alert(`選択肢の名前が ${choiceCount} 個必要です。現在 ${choiceNames.length} 個です。`);
            return;
        }

        // Save config
        this.config = {
            questionCount,
            choiceCount,
            choiceNames,
            timeLimit
        };
        this.saveConfig();

        // Initialize answers array
        this.answers = new Array(questionCount).fill(null);
        this.correctAnswers = new Array(questionCount).fill(null);

        // Show answer mode
        this.renderAnswerForm();
        this.showMode('answerMode');
        this.startTimer();
    }

    // ==========================================
    // Answer Mode
    // ==========================================
    renderAnswerForm() {
        const answerForm = document.getElementById('answerForm');
        answerForm.innerHTML = '';

        const progress = document.getElementById('answerProgress');
        progress.textContent = `全 ${this.config.questionCount} 問`;

        for (let i = 0; i < this.config.questionCount; i++) {
            const card = this.createQuestionCard(i, 'answer');
            answerForm.appendChild(card);
        }
    }

    createQuestionCard(questionIndex, mode) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.id = `question-${questionIndex}`;

        const questionNumber = document.createElement('div');
        questionNumber.className = 'question-number';
        questionNumber.textContent = `問題 ${questionIndex + 1}`;
        card.appendChild(questionNumber);

        const choices = document.createElement('div');
        choices.className = 'choices';

        for (let j = 0; j < this.config.choiceCount; j++) {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = 'choice-btn';
            choiceBtn.textContent = this.config.choiceNames[j];
            choiceBtn.dataset.questionIndex = questionIndex;
            choiceBtn.dataset.choiceIndex = j;

            if (mode === 'answer') {
                // Check if this choice was previously selected
                if (this.answers[questionIndex] === j) {
                    choiceBtn.classList.add('selected');
                }

                choiceBtn.addEventListener('click', (e) => {
                    this.selectAnswer(questionIndex, j, e.currentTarget);
                });
            } else if (mode === 'grading') {
                choiceBtn.disabled = true;

                // Show user's answer
                if (this.answers[questionIndex] === j) {
                    choiceBtn.classList.add('selected');
                }
            }

            choices.appendChild(choiceBtn);
        }

        card.appendChild(choices);
        return card;
    }

    selectAnswer(questionIndex, choiceIndex, button) {
        // Update answer
        this.answers[questionIndex] = choiceIndex;
        this.saveAppState(); // Save after each answer

        // Update UI - remove selected class from all choices in this question
        const questionCard = button.closest('.question-card');
        questionCard.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selected class to clicked button
        button.classList.add('selected');
    }

    saveAnswers() {
        // Check if all questions are answered
        const unanswered = this.answers.filter(a => a === null).length;
        if (unanswered > 0) {
            const confirm = window.confirm(`${unanswered} 問未解答です。このまま採点に進みますか？`);
            if (!confirm) return;
        }

        this.stopTimer();
        this.renderGradingForm();
        this.showMode('gradingMode');
        this.saveAppState();
        this.scrollToTop();
    }

    // ==========================================
    // Timer
    // ==========================================
    startTimer() {
        if (!this.config.timeLimit || this.config.timeLimit === 0) {
            document.getElementById('timerDisplay').classList.add('hidden');
            return;
        }

        document.getElementById('timerDisplay').classList.remove('hidden');
        this.remainingSeconds = this.config.timeLimit * 60;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateTimerDisplay();

            if (this.remainingSeconds <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('timerValue').textContent = display;

        const timerDisplay = document.getElementById('timerDisplay');
        timerDisplay.classList.remove('timer-warning', 'timer-danger');

        // Add warning/danger classes
        if (this.remainingSeconds <= 60) {
            timerDisplay.classList.add('timer-danger');
        } else if (this.remainingSeconds <= 300) {
            timerDisplay.classList.add('timer-warning');
        }
    }

    handleTimeUp() {
        this.stopTimer();
        alert('⏰ 時間切れです！自動的に採点モードに移行します。');
        this.saveAnswers();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // ==========================================
    // Grading Mode
    // ==========================================
    renderGradingForm() {
        const gradingForm = document.getElementById('gradingForm');
        gradingForm.innerHTML = '';

        for (let i = 0; i < this.config.questionCount; i++) {
            const card = this.createQuestionCard(i, 'grading');
            gradingForm.appendChild(card);
        }

        // Hide score initially
        document.getElementById('scoreDisplay').classList.add('hidden');
        document.getElementById('inputCorrectBtn').classList.remove('hidden');
        document.getElementById('showResultsBtn').classList.add('hidden');
    }

    enableCorrectAnswerInput() {
        const gradingForm = document.getElementById('gradingForm');

        gradingForm.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected');

            const questionIndex = parseInt(btn.dataset.questionIndex);
            const choiceIndex = parseInt(btn.dataset.choiceIndex);

            // Restore previously selected correct answer
            if (this.correctAnswers[questionIndex] === choiceIndex) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', (e) => {
                this.selectCorrectAnswer(questionIndex, choiceIndex, e.currentTarget);
            });
        });

        document.getElementById('inputCorrectBtn').classList.add('hidden');
        document.getElementById('showResultsBtn').classList.remove('hidden');
    }

    selectCorrectAnswer(questionIndex, choiceIndex, button) {
        // Update correct answer
        this.correctAnswers[questionIndex] = choiceIndex;
        this.saveAppState(); // Save after each correct answer input

        // Update UI
        const questionCard = button.closest('.question-card');
        questionCard.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        button.classList.add('selected');
    }

    calculateAndShowResults() {
        // Check if all correct answers are provided
        const unanswered = this.correctAnswers.filter(a => a === null).length;
        if (unanswered > 0) {
            alert(`${unanswered} 問の正解が未入力です。すべての正解を入力してください。`);
            return;
        }

        // Calculate score
        let correctCount = 0;
        for (let i = 0; i < this.config.questionCount; i++) {
            if (this.answers[i] === this.correctAnswers[i]) {
                correctCount++;
            }
        }

        const accuracyRate = ((correctCount / this.config.questionCount) * 100).toFixed(1);

        // Display score
        document.getElementById('correctCount').textContent = `${correctCount} / ${this.config.questionCount}`;
        document.getElementById('accuracyRate').textContent = `${accuracyRate}%`;
        document.getElementById('scoreDisplay').classList.remove('hidden');

        // CRITICAL: Remove all event listeners FIRST by cloning buttons
        // This prevents the click handlers from interfering with class application
        const gradingForm = document.getElementById('gradingForm');
        gradingForm.querySelectorAll('.choice-btn').forEach(oldBtn => {
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        });

        // Show results on cards
        this.showResultsOnCards();

        // Disable further editing AFTER showing results
        setTimeout(() => {
            document.getElementById('gradingForm').querySelectorAll('.choice-btn').forEach(btn => {
                btn.disabled = true;
            });
        }, 50);

        document.getElementById('showResultsBtn').classList.add('hidden');
        this.scrollToTop();
    }

    showResultsOnCards() {
        // CRITICAL: Get cards from gradingForm, not from the entire document
        // because answerForm also has cards with the same IDs
        const gradingForm = document.getElementById('gradingForm');
        const questionCards = gradingForm.querySelectorAll('.question-card');

        questionCards.forEach((card, i) => {
            const userAnswer = this.answers[i];
            const correctAnswer = this.correctAnswers[i];
            const isCorrect = userAnswer === correctAnswer;

            // Mark card as correct/incorrect
            if (isCorrect) {
                card.classList.add('correct');
            } else {
                card.classList.add('incorrect');
            }

            // Mark buttons
            const choices = card.querySelectorAll('.choice-btn');

            choices.forEach((btn, index) => {
                // Remove previous classes
                btn.classList.remove('selected', 'correct-answer', 'wrong-answer');

                // Show correct answer in green
                if (index === correctAnswer) {
                    btn.classList.add('correct-answer');
                }

                // Show user's wrong answer in red (only if answered and incorrect)
                if (userAnswer !== null && index === userAnswer && !isCorrect) {
                    btn.classList.add('wrong-answer');
                }
            });
        });
    }

    // ==========================================
    // Mode Navigation
    // ==========================================
    showMode(modeId) {
        document.querySelectorAll('.mode-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(modeId).classList.add('active');
    }

    // ==========================================
    // Data Persistence
    // ==========================================
    saveConfig() {
        localStorage.setItem('cbt-config', JSON.stringify(this.config));
    }

    loadConfig() {
        const saved = localStorage.getItem('cbt-config');
        if (saved) {
            this.config = JSON.parse(saved);
        }
    }

    saveAppState() {
        const state = {
            answers: this.answers,
            correctAnswers: this.correctAnswers,
            remainingSeconds: this.remainingSeconds,
            currentMode: this.getCurrentMode(),
            timestamp: Date.now()
        };
        localStorage.setItem('cbt-app-state', JSON.stringify(state));
    }

    loadAppState() {
        const saved = localStorage.getItem('cbt-app-state');
        if (saved) {
            const state = JSON.parse(saved);
            this.answers = state.answers || [];
            this.correctAnswers = state.correctAnswers || [];
            this.remainingSeconds = state.remainingSeconds || 0;
            this.savedMode = state.currentMode || 'setupMode';
        }
    }

    getCurrentMode() {
        const modes = ['setupMode', 'answerMode', 'gradingMode'];
        for (const mode of modes) {
            const element = document.getElementById(mode);
            if (element && element.classList.contains('active')) {
                return mode;
            }
        }
        return 'setupMode';
    }

    restoreState() {
        // Only restore if we have saved config and state
        if (!this.config || !this.savedMode || this.savedMode === 'setupMode') {
            return;
        }

        // Restore to answer mode
        if (this.savedMode === 'answerMode') {
            this.renderAnswerForm();
            this.showMode('answerMode');

            // Restore timer if there was one
            if (this.config.timeLimit && this.config.timeLimit > 0 && this.remainingSeconds > 0) {
                document.getElementById('timerDisplay').classList.remove('hidden');
                this.updateTimerDisplay();
                this.timerInterval = setInterval(() => {
                    this.remainingSeconds--;
                    this.updateTimerDisplay();
                    this.saveAppState();

                    if (this.remainingSeconds <= 0) {
                        this.handleTimeUp();
                    }
                }, 1000);
            }
        }
        // Restore to grading mode
        else if (this.savedMode === 'gradingMode') {
            this.renderGradingForm();
            this.showMode('gradingMode');
        }
    }

    clearAppState() {
        localStorage.removeItem('cbt-app-state');
    }

    reset() {
        const confirm = window.confirm('新しいテストを作成します。現在のデータは削除されます。よろしいですか？');
        if (!confirm) return;

        this.config = null;
        this.answers = [];
        this.correctAnswers = [];
        this.remainingSeconds = 0;
        this.stopTimer();

        // Clear localStorage
        this.clearAppState();

        // Reset form
        document.getElementById('setupForm').reset();
        document.getElementById('noTimeLimit').checked = false;
        document.getElementById('timeLimit').disabled = false;
        this.updateChoiceNamesInput();

        this.showMode('setupMode');
        this.scrollToTop();
    }

    // ==========================================
    // Utility Functions
    // ==========================================
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ==========================================
// Initialize App
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    new CBTApp();
});
