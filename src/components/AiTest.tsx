import { useState } from 'react';
import { Button } from './ui/button';
import { testAiFunction } from '../utils/testAiFunction';

export function AiTest() {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult('Testing...');
    
    try {
      const response = await testAiFunction('Say hello!');
      setResult(response);
    } catch (error) {
      if (error instanceof Error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult(`An unknown error occurred: ${String(error)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">AI Function Test</h1>
      <Button 
        onClick={handleTest}
        disabled={isLoading}
      >
        {isLoading ? 'Testing...' : 'Run Test'}
      </Button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {result}
        </pre>
      )}
    </div>
  );
} 