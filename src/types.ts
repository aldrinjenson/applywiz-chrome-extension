export interface Message {
  action: string;
  data?: any;
}

export type jobObjectType = {
  jobName: string;
  jobUrl: string;
  companyName: string;
  companyImg?: string;
  companyLocation: string;
  base64Img?: string;
  status?: 'success' | 'failed';
  reason?: string;
  progress?: number;
};
