import { useRef, useEffect, useCallback, useMemo, memo } from 'react';
import './CodeEditor.css';

function CodeEditor({ value, onChange, language, placeholder }) {
  const textareaRef = useRef(null);

  // Handle tab key for indentation - memoized to prevent recreation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const currentValue = e.target.value;
      const newValue = currentValue.substring(0, start) + '  ' + currentValue.substring(end);
      onChange(newValue);

      // Set cursor position after the inserted tab
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      });
    }
  }, [onChange]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(400, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  // Memoize line numbers to prevent recalculation on every render
  const lineNumbers = useMemo(() => {
    const lines = value.split('\n');
    return lines.length > 0 ? lines.map((_, i) => (
      <span key={i} className="line-number">{i + 1}</span>
    )) : <span className="line-number">1</span>;
  }, [value]);

  // Memoized change handler
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="code-editor">
      <div className="editor-header">
        <div className="window-controls">
          <span className="control control-close"></span>
          <span className="control control-minimize"></span>
          <span className="control control-maximize"></span>
        </div>
        <span className="editor-language">{language}</span>
      </div>

      <div className="editor-body">
        <div className="line-numbers">
          {lineNumbers}
        </div>

        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
}

export default memo(CodeEditor);
