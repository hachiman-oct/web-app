import { useState, useEffect } from 'react'
import { Footer } from '../components/Footer'

function App() {
    const [textContent, setTextContent] = useState('')
    const [title, setTitle] = useState('')
    const [format, setFormat] = useState('txt')
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const savedText = localStorage.getItem('textContent')
        const savedTitle = localStorage.getItem('title')
        const savedFormat = localStorage.getItem('format')

        if (savedText) setTextContent(savedText)
        if (savedTitle) setTitle(savedTitle)
        if (savedFormat) setFormat(savedFormat)
    }, [])

    // Save to localStorage when values change
    useEffect(() => {
        localStorage.setItem('textContent', textContent)
    }, [textContent])

    useEffect(() => {
        localStorage.setItem('title', title)
    }, [title])

    useEffect(() => {
        localStorage.setItem('format', format)
    }, [format])

    const generateFilename = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        return `text-${timestamp}`
    }

    const handleSave = () => {
        if (!textContent.trim()) {
            alert('Please enter some text before saving.')
            return
        }

        const finalFilename = title.trim() || generateFilename()
        const blob = new Blob([textContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${finalFilename}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleReset = () => {
        if (!textContent.trim() || window.confirm('Reset all fields?')) {
            setTextContent('')
            setTitle('')
            setFormat('txt')
        }
    }

    return (
        <div className="container">
            <header className="header">
                <button
                    className="hamburger-btn"
                    onClick={() => setIsSideMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <span className="hamburger-icon">☰</span>
                </button>
                <h1 className="app-title">📝 Text Saver</h1>
                <p className="app-subtitle">Save text to file</p>
            </header>

            {/* Side Panel Overlay */}
            {isSideMenuOpen && (
                <div
                    className="side-panel-overlay"
                    onClick={() => setIsSideMenuOpen(false)}
                />
            )}

            {/* Side Panel */}
            <div className={`side-panel ${isSideMenuOpen ? 'open' : ''}`}>
                <div className="side-panel-header">
                    <h2 className="side-panel-title">Menu</h2>
                    <button
                        className="close-btn"
                        onClick={() => setIsSideMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>
                <div className="side-panel-content">
                    <Footer />
                </div>
            </div>

            <main className="main-content">
                <div className="input-group">
                    <label htmlFor="titleInput" className="input-label">
                        Title (Optional)
                    </label>
                    <input
                        type="text"
                        id="titleInput"
                        className="title-input"
                        placeholder="Title (Optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className="input-group flex-grow">
                    <label htmlFor="contentInput" className="input-label">
                        Content
                    </label>
                    <textarea
                        id="contentInput"
                        className="content-input"
                        placeholder="Enter your text here..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">File Format</label>
                    <div className="format-buttons">
                        <button
                            className={`format-btn ${format === 'txt' ? 'active' : ''}`}
                            onClick={() => setFormat('txt')}
                        >
                            <span className="format-icon">📄</span>
                            <span className="format-text">.txt</span>
                        </button>
                        <button
                            className={`format-btn ${format === 'md' ? 'active' : ''}`}
                            onClick={() => setFormat('md')}
                        >
                            <span className="format-icon">📝</span>
                            <span className="format-text">.md</span>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <button className="btn btn-reset" onClick={handleReset}>
                    <span className="btn-icon">🗑️</span>
                    <span className="btn-text">Reset</span>
                </button>
                <button className="btn btn-save" onClick={handleSave}>
                    <span className="btn-icon">💾</span>
                    <span className="btn-text">Save File</span>
                </button>
            </footer>
        </div>
    )
}

export default App
