import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Completion, PatientProfile, Routine } from '../types';
import { format, subDays } from 'date-fns';

export const exportWeeklyReport = (
  patient: PatientProfile, 
  completions: Completion[], 
  routines: Routine[]
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('CueGuide Weekly Report', 14, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Patient: ${patient.name} (${patient.preferredName})`, 14, 28);
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy')}`, 14, 34);

  // Calculate stats for the last 7 days
  const last7DaysStr = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  const recentCompletions = completions.filter(c => last7DaysStr.includes(c.date));
  
  const completed = recentCompletions.filter(c => c.status === 'completed').length;
  const missed = recentCompletions.filter(c => c.status === 'missed').length;
  const partial = recentCompletions.filter(c => c.status === 'partial').length;
  
  // Summary Stats
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('7-Day Summary', 14, 45);
  
  doc.setFontSize(10);
  doc.text(`Fully Completed: ${completed}`, 14, 53);
  doc.text(`Partially Completed: ${partial}`, 14, 59);
  doc.text(`Missed Routines: ${missed}`, 14, 65);

  // Detail Table
  doc.setFontSize(14);
  doc.text('Routine Log (Last 7 Days)', 14, 80);

  const tableData = recentCompletions.map(c => {
    const r = routines.find(ro => ro.id === c.routineId);
    return [
      c.date,
      r ? r.name : 'Unknown Routine',
      c.status.replace('_', ' ').toUpperCase(),
      `${c.minutes} mins`,
      c.mood || 'N/A'
    ];
  });

  autoTable(doc, {
    startY: 85,
    head: [['Date', 'Routine', 'Status', 'Duration', 'Reported Mood']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    styles: { fontSize: 9 },
  });

  doc.save(`CueGuide_Report_${patient.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
