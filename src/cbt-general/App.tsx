import { useState, useEffect, useRef } from 'react'
import { Footer } from '../components/Footer'

interface Config {
    questionCount: number
    choiceCount: number
    choiceNames: string[]
    timeLimit: number | null
}

type Mode = 'setup' | 'answer' | 'grading'

function App() {
    // State
    const [mode, setMode] = useState<Mode>('setup')
    const [config, setConfig] = useState<Config | null>(null)
    const [answers, setAnswers] = useState<(number | null)[]>([])
    const [correctAnswers, setCorrectAnswers] = useState<(number | null)[]>([])
    const [remainingSeconds, setRemainingSeconds] = useState(0)
    const [correctInputEnabled, setCorrectInputEnabled] = useState(false)
    const [showResults, setShowResults] = useState(false)

    // Form state
    const [questionCount, setQuestionCount] = useState(20)
    const [choiceCount, setChoiceCount] = useState(5)
    const [choiceLabels, setChoiceLabels] = useState('A, B, C, D, E')
    const [timeLimit, setTimeLimit] = useState(60)
    const [noTimeLimit, setNoTimeLimit] = useState(false)

    const timerIntervalRef = useRef<number | null>(null)

    // Auto-generate choice labels when choice count changes
    useEffect(() => {
        const autoNames: string[] = []
        for (let i = 0; i < choiceCount; i++) {
            autoNames.push(String.fromCharCode(65 + i))
        }
        setChoiceLabels(autoNames.join(', '))
    }, [choiceCount])

    // Timer effect
    useEffect(() => {
        if (mode === 'answer' && config?.timeLimit && remainingSeconds > 0) {
            timerIntervalRef.current = window.setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        handleTimeUp()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current)
                }
            }
        }
    }, [mode, remainingSeconds])

    // Load from localStorage on mount
    useEffect(() => {
        const savedConfig = localStorage.getItem('cbt-config')
        const savedState = localStorage.getItem('cbt-app-state')

        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig)
            setConfig(parsedConfig)
        }

        if (savedState) {
            const state = JSON.parse(savedState)
            setAnswers(state.answers || [])
            setCorrectAnswers(state.correctAnswers || [])
            setRemainingSeconds(state.remainingSeconds || 0)
            if (state.currentMode) {
                setMode(state.currentMode)
            }
        }
    }, [])

    // Save to localStorage when state changes
    useEffect(() => {
        if (config) {
            localStorage.setItem('cbt-config', JSON.stringify(config))
        }

        const state = {
            answers,
            correctAnswers,
            remainingSeconds,
            currentMode: mode,
            timestamp: Date.now()
        }
        localStorage.setItem('cbt-app-state', JSON.stringify(state))
    }, [config, answers, correctAnswers, remainingSeconds, mode])

    const handleSetupSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const names = choiceLabels.split(',').map(n => n.trim()).filter(n => n)

        if (names.length !== choiceCount) {
            alert(`You need ${choiceCount} choice names. Currently you have ${names.length}.`)
            return
        }

        const newConfig: Config = {
            questionCount,
            choiceCount,
            choiceNames: names,
            timeLimit: noTimeLimit ? null : timeLimit
        }

        setConfig(newConfig)
        setAnswers(new Array(questionCount).fill(null))
        setCorrectAnswers(new Array(questionCount).fill(null))
        setRemainingSeconds(noTimeLimit ? 0 : timeLimit * 60)
        setMode('answer')
    }

    const selectAnswer = (questionIndex: number, choiceIndex: number) => {
        const newAnswers = [...answers]
        newAnswers[questionIndex] = choiceIndex
        setAnswers(newAnswers)
    }

    const selectCorrectAnswer = (questionIndex: number, choiceIndex: number) => {
        const newCorrect = [...correctAnswers]
        newCorrect[questionIndex] = choiceIndex
        setCorrectAnswers(newCorrect)
    }

    const saveAnswers = () => {
        const unanswered = answers.filter(a => a === null).length
        if (unanswered > 0) {
            const confirmed = window.confirm(`${unanswered} questions unanswered. Proceed to grading?`)
            if (!confirmed) return
        }

        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
        }

        setMode('grading')
        setShowResults(false)
        setCorrectInputEnabled(false)
    }

    const handleTimeUp = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
        }
        alert("⏰ Time's up! Automatically moving to grading mode.")
        setMode('grading')
        setShowResults(false)
        setCorrectInputEnabled(false)
    }

    const calculateResults = () => {
        const unanswered = correctAnswers.filter(a => a === null).length
        if (unanswered > 0) {
            alert(`${unanswered} correct answers not entered. Please enter all correct answers.`)
            return
        }

        setShowResults(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const reset = () => {
        const confirmed = window.confirm('Create a new test? Current data will be deleted. Are you sure?')
        if (!confirmed) return

        setMode('setup')
        setConfig(null)
        setAnswers([])
        setCorrectAnswers([])
        setRemainingSeconds(0)
        setShowResults(false)
        setCorrectInputEnabled(false)
        localStorage.removeItem('cbt-app-state')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerClass = () => {
        if (remainingSeconds <= 60) return 'timer-danger'
        if (remainingSeconds <= 300) return 'timer-warning'
        return ''
    }

    const calculateScore = () => {
        if (!config) return { correct: 0, accuracy: 0 }

        let correct = 0
        for (let i = 0; i < config.questionCount; i++) {
            if (answers[i] === correctAnswers[i]) {
                correct++
            }
        }

        const accuracy = ((correct / config.questionCount) * 100).toFixed(1)
        return { correct, accuracy }
    }

    return (
        <div className="container">
            <header className="app-header">
                <h1 className="app-title">🎓 CBT Practice Answer Form</h1>
                <p className="app-subtitle">Multiple Choice Practice Tool</p>
            </header>

            {/* Setup Mode */}
            {mode === 'setup' && (
                <section className="mode-section active">
                    <div className="card">
                        <h2 className="section-title">📝 Test Setup</h2>
                        <form className="setup-form" onSubmit={handleSetupSubmit}>
                            <div className="form-group">
                                <label htmlFor="questionCount">Number of Questions</label>
                                <input
                                    type="number"
                                    id="questionCount"
                                    inputMode="numeric"
                                    min="1"
                                    max="200"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                    required
                                />
                                <span className="input-hint">1 to 200 questions</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="choiceCount">Number of Choices</label>
                                <input
                                    type="number"
                                    id="choiceCount"
                                    inputMode="numeric"
                                    min="2"
                                    max="10"
                                    value={choiceCount}
                                    onChange={(e) => setChoiceCount(parseInt(e.target.value))}
                                    required
                                />
                                <span className="input-hint">2 to 10 choices</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="choiceLabels">Choice Labels (comma separated)</label>
                                <input
                                    type="text"
                                    id="choiceLabels"
                                    placeholder="A, B, C, D, E"
                                    value={choiceLabels}
                                    onChange={(e) => setChoiceLabels(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                                <span className="input-hint">Example: A, B, C, D, E or 1, 2, 3, 4, 5</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="timeLimit">Time Limit (minutes)</label>
                                <div className="time-input-group">
                                    <input
                                        type="number"
                                        id="timeLimit"
                                        inputMode="numeric"
                                        min="0"
                                        max="300"
                                        value={timeLimit}
                                        onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                        disabled={noTimeLimit}
                                    />
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            id="noTimeLimit"
                                            checked={noTimeLimit}
                                            onChange={(e) => {
                                                setNoTimeLimit(e.target.checked)
                                                if (e.target.checked) {
                                                    setTimeLimit(0)
                                                }
                                            }}
                                        />
                                        <span>No limit</span>
                                    </label>
                                </div>
                                <span className="input-hint">0 for no limit, or check "No limit"</span>
                            </div>

                            <button type="submit" className="btn btn-primary btn-large">
                                <span className="btn-icon">🚀</span>
                                Create Answer Form
                            </button>
                        </form>
                    </div>
                </section>
            )}

            {/* Answer Mode */}
            {mode === 'answer' && config && (
                <section className="mode-section active">
                    <div className="mode-header">
                        <div className="mode-info">
                            <h2 className="section-title">✏️ Answer Input</h2>
                            <div className="progress-info">Total {config.questionCount} questions</div>
                        </div>
                        {config.timeLimit && (
                            <div className={`timer-display ${getTimerClass()}`}>
                                <div className="timer-label">Time Remaining</div>
                                <div className="timer-value">{formatTime(remainingSeconds)}</div>
                            </div>
                        )}
                    </div>

                    <div className="answer-grid">
                        {Array.from({ length: config.questionCount }).map((_, qIdx) => (
                            <div key={qIdx} className="question-card">
                                <div className="question-number">Question {qIdx + 1}</div>
                                <div className="choices">
                                    {config.choiceNames.map((name, cIdx) => (
                                        <button
                                            key={cIdx}
                                            type="button"
                                            className={`choice-btn ${answers[qIdx] === cIdx ? 'selected' : ''}`}
                                            onClick={() => selectAnswer(qIdx, cIdx)}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mode-actions">
                        <button className="btn btn-primary btn-large" onClick={saveAnswers}>
                            <span className="btn-icon">💾</span>
                            Save Answers and Grade
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                            setMode('setup')
                            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
                        }}>
                            <span className="btn-icon">⬅️</span>
                            Back to Setup
                        </button>
                    </div>
                </section>
            )}

            {/* Grading Mode */}
            {mode === 'grading' && config && (
                <section className="mode-section active">
                    <div className="mode-header">
                        <h2 className="section-title">📊 Grading</h2>
                        {showResults && (
                            <div className="score-display">
                                <div className="score-card">
                                    <div className="score-label">Correct Answers</div>
                                    <div className="score-value">{calculateScore().correct} / {config.questionCount}</div>
                                </div>
                                <div className="score-card">
                                    <div className="score-label">Accuracy Rate</div>
                                    <div className="score-value">{calculateScore().accuracy}%</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!correctInputEnabled && !showResults && (
                        <div className="grading-controls">
                            <button
                                type="button"
                                className="btn btn-secondary btn-large"
                                onClick={() => setCorrectInputEnabled(true)}
                            >
                                📝 Input Correct Answers
                            </button>
                        </div>
                    )}

                    <div className="answer-grid">
                        {Array.from({ length: config.questionCount }).map((_, qIdx) => {
                            const isCorrect = answers[qIdx] === correctAnswers[qIdx]
                            return (
                                <div
                                    key={qIdx}
                                    className={`question-card ${showResults ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                                >
                                    <div className="question-number">Question {qIdx + 1}</div>
                                    <div className="choices">
                                        {config.choiceNames.map((name, cIdx) => {
                                            let className = 'choice-btn'

                                            if (showResults) {
                                                if (cIdx === correctAnswers[qIdx]) {
                                                    className += ' correct-answer'
                                                }
                                                if (answers[qIdx] !== null && cIdx === answers[qIdx] && !isCorrect) {
                                                    className += ' wrong-answer'
                                                }
                                            } else {
                                                if (answers[qIdx] === cIdx) {
                                                    className += ' selected'
                                                }
                                                if (correctInputEnabled && correctAnswers[qIdx] === cIdx) {
                                                    className += ' correct-input'
                                                }
                                            }

                                            return (
                                                <button
                                                    key={cIdx}
                                                    type="button"
                                                    className={className}
                                                    onClick={() => {
                                                        if (correctInputEnabled && !showResults) {
                                                            selectCorrectAnswer(qIdx, cIdx)
                                                        }
                                                    }}
                                                    disabled={!correctInputEnabled || showResults}
                                                >
                                                    {name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mode-actions">
                        {correctInputEnabled && !showResults && (
                            <button
                                type="button"
                                className="btn btn-success btn-large"
                                onClick={calculateResults}
                            >
                                ✅ Show Grading Results
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary btn-large" onClick={reset}>
                            🔄 Create New Test
                        </button>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    )
}

export default App
