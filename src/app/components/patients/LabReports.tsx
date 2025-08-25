'use client'

import { useState, useEffect } from 'react';
import { DBLabReport } from '@/types/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { AttachmentViewer } from '../AttachmentViewer';
import { DicomViewer } from '../DicomViewer';

interface LabReportsProps {
  patientId: number;
  reports: DBLabReport[];
}

export function LabReports({ patientId, reports: initialReports }: LabReportsProps) {
  const [reports, setReports] = useState<DBLabReport[]>(initialReports);
  const [isAddReportDialogOpen, setIsAddReportDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; type: string } | null>(null);

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  const handleAddReport = async (file: File, title: string, date: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('date', date);

    await fetch(`/api/patients/${patientId}/lab-reports`, {
      method: 'POST',
      body: formData,
    });
    // Refresh reports
    const response = await fetch(`/api/patients/${patientId}/lab-reports`);
    const data = await response.json();
    setReports(data);
    setIsAddReportDialogOpen(false);
  };

  const handleViewFile = (report: DBLabReport) => {
    setSelectedFile({ url: report.file_url, type: report.file_type });
    setIsViewerOpen(true);
  };

  const handleDownloadFile = (report: DBLabReport) => {
    window.open(report.file_url, '_blank');
  };

  const groupedReports = reports.reduce((acc, report) => {
    const date = format(new Date(report.date), 'MMMM d, yyyy');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(report);
    return acc;
  }, {} as Record<string, DBLabReport[]>);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Lab Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => setIsAddReportDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Report
        </Button>

        {Object.entries(groupedReports).map(([date, reports]) => (
          <div key={date}>
            <h3 className="text-lg font-semibold">{date}</h3>
            <ul className="space-y-2 mt-2">
              {reports.map((report) => (
                <li key={report.id} className="border-b pb-2 flex justify-between items-center">
                  <p>{report.title}</p>
                  <div>
                    {report.file_type.startsWith('image/') || report.file_type === 'application/dicom' ? (
                      <Button onClick={() => handleViewFile(report)} variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={() => handleDownloadFile(report)} variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Add Report Dialog */}
        {isAddReportDialogOpen && (
          <AddReportDialog
            isOpen={isAddReportDialogOpen}
            onClose={() => setIsAddReportDialogOpen(false)}
            onAddReport={handleAddReport}
          />
        )}

        {/* Viewer */}
        {selectedFile && selectedFile.type.startsWith('image/') && (
            <AttachmentViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                attachments={[{fileName: selectedFile.url}]}
                description=""
            />
        )}
        {selectedFile && selectedFile.type === 'application/dicom' && (
            <DicomViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                fileUrl={selectedFile.url}
            />
        )}
      </CardContent>
    </Card>
  );
}

// AddReportDialog component
interface AddReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddReport: (file: File, title: string, date: string) => Promise<void>;
}

function AddReportDialog({ isOpen, onClose, onAddReport }: AddReportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleSubmit = async () => {
        if (file && title && date) {
            await onAddReport(file, title, date);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center`}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h3 className="text-lg font-semibold mb-4">Add New Lab Report</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title">Title</label>
                        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label htmlFor="date">Date</label>
                        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label htmlFor="file">File</label>
                        <input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add</Button>
                </div>
            </div>
        </div>
    )
}
