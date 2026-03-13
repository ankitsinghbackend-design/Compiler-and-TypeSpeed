import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronDown, Code2, ArrowLeft } from 'lucide-react';

const languageOptions = [
    { value: 'javascript', label: 'JavaScript', icon: <i className="devicon-javascript-plain text-yellow-400"></i> },
    { value: 'typescript', label: 'TypeScript', icon: <i className="devicon-typescript-plain text-blue-500"></i> },
    { value: 'python', label: 'Python', icon: <i className="devicon-python-plain text-blue-400"></i> },
    { value: 'c', label: 'C', icon: <i className="devicon-c-plain text-blue-600"></i> },
    { value: 'cpp', label: 'C++', icon: <i className="devicon-cplusplus-plain text-blue-600"></i> },
    { value: 'java', label: 'Java', icon: <i className="devicon-java-plain text-red-500"></i> },
    { value: 'csharp', label: 'C#', icon: <i className="devicon-csharp-plain text-purple-500"></i> },
    { value: 'fsharp', label: 'F#', icon: <i className="devicon-fsharp-plain text-blue-500"></i> },
    { value: 'go', label: 'Go', icon: <i className="devicon-go-original-wordmark text-cyan-500"></i> },
    { value: 'rust', label: 'Rust', icon: <i className="devicon-rust-plain text-orange-500"></i> },
    { value: 'php', label: 'PHP', icon: <i className="devicon-php-plain text-indigo-400"></i> },
    { value: 'ruby', label: 'Ruby', icon: <i className="devicon-ruby-plain text-red-600"></i> },
    { value: 'haskell', label: 'Haskell', icon: <i className="devicon-haskell-plain text-purple-600"></i> }
];

const defaultCode = {
    javascript: 'console.log("Hello, World!");',
    typescript: 'const message: string = "Hello, World!";\nconsole.log(message);',
    python: 'print("Hello, World!")',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    fsharp: 'printfn "Hello, World!"',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    rust: 'fn main() {\n    println!("Hello, World!");\n}',
    php: '<?php\n\necho "Hello, World!\\n";\n?>',
    ruby: 'puts "Hello, World!"',
    haskell: 'main :: IO ()\nmain = putStrLn "Hello, World!"'
};

// Reusable ad placeholder
const AdPlaceholder = ({ height = 'h-20', label = 'Advertisement' }) => (
    <div className={`w-full ${height} flex flex-col items-center justify-center bg-gray-800/50 border border-dashed border-gray-600 rounded-lg`}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">AD</span>
        <span className="text-[9px] text-gray-600 tracking-wide">{label}</span>
    </div>
);

