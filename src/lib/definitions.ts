import "server-only";
import { google } from "googleapis";
import { SheetRow } from "./types";
import { analyzeSheetRow, AnalyzeSheetRowInput } from "@/ai/flows/analyze-sheet-row";

const SERVICE_ACCOUNT_CREDENTIALS = {
  type: "service_account",
  project_id: "pelagic-range-466218-p1",
  private_key_id: "a94c2fbe1cdbbf8d303ba73de4a833b224ca626d",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCk38vIK+mRrLC6\nQNflraVEmv6ufxIzswb6RQZgAX4QFEP3Rlj+4oPMwjIdLHPXLRsKv9TfycjwJTfk\nYMsHK29Md5BnJ1Q1TNe5muh4bWZRAHW3zHOlAMYyewlU/aczGRBvc6k1gax4hzDB\nXpi8YnQEdfhwFsbBIH1CqxhoHzkEK73He2TpS/kzNBhtiK6Rtjmx2taH9wCTkYc9\nXvtE9/ZD6FxwargD80vPz8tn7WroyTXJKx0+rMf7OCnqgKgtKd0u3IRdXyffs2Iu\noCMoZB7HBm42bZ3WcyQlOuyC48MawnafvF3Z7lvGCADVq8isyplvkaDFRkCIP0FS\nOYstZveVAgMBAAECggEAESYH24+ZsSGtlgnFiumXPX4DjGHCImd2C9TfF2BAXOrG\nsPL7sbMcs1DlhnxHpjNWUzVlrkseH8A3QoVAyMOfRWxQNDJ2gz61V2RB1rjGQhmS\npOXah2h/tONwMotZdyqdt4HnsR2GM1kYXJx6tWlmGMquZvYvgQngjW0fUkEhHIpH\nNkCzFbUmV4Aq/t/MnqQ7ya3VUAO8DNIpBpLJ78F3Ryc6E6L7FTU/KiVYT7h+rTRy\ztZEhlN4//5FZoXPTpwwvVgTLq33e8UJOQjV6UVV465eF0tY21TZcO9uxdA6buoT\nXhMH4b83jSpOx/l0RdvPPvskpqdmFc3f3aBD27MUQQKBgQDix73F1seQfeEoBmjY\ndK94/hCQinRsHOqB0K+9g2dD1w+Ljthl8EPImi29upZ+ti4dza+PfgAWGQZ0tSLz\npO6OhFP+0b74Hw2uyNliytYJKlgcXXueXMtndd3cKOWXd/0AWSFfXXDL/7m4h17B\nCrZxD/Sfwzs0dkbZAMGgVq5OdQKBgQC6HhumFHrnz4mjsXlZ5jzfnTbnfIqO4mR6\nU8+J+WVRkF/qLiCOMmTbK2YPNuU51knls/kqK2iczBUTUAXZeK8BBJlwisZuXj//\n5XbfO4BVOy0UXMAK+roqscWXznj4Fb+ciidSzsWVKxeoy5Qh94PwYq2i4bSkCFuH\nrWtRYvUgoQKBgCcAYRPQP1wLOhjPGWL4lmEBmMmy9hjN1ErlIARAwBa7utGujGrj\nqlSqp2k02MMMA9xeTm4oJk2mmiSiLlOmrtxVx7hQTD6R4KGJq1FBPxQucx7VuPfg\nT58Id1JwuiOVoC5aJdIn2MlMvp0MsvASLpQ9QT3krp70JHUXmzU/ExUtAoGBALMG\nCPRcmMhnse555M9bjsxNTiWmfyTnkVy1R1lhQlsNc6UvT3NX9/l1qksSM7XJcPV5\ngz9T1+GS0Obtv2KrGjLxeKJvamV5VThRQWGCu3PAYyFGAhfNistMilL2cRe428G4\nhhC6AgX1GGHtyIRPsGLGmFynnHl37Ir6fdMgS8dhAoGBAKRrHpDuGNwuzzG2ocUG\n0plGxx/Efei9FesQNGMnnHRG2tVcRZzs0NFzwu/Q4hY1b2jTfsI88ZQ0Xr0nKC87\nUhOVYSXOd+4wvtMi1QllnViE36Wo0V230rg4QqVs5WndnHAkUTXQwnAqCwaEOqH7\nAdIemxZqJ2/0pQnTLSSrygzI\n-----END PRIVATE KEY-----\n",
  client_email: "requisition-dashboard-edit@pelagic-range-466218-p1.iam.gserviceaccount.com",
  client_id: "107364221326667054499",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/requisition-dashboard-edit%40pelagic-range-466218-p1.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const SPREADSHEET_ID = "14xAMCZyH1_mml5mp8sgNOVzwwnnW5hqkyqSZHMDuc64";
const RANGE = "Facebook_Dashboard!A:X";

const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const getAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_CREDENTIALS.client_email,
      private_key: SERVICE_ACCOUNT_CREDENTIALS.private_key.replace(/\\n/g, '\n'),
    },
    scopes,
  });
};

