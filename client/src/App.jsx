import { useState, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import ReviewPanel from './components/ReviewPanel';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReview = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);

    try {
      const response = await fetch(`${API_URL}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get review');
      }

      setReview(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  const handleClear = useCallback(() => {
    setCode('');
    setReview(null);
    setError(null);
  }, []);

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="editor-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="icon" aria-hidden="true">&lt;/&gt;</span>
              Your Code
            </h2>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            placeholder="Paste your code here for review..."
          />

          <div className="action-bar">
            <button
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading || !code}
              type="button"
            >
              Clear
            </button>

            <button
              className="btn btn-primary"
              onClick={handleReview}
              disabled={loading || !code.trim()}
              type="button"
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  Analyzing...
                </>
              ) : (
                'Review Code'
              )}
            </button>
          </div>
        </div>

        <div className="review-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="icon" aria-hidden="true">AI</span>
              Review Results
            </h2>
            {review?.usage && (
              <span className="token-badge">
                {review.usage.totalTokens} tokens
              </span>
            )}
          </div>

          <ReviewPanel
            review={review?.review}
            loading={loading}
            error={error}
          />
        </div>
      </main>

      <footer className="footer">
        <p>
          Powered by <span className="highlight">AWS Bedrock</span> + <span className="highlight">Claude</span> |
          Built with <span className="highlight">React</span> + <span className="highlight">Express</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