const Compiler = () => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(defaultCode['javascript']);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isCompiling, setIsCompiling] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageSelect = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        setCode(defaultCode[selectedLanguage] || '');
        setIsDropdownOpen(false);
    };

    const handleRunCode = async () => {
        setIsCompiling(true);
        setOutput('');

        const toastId = toast.loading('Compiling and executing...');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/compiler/run`, {
                language,
                code,
                input
            });

            if (response.data.success) {
                setOutput(response.data.output);
                toast.success('Execution successful!', { id: toastId });
            } else {
                setOutput(response.data.message || 'Execution failed');
                toast.error('Execution failed', { id: toastId });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            setOutput(`Error: ${errorMsg}`);
            toast.error('Execution error', { id: toastId });
        } finally {
            setIsCompiling(false);
        }
    };

    const selectedOption = languageOptions.find(opt => opt.value === language) || languageOptions[0];

    // Map Monaco mapped languages
    const getMonacoLanguage = (lang) => {
        if (lang === 'c' || lang === 'cpp') return 'cpp';
        if (lang === 'csharp') return 'csharp';
        if (lang === 'fsharp') return 'fsharp';
        if (lang === 'ruby') return 'ruby';
        return lang;
    };

    return (
        <div className="compiler-page">
            <style>{`
                .compiler-page {
                    display: flex;
                    flex-direction: row;
                    height: 100vh;
                    background: #1e1e1e;
                }

                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: #1f2937; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 20px; }

                .editor-section {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    padding: 16px;
                    border-right: 1px solid #374151;
                    min-width: 0;
                }

                .toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    gap: 8px;
                }

                .toolbar-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-left: auto;
                }

                .lang-dropdown-btn {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 192px;
                    padding: 8px 12px;
                    font-size: 14px;
                    color: white;
                    background: #1f2937;
                    border: 1px solid #4b5563;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 200ms;
                }
                .lang-dropdown-btn:hover { background: #374151; }

                .run-btn {
                    padding: 8px 20px;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.025em;
                    color: white;
                    background: #2563eb;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 200ms, transform 100ms;
                    white-space: nowrap;
                }
                .run-btn:hover { background: #3b82f6; }
                .run-btn:active { transform: scale(0.95); }
                .run-btn:disabled { background: rgba(59,130,246,0.5); cursor: not-allowed; }

                .editor-container {
                    flex: 1;
                    overflow: hidden;
                    border: 1px solid #374151;
                    border-radius: 6px;
                    background: #1e1e1e;
                }

                .io-section {
                    display: flex;
                    flex-direction: column;
                    width: 33.333%;
                    padding: 16px;
                    min-height: 300px;
                }

                .io-section textarea {
                    flex: 1;
                    padding: 12px;
                    font-size: 14px;
                    font-family: monospace;
                    color: #e5e7eb;
                    background: #0d0d0d;
                    border: 1px solid #374151;
                    border-radius: 6px;
                    resize: none;
                    outline: none;
                    transition: border-color 200ms;
                }
                .io-section textarea:focus { border-color: #3b82f6; }

                .io-output {
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
                    font-size: 14px;
                    font-family: monospace;
                    color: #e5e7eb;
                    background: #0d0d0d;
                    border: 1px solid #374151;
                    border-radius: 6px;
                    white-space: pre-wrap;
                }

                /* ==================== MOBILE / ANDROID RESPONSIVE ==================== */
                @media (max-width: 768px) {
                    .compiler-page {
                        flex-direction: column;
                        height: 100vh;
                        overflow: hidden;
                    }

                    .editor-section {
                        border-right: none;
                        border-bottom: 1px solid #374151;
                        padding: 10px;
                        height: 50vh;
                        flex: none;
                    }

                    .toolbar {
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .toolbar-controls {
                        width: 100%;
                        justify-content: space-between;
                        margin-left: 0;
                    }

                    .lang-dropdown-btn {
                        flex: 1;
                        min-width: 0;
                        width: auto;
                        padding: 10px 12px;
                        font-size: 16px;
                    }

                    .run-btn {
                        padding: 12px 16px;
                        flex-shrink: 0;
                        font-size: 16px;
                    }

                    .io-section {
                        width: 100%;
                        flex: 1;
                        padding: 10px;
                        overflow: hidden;
                    }

                    .io-section textarea, .io-output {
                        font-size: 16px;
                    }

                    .ad-strip-mobile { display: none; }
                }

                @media (max-width: 480px) {
                    .toolbar-controls {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .lang-dropdown-btn {
                        width: 100%;
                    }

                    .run-btn {
                        width: 100%;
                        text-align: center;
                        padding: 12px;
                        font-size: 16px;
                    }
                }
            `}</style>

            {/* Editor Section */}
            <div className="editor-section">
                <div className="toolbar">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-2 py-1"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-semibold tracking-wide">BACK</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <Code2 className="text-blue-500" />
                        <h1 className="text-xl font-bold text-white hidden sm:block">Code Editor</h1>
                    </div>

                    <div className="toolbar-controls">
                        {/* Language Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="lang-dropdown-btn"
                            >
                                <div className="flex items-center space-x-2">
                                    {selectedOption.icon}
                                    <span>{selectedOption.label}</span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-10 w-48 mt-1 overflow-auto max-h-60 bg-gray-800 border border-gray-600 rounded-md shadow-lg scrollbar-thin scrollbar-thumb-gray-600">
                                    {languageOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleLanguageSelect(option.value)}
                                            className={`flex items-center w-full px-3 py-2.5 text-sm text-left transition hover:bg-gray-700 ${
                                                language === option.value ? 'bg-gray-700 text-white' : 'text-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">{option.icon}</span>
                                                <span>{option.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Run Code Button */}
                        <button
                            onClick={handleRunCode}
                            disabled={isCompiling}
                            className="run-btn"
                        >
                            {isCompiling ? 'Running...' : '▶ Run Code'}
                        </button>
                    </div>
                </div>

                <div className="editor-container">
                    <Editor
                        height="100%"
                        language={getMonacoLanguage(language)}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: window.innerWidth < 768 ? 16 : 14,
                            wordWrap: 'on',
                            padding: { top: 16 }
                        }}
                    />
                </div>
                {/* Ad strip below editor — hidden on mobile */}
                <div className="mt-3 ad-strip-mobile">
                    <AdPlaceholder height="h-12" label="728×90 Leaderboard" />
                </div>
            </div>

            {/* Input / Output Section */}
            <div className="io-section">
                {/* Standard Input */}
                <div className="flex flex-col flex-1 mb-4">
                    <h2 className="mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Input (stdin)</h2>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter standard input here..."
                    />
                </div>

                {/* Standard Output */}
                <div className="flex flex-col flex-1">
                    <h2 className="mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Output</h2>
                    <div className="io-output">
                        {output ? output : <span className="text-gray-600 select-none">Output will appear here...</span>}
                    </div>
                </div>

                {/* Ad below output */}
                <div className="mt-3 ad-strip-mobile">
                    <AdPlaceholder height="h-20" label="300×250 Rectangle" />
                </div>
            </div>
        </div>
    );
};

export default Compiler;
