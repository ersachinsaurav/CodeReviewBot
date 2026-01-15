import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ReviewPanel.css';

// Memoized code block component for better performance
const CodeBlock = memo(function CodeBlock({ language, children }) {
  return (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={language}
      PreTag="div"
      customStyle={{
        margin: '16px 0',
        borderRadius: '12px',
        fontSize: '0.85rem',
      }}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
});

function ReviewPanel({ review, loading, error }) {
  if (error) {
    return (
      <div className="review-panel review-panel-error" role="alert">
        <div className="error-content">
          <span className="error-icon" aria-hidden="true">!</span>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="review-panel review-panel-loading" aria-busy="true" aria-live="polite">
        <div className="loading-content">
          <div className="loading-animation" aria-hidden="true">
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
          </div>
          <p className="loading-text">Analyzing your code...</p>
          <p className="loading-subtext">Reviewing patterns, style, and logic</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="review-panel review-panel-empty">
        <div className="empty-content">
          <div className="empty-icon" aria-hidden="true">&lt;/&gt;</div>
          <h3>Ready to Review</h3>
          <p>Paste your code on the left and click "Review Code" to get AI-powered feedback</p>
          <ul className="feature-list">
            <li>Code style improvements</li>
            <li>Bug detection</li>
            <li>Performance suggestions</li>
            <li>Readability enhancements</li>
          </ul>
        </div>
      </div>
    );
  }

  // Memoize markdown components to prevent re-creation on each render
  const markdownComponents = useMemo(() => ({
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <CodeBlock language={match[1]}>{children}</CodeBlock>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="review-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="review-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="review-h3">{children}</h3>,
    ul: ({ children }) => <ul className="review-ul">{children}</ul>,
    ol: ({ children }) => <ol className="review-ol">{children}</ol>,
    li: ({ children }) => <li className="review-li">{children}</li>,
    p: ({ children }) => <p className="review-p">{children}</p>,
    strong: ({ children }) => <strong className="review-strong">{children}</strong>,
  }), []);

  return (
    <div className="review-panel review-panel-content animate-fade-in" aria-live="polite">
      <ReactMarkdown components={markdownComponents}>
        {review}
      </ReactMarkdown>
    </div>
  );
}

export default memo(ReviewPanel);
