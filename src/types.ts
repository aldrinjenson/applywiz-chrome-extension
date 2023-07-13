export interface Message {
  action: string;
  data?: any;
}

export type jobObjectType = {
  jobName: string;
  jobUrl: string;
  companyName: string;
  companyImg: string;
  companyLocation: string;
  status?: 'success' | 'failed';
};
