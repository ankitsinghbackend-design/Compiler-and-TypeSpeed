import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronDown, Code2 } from 'lucide-react';

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

const Compiler = () => {
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
            const response = await axios.post('http://localhost:5001/api/compiler/run', {
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
        <div className="flex flex-col h-screen md:flex-row bg-[#1e1e1e]">
            {/* Editor Section */}
            <div className="flex flex-col flex-1 p-4 border-b border-gray-700 md:border-b-0 md:border-r">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Code2 className="text-blue-500" />
                        <h1 className="text-xl font-bold text-white hidden sm:block">Code Editor</h1>
                    </div>
                    
                    <div className="flex space-x-3 items-center">
                        {/* Custom Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-48 px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none hover:bg-gray-700 transition"
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

                        <button
                            onClick={handleRunCode}
                            disabled={isCompiling}
                            className={`px-5 py-2 text-sm font-semibold tracking-wide text-white transition rounded-md shadow-sm ${
                                isCompiling
                                    ? 'bg-blue-500/50 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                            }`}
                        >
                            {isCompiling ? 'Running...' : 'Run Code'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden border border-gray-700 rounded-md bg-[#1e1e1e]">
                    <Editor
                        height="100%"
                        language={getMonacoLanguage(language)}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            padding: { top: 16 }
                        }}
                    />
                </div>
            </div>

            {/* Input / Output Section */}
            <div className="flex flex-col w-full p-4 md:w-1/3 min-h-[300px]">
                {/* Standard Input */}
                <div className="flex flex-col flex-1 mb-4 h-1/2">
                    <h2 className="mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Input (stdin)</h2>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-3 text-sm text-gray-200 bg-[#0d0d0d] border border-gray-700 rounded-md resize-none focus:outline-none focus:border-blue-500 transition font-mono shadow-inner"
                        placeholder="Enter standard input here..."
                    />
                </div>

                {/* Standard Output */}
                <div className="flex flex-col flex-1 h-1/2">
                    <h2 className="mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">Output</h2>
                    <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-200 bg-[#0d0d0d] border border-gray-700 rounded-md whitespace-pre-wrap font-mono relative shadow-inner">
                        {output ? output : <span className="text-gray-600 select-none">Output will appear here...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compiler;
