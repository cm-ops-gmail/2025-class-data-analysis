export type ClassEntry = {
  id: string;
  date: string;
  scheduledTime: string;
  entryTime: string;
  slideQAC: string;
  classStartTime: string;
  productType: string;
  course: string;
  subject: string;
  teacher: string;
  teacher1Gmail: string;
  teacher2: string;
  teacher2Gmail: string;
  teacher3: string;
  teacher3Gmail: string;
  totalDuration: string;
  highestAttendance: string;
  averageAttendance: string;
  totalComments: string;
  issuesType: string;
  issuesDetails: string;
  slideCommunication: string;
  liveClassIssues: string;
  otherTechnicalIssues: string;
  satisfaction: string;
  // Deprecated fields that might still be in old data, keep for compatibility if needed
  // but they are not in the new sheet
  teacher1?: string; 
  totalDurationMinutes?: string;
};
