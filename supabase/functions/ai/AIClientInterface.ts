// agent mode is working
export interface AIClientInterface {
    generate(prompt: string, timeout?: number): Promise<AIResponse>;
  }
  
  export interface AIResponse {
    text: string;
    modelVersion?: string;
    responseId?: string;
    usageMetadata?: any;
  }