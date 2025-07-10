import { callAiFunction } from './aiClient';

export async function testAiFunction(prompt: string) {
  try {
    const response = await callAiFunction({
      prompt,
      model: 'gpt-4',
      temperature: 0.7
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      console.log('Received chunk:', chunk);
    }

    return 'Test completed successfully';
  } catch (error) {
    console.error('Test failed:', error);
    if (error instanceof Error) {
      return `Test failed: ${error.message}`;
    }
    return `Test failed: An unknown error occurred.`;
  }
} 