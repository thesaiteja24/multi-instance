import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
// For back-end languages
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp'; // C uses the cpp extension as it's similar
// For Web sub-languages
import { html as htmlExtension } from '@codemirror/lang-html';
import { css as cssExtension } from '@codemirror/lang-css';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import axios from 'axios';

// Back-end languages
const languages = {
  Python: {
    id: 71,
    snippet: 'print("Hello World!")',
    extension: python(),
  },
  JavaScript: {
    id: 63,
    snippet: 'console.log("Hello World!");',
    extension: javascript(),
  },
  Java: {
    id: 62,
    snippet: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World!");
  }
}`,
    extension: java(),
  },
  C: {
    id: 50, // Common language ID for C in online judges
    snippet: `#include <stdio.h>
int main() {
    printf("Hello World!\\n");
    return 0;
}`,
    extension: cpp(), // Using cpp extension as it supports C syntax
  },
};

const fileExtensions = {
  Python: 'py',
  JavaScript: 'js',
  Java: 'java',
  C: 'c',
};

const WEB_OPTION = 'Web';

const WEB_SUBLANGS = ['HTML', 'CSS', 'JS'];

function CodePlayground() {
  const [languageKey, setLanguageKey] = useState('Python');
  const [code, setCode] = useState(languages['Python'].snippet);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // ======= States for Web sub-languages =======
  const [webSubLang, setWebSubLang] = useState('HTML');
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Web Playground</title>
</head>
<body>
  <!-- Your HTML code here -->
</body>
</html>`);
  const [cssCode, setCssCode] = useState(`/* Your CSS code here */`);
  const [jsCode, setJsCode] = useState(`// Your JavaScript code here`);

  // ======= Panel resizing (left vs right) =======
  const [leftWidth, setLeftWidth] = useState(700);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // ======= Mobile layout if <600px =======
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build the main language list + "Web"
  const allLanguages = Object.keys(languages);
  allLanguages.unshift(WEB_OPTION);

  // CodeMirror extension for normal languages
  const currentExtension =
    languageKey in languages ? languages[languageKey].extension : null;

  // For Web sub-languages, pick an extension
  const getWebExtension = () => {
    switch (webSubLang) {
      case 'HTML':
        return htmlExtension();
      case 'CSS':
        return cssExtension();
      case 'JS':
        return javascript();
      default:
        return htmlExtension();
    }
  };

  // Get or set the code for web sub-languages
  const getWebCode = () => {
    switch (webSubLang) {
      case 'HTML':
        return htmlCode;
      case 'CSS':
        return cssCode;
      case 'JS':
        return jsCode;
      default:
        return htmlCode;
    }
  };
  const setWebCode = value => {
    switch (webSubLang) {
      case 'HTML':
        setHtmlCode(value);
        break;
      case 'CSS':
        setCssCode(value);
        break;
      case 'JS':
        setJsCode(value);
        break;
      default:
        break;
    }
  };

  // When main language changes
  const handleLanguageChange = e => {
    const newLang = e.target.value;
    setLanguageKey(newLang);
    setOutput('');
    // Reset to snippet if normal language
    if (newLang in languages) {
      setCode(languages[newLang].snippet);
    }
  };

  // Switch web sub-lang
  const handleWebSubLangChange = e => {
    setWebSubLang(e.target.value);
  };

  // Run code
  const handleRunCode = async () => {
    setLoading(true);
    setOutput('');

    if (languageKey === WEB_OPTION) {
      // Merge HTML/CSS/JS
      const mergedHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Web Playground</title>
<style>
${cssCode}
</style>
</head>
<body>
${htmlCode}
<script>
${jsCode}
</script>
</body>
</html>
`;
      setOutput(mergedHTML);
      setLoading(false);
      return;
    }

    // Normal language => call backend
    if (!(languageKey in languages)) {
      setLoading(false);
      return;
    }

    const payload = {
      source_code: code,
      language_id: languages[languageKey].id,
      input,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/runcode`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;
      setOutput(
        result.stderr ||
          result.compile_output ||
          result.stdout ||
          'No output received.'
      );
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset code
  const handleResetCode = () => {
    setOutput('');
    if (languageKey === WEB_OPTION) {
      setHtmlCode(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Web Playground</title>
</head>
<body>
  <!-- Your HTML code here -->
</body>
</html>`);
      setCssCode(`/* Your CSS code here */`);
      setJsCode(`// Your JavaScript code here`);
    } else if (languageKey in languages) {
      setCode(languages[languageKey].snippet);
    }
  };

  const handleDownloadFile = () => {
    if (languageKey === WEB_OPTION) {
      // Create HTML, CSS, and JS blobs
      const htmlBlob = new Blob([htmlCode], { type: 'text/html' });
      const cssBlob = new Blob([cssCode], { type: 'text/css' });
      const jsBlob = new Blob([jsCode], { type: 'application/javascript' });

      // Create object URLs for the blobs
      const htmlUrl = URL.createObjectURL(htmlBlob);
      const cssUrl = URL.createObjectURL(cssBlob);
      const jsUrl = URL.createObjectURL(jsBlob);

      // Create download links and trigger download for each file
      const htmlLink = document.createElement('a');
      htmlLink.href = htmlUrl;
      htmlLink.download = 'index.html';
      document.body.appendChild(htmlLink);
      htmlLink.click();
      document.body.removeChild(htmlLink);

      const cssLink = document.createElement('a');
      cssLink.href = cssUrl;
      cssLink.download = 'styles.css';
      document.body.appendChild(cssLink);
      cssLink.click();
      document.body.removeChild(cssLink);

      const jsLink = document.createElement('a');
      jsLink.href = jsUrl;
      jsLink.download = 'script.js';
      document.body.appendChild(jsLink);
      jsLink.click();
      document.body.removeChild(jsLink);

      // Clean up object URLs
      URL.revokeObjectURL(htmlUrl);
      URL.revokeObjectURL(cssUrl);
      URL.revokeObjectURL(jsUrl);
    } else {
      // For non-web languages, download as a single file as before
      const ext = fileExtensions[languageKey] || 'txt';
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${languageKey}_code.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Draggable divider
  const handleMouseDown = e => {
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = e => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let newLeftWidth = e.clientX - containerRect.left;

    // Enforce min/max widths so panels don’t collapse too far
    if (newLeftWidth < 200) newLeftWidth = 200;
    const maxLeftWidth = containerRect.width - 300;
    if (newLeftWidth > maxLeftWidth) newLeftWidth = maxLeftWidth;

    setLeftWidth(newLeftWidth);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Breakpoints for responsive preview
  const breakpoints = [
    { label: 'Extra Small (<576)', width: 360, height: 640 },
    { label: 'Small (≥576)', width: 576, height: 768 },
    { label: 'Medium (≥768)', width: 768, height: 1024 },
    { label: 'Large (≥992)', width: 992, height: 1366 },
    { label: 'Extra Large (≥1200)', width: 1200, height: 800 },
  ];

  // State for controlling the iFrame size
  const [previewWidth, setPreviewWidth] = useState(768);
  const [previewHeight, setPreviewHeight] = useState(1024);

  const handleBreakpointChange = e => {
    const [w, h] = e.target.value.split('x');
    setPreviewWidth(parseInt(w, 10));
    setPreviewHeight(parseInt(h, 10));
  };

  // ======= Styles =======
  const containerStyle = isMobile
    ? {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }
    : {
        display: 'flex',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      };

  const leftPanelStyle = isMobile
    ? {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid #444',
        overflowY: 'auto',
      }
    : {
        width: leftWidth,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #444',
        overflowY: 'auto',
        transition: 'width 0.1s ease-out',
        minHeight: '100vh',
      };

  const rightPanelStyle = isMobile
    ? {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      };

  // Outer divider
  const dividerStyle = {
    width: '8px',
    backgroundColor: '#222',
    cursor: 'col-resize',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 9999,
  };

  // Inner container for the lines
  const dividerHandleStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '4px',
  };

  // Each vertical line
  const dividerLineStyle = {
    width: '2px',
    height: '24px',
    backgroundColor: '#aaa',
    borderRadius: '1px',
  };

  const topBarStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#2f2f2f',
    borderBottom: '1px solid #444',
  };

  const editorWrapperStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const bottomBarStyle = {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#2f2f2f',
    borderTop: '1px solid #444',
  };

  const panelSectionStyle = {
    flex: 1,
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
  };

  const splitBorderStyle = {
    borderBottom: '1px solid #444',
  };

  const textAreaStyle = {
    flex: 1,
    width: '100%',
    resize: 'none',
    marginTop: '8px',
    backgroundColor: '#2f2f2f',
    color: '#ffffff',
    border: '1px solid #444',
    padding: '8px',
  };

  return (
    <div
      style={containerStyle}
      ref={containerRef}
      className="p-4 rounded-md shadow-md m-4 mt-10"
    >
      <Splitter>
        <SplitterPanel style={leftPanelStyle} className="no-scrollbar">
          <div style={leftPanelStyle}>
            {/* Top Bar */}
            <div style={topBarStyle}>
              {/* Main Language Dropdown */}
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                <label>Language:</label>
                <select
                  value={languageKey}
                  onChange={handleLanguageChange}
                  style={{
                    backgroundColor: '#444',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  {allLanguages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* If "Web," show sub-lan dropdown for HTML/CSS/JS */}
              {languageKey === WEB_OPTION && (
                <div
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <label>Web Sub-Language:</label>
                  <select
                    value={webSubLang}
                    onChange={handleWebSubLangChange}
                    style={{
                      backgroundColor: '#444',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {WEB_SUBLANGS.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleRunCode}
                  disabled={loading}
                  style={{
                    backgroundColor: '#0066cc',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Running...' : 'Run Code'}
                </button>
                {/* <button
                  onClick={handleSaveFile}
                  style={{
                    backgroundColor: "#444",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  Save Code
                </button> */}
                <button
                  onClick={handleDownloadFile}
                  style={{
                    backgroundColor: '#444',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  Download Code
                </button>
              </div>
            </div>

            {/* Editor area */}
            <div style={editorWrapperStyle}>
              <CodeMirror
                value={languageKey === WEB_OPTION ? getWebCode() : code}
                theme={oneDark}
                extensions={
                  languageKey === WEB_OPTION
                    ? [getWebExtension()]
                    : currentExtension
                      ? [currentExtension]
                      : []
                }
                style={{ flex: 1 }}
                onChange={val => {
                  if (languageKey === WEB_OPTION) {
                    setWebCode(val);
                  } else {
                    setCode(val);
                  }
                }}
              />
            </div>

            {/* Bottom Bar */}
            <div style={bottomBarStyle}>
              <button
                onClick={handleResetCode}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                Reset Code
              </button>
            </div>
          </div>
        </SplitterPanel>
      </Splitter>

      {/* Divider (not on mobile) */}
      {!isMobile && (
        <div style={dividerStyle} onMouseDown={handleMouseDown}>
          <div style={dividerHandleStyle}>
            <div style={dividerLineStyle}></div>
            <div style={dividerLineStyle}></div>
            <div style={dividerLineStyle}></div>
          </div>
        </div>
      )}

      {/* Right Panel */}
      <Splitter
        style={rightPanelStyle}
        className="overflow-y-auto no-scrollbar"
      >
        <SplitterPanel>
          <div style={rightPanelStyle}>
            {languageKey === WEB_OPTION ? (
              // Web => show iframe
              <div
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#1e1e1e',
                  overflow: 'auto',
                }}
              >
                <h3 style={{ margin: 0 }}>Live Preview</h3>

                {/* Responsive preview settings */}
                <div style={{ margin: '8px 0' }}>
                  <label>Breakpoint Presets: </label>
                  <select
                    onChange={handleBreakpointChange}
                    style={{
                      backgroundColor: '#444',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      marginRight: '16px',
                    }}
                  >
                    <option value="">--Select--</option>
                    {breakpoints.map(bp => (
                      <option key={bp.label} value={`${bp.width}x${bp.height}`}>
                        {bp.label} ({bp.width}x{bp.height})
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <label>Width: {previewWidth}px</label>
                    <input
                      type="range"
                      min="320"
                      max="1920"
                      step="10"
                      value={previewWidth}
                      onChange={e =>
                        setPreviewWidth(parseInt(e.target.value, 10))
                      }
                      style={{ cursor: 'pointer' }}
                    />
                    <label>Height: {previewHeight}px</label>
                    <input
                      type="range"
                      min="320"
                      max="1200"
                      step="10"
                      value={previewHeight}
                      onChange={e =>
                        setPreviewHeight(parseInt(e.target.value, 10))
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <iframe
                  style={{
                    width: previewWidth + 'px',
                    height: previewHeight + 'px',
                    backgroundColor: '#fff',
                    border: '1px solid #444',
                    marginTop: '8px',
                  }}
                  srcDoc={output}
                  title="Web Preview"
                />
              </div>
            ) : (
              // Normal => input/output
              <>
                <div style={{ ...panelSectionStyle, ...splitBorderStyle }}>
                  <h3>INPUT</h3>
                  <textarea
                    style={textAreaStyle}
                    placeholder="Type custom input here..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                  />
                </div>
                <div style={panelSectionStyle}>
                  <h3>OUTPUT</h3>
                  <textarea style={textAreaStyle} value={output} readOnly />
                </div>
              </>
            )}
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
  );
}

export default CodePlayground;