const getSheetsApi = () => {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
};

const headerMapping: { [key: string]: keyof AnalyzeSheetRowInput } = {
  'Date': 'date',
  'Scheduled Time': 'scheduledTime',
  'Entry Time \n( T-45) / (T-30)': 'entryTime',
  'Slide QAC\n( T-15)': 'slideQAC',
  'Class Start Time': 'classStartTime',
  'Product Type': 'productType',
  'Course': 'course',
  'Subject': 'subject',
  'Teacher': 'teacher',
  'Teacher 1 Gmail': 'teacher1Gmail',
  'Teacher 2/\nDoubt Solver 1': 'teacher2',
  'Teacher 2 Gmail': 'teacher2Gmail',
  'Teacher 3/\nDoubt Solver 2': 'teacher3',
  'Teacher 3 Gmail': 'teacher3Gmail',
  'Total Duration': 'totalDuration',
  'Highest Attendance': 'highestAttendance',
  'Average Attendance': 'averageAttendance',
  'Total Comments (Number)': 'totalComments',
  'Issues Type': 'issuesType',
  'Issues details': 'issuesDetails',
  'Slide Communication': 'slideCommunication',
  'Which issues have you faced during the LIVE class?': 'whichIssuesHaveYouFacedDuringTheLIVEClass',
  'Besides the mentioned issues, have you encountered any other technical issues?': 'besidesTheMentionedIssuesHaveYouEncounteredAnyOtherTechnicalIssues',
  'On a scale of 1 to 5, how satisfied are you with your in-studio experience [Satisfaction ]': 'satisfaction',
};


export async function getSheetData(): Promise<SheetRow[]> {
  const sheets = getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) { // Need at least a header and one data row
    return [];
  }

  // Find the real header row
  const headerIndex = rows.findIndex(row => row.includes('Date'));
  if (headerIndex === -1) {
    throw new Error("Could not find header row with 'Date' column.");
  }
  
  const headerRow = rows[headerIndex].map(h => h.trim());
  const dataRows = rows.slice(headerIndex + 1);
  
  const keyMap = headerRow.map(header => headerMapping[header] || header);

  const analysisPromises = dataRows.map(async (row, index): Promise<SheetRow | null> => {
    try {
      const rowData: { [key: string]: string } = {};
      keyMap.forEach((key, i) => {
        rowData[key] = row[i] || "";
      });
      
      const typedData = rowData as unknown as AnalyzeSheetRowInput;

      // Ensure all fields for AI analysis are strings
      const analysisInput: AnalyzeSheetRowInput = Object.fromEntries(
        Object.entries(typedData).map(([key, value]) => [key, String(value ?? '')])
      ) as AnalyzeSheetRowInput;

      const aiResult = await analyzeSheetRow(analysisInput);

      return {
        id: `row-${index}`,
        date: typedData.date,
        scheduledTime: typedData.scheduledTime,
        entryTime: typedData.entryTime,
        slideQAC: typedData.slideQAC,
        classStartTime: typedData.classStartTime,
        productType: typedData.productType,
        course: typedData.course,
        subject: typedData.subject,
        teacher: typedData.teacher,
        teacher1Gmail: typedData.teacher1Gmail,
        teacher2: typedData.teacher2,
        teacher2Gmail: typedData.teacher2Gmail,
        teacher3: typedData.teacher3,
        teacher3Gmail: typedData.teacher3Gmail,
        totalDuration: parseInt(typedData.totalDuration, 10) || 0,
        highestAttendance: parseInt(typedData.highestAttendance, 10) || 0,
        averageAttendance: parseInt(typedData.averageAttendance, 10) || 0,
        totalComments: parseInt(String(typedData.totalComments).replace(/,/g, ''), 10) || 0,
        issuesType: typedData.issuesType,
        issuesDetails: typedData.issuesDetails,
        slideCommunication: typedData.slideCommunication,
        whichIssuesHaveYouFacedDuringTheLIVEClass: typedData.whichIssuesHaveYouFacedDuringTheLIVEClass,
        besidesTheMentionedIssuesHaveYouEncounteredAnyOtherTechnicalIssues: typedData.besidesTheMentionedIssuesHaveYouEncounteredAnyOtherTechnicalIssues,
        satisfaction: parseInt(typedData.satisfaction, 10) || 0,
        aiSummary: aiResult.summary,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error processing row ${index}: ${errorMessage}`);
      return null;
    }
  });

  const processedData = await Promise.all(analysisPromises);
  return processedData.filter((row): row is SheetRow => row !== null);
}
