export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  config?: any;
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
