import { memo, useCallback } from 'react';
import './LanguageSelector.css';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'shell', label: 'Shell/Bash' },
  { value: 'other', label: 'Other' },
];

function LanguageSelector({ value, onChange }) {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="language-selector">
      <label htmlFor="language" className="selector-label">
        Language:
      </label>
      <select
        id="language"
        value={value}
        onChange={handleChange}
        className="selector-input"
        aria-describedby="language-hint"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
      <span id="language-hint" className="visually-hidden">
        Select the programming language of your code for better analysis
      </span>
    </div>
  );
}

export default memo(LanguageSelector);
