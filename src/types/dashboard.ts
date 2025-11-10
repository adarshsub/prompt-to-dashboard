export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  config?: {
    title?: string;
    [key: string]: any;
  };
}

export interface Insight {
  text: string;
  id: string;
}

export interface N8NResponse {
  charts?: ChartData[];
  insights?: Insight[];
  question?: string;
}
