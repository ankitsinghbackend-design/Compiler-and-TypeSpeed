import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Compiler = () => {
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('console.log("Hello, World!");');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isCompiling, setIsCompiling] = useState(false);

    const languageOptions = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' },
        { value: 'c', label: 'C' }
    ];

    const defaultCode = {
        javascript: 'console.log("Hello, World!");',
        python: 'print("Hello, World!")',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
        java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
    };

    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;
        setLanguage(selectedLanguage);
        setCode(defaultCode[selectedLanguage] || '');
    };

    const handleRunCode = async () => {
        setIsCompiling(true);
        setOutput('');

        // Create a toast notification
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

    return (
        <div className="flex flex-col h-screen md:flex-row bg-[#1e1e1e]">
            {/* Editor Section */}
            <div className="flex flex-col flex-1 p-4 border-b border-gray-700 md:border-b-0 md:border-r">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-white">Code Editor</h1>
                    <div className="flex space-x-2">
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {languageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleRunCode}
                            disabled={isCompiling}
                            className={`px-4 py-2 font-semibold text-white transition rounded-md ${isCompiling
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isCompiling ? 'Running...' : 'Run Code'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden border border-gray-700 rounded-md">
                    <Editor
                        height="100%"
                        language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on'
                        }}
                    />
                </div>
            </div>

            {/* Input / Output Section */}
            <div className="flex flex-col w-full p-4 md:w-1/3 min-h-[300px]">
                {/* Standard Input */}
                <div className="flex flex-col flex-1 mb-4">
                    <h2 className="mb-2 text-lg font-semibold text-gray-300">Input (stdin)</h2>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-3 text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Enter standard input here..."
                    />
                </div>

                {/* Standard Output */}
                <div className="flex flex-col flex-1">
                    <h2 className="mb-2 text-lg font-semibold text-gray-300">Output</h2>
                    <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-200 bg-black border border-gray-700 rounded-md whitespace-pre-wrap font-mono relative">
                        {output ? output : <span className="text-gray-500">Output will appear here...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compiler;
