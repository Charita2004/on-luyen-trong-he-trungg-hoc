import React from 'react';
import { ArrowRight, CheckCircle, XCircle, PenSquare } from 'lucide-react';
import { StudentData, TabType, ReExamItem } from '../types';

interface ReExamTableProps {
  students: StudentData[];
  activeTab: TabType;
  onUpdateResult?: (studentId: string, itemId: string, value: string) => void;
  onUpdateNote?: (studentId: string, itemId: string, value: string) => void;
  onUpdateSummaryReason?: (studentId: string, value: string) => void;
  filterMode?: 'all' | 'passed' | 'failed'; 
  showReasonInput?: boolean;
  readOnlyReason?: boolean;
  readOnlyInput?: boolean;
  enableSelection?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (studentId: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  ignorePrincipalApproval?: boolean;
  allowApprovedInFailedList?: boolean;
  hideInputColumn?: boolean;
  onOpenRegistration?: (studentId: string) => void;
  onlyRegisteredItems?: boolean;
  isConductTab?: boolean;
}

// Helper to clean raw data strings
const cleanValue = (val: string | undefined): string => {
    if (!val) return '---';
    let cleaned = val.replace(/^Điểm\s+/, '');
    cleaned = cleaned.replace(/\s*\(.*\)$/, '');
    // Removed rounding logic to preserve decimals like 3.5, 4.8
    return cleaned.trim();
};

// Reverted CleanBadge to standard style
const CleanBadge = ({ label, value, color = 'gray' }: { label: string, value: string, color?: 'red' | 'blue' | 'gray' | 'orange' }) => {
    const bgClass = color === 'red' ? 'bg-red-50 border-red-200 text-red-700' :
                    color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                    'bg-gray-100 border-gray-200 text-gray-700';
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded border ${bgClass} text-xs font-medium`}>
            {label && <span className="opacity-70 uppercase text-[10px] tracking-wide">{label}</span>}
            <span className="font-bold">{value}</span>
        </span>
    );
};

export const ReExamTable: React.FC<ReExamTableProps> = ({ 
  students, 
  activeTab, 
  onUpdateResult, 
  onUpdateSummaryReason, 
  filterMode = 'all',
  showReasonInput = false,
  readOnlyReason = false,
  readOnlyInput = false, 
  enableSelection = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected = false,
  ignorePrincipalApproval = false,
  allowApprovedInFailedList = false,
  hideInputColumn = false,
  onOpenRegistration,
  onlyRegisteredItems = false,
  isConductTab = false,
  onUpdateNote
}) => {
  const isSummary = activeTab === 'summary';

  const checkAcademicPassStatus = (items: ReExamItem[]) => {
    const academicItems = items.filter(item => item.category !== 'RÈN LUYỆN' && item.subjectName !== 'Hạnh kiểm');
    if (academicItems.length === 0) return true;
    const isFail = academicItems.some(item => {
      const val = item.result?.trim() || ''; 
      if (item.hasDoubleAuth) {
         const parts = val.split('|');
         const level = parts[0];
         const scoreStr = parts[1];
         const score = parseFloat(scoreStr);
         if (level === 'C' || isNaN(score) || score < 5) return true;
         if (!level || !scoreStr) return true;
         return false;
      }
      if (item.inputType === 'text') {
        const num = parseFloat(val);
        return isNaN(num) || num < 5; 
      }
      return val === 'C' || val === '' || val === 'Chưa đạt' || val === 'Chưa hoàn thành';
    });
    return !isFail;
  };

  const checkConductPassStatus = (items: ReExamItem[]) => {
    const conductItems = items.filter(item => item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm');
    if (conductItems.length === 0) return true;
    const isFail = conductItems.some(item => {
      const val = item.result?.trim() || '';
      return val === '' || val === 'Chưa đạt';
    });
    return !isFail;
  };

  const getFailingSubjects = (items: ReExamItem[]) => {
    return items.filter(item => {
      // Exclude conduct
      if (item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm') return false;

      // Check current score
      const val = item.currentScore || '';
      const cleaned = cleanValue(val);
      const num = parseFloat(cleaned);
      
      // Check for double auth if needed, but usually currentScore is the main indicator for initial list
      if (item.hasDoubleAuth) {
         const parts = val.split('\n');
         const scorePart = parts.find(p => p.includes('Điểm')) || parts[1] || '';
         const scoreClean = cleanValue(scorePart);
         const s = parseFloat(scoreClean);
         if (!isNaN(s) && s < 5.0) return true;
      }

      if (!isNaN(num) && num < 5.0) return true;
      
      return false;
    });
  };

  const visibleStudentsCount = students.filter(s => {
    const isAcademicPass = checkAcademicPassStatus(s.items);
    const isConductPass = checkConductPassStatus(s.items);
    const isFinalPass = (isAcademicPass && isConductPass) || (!ignorePrincipalApproval && s.isApprovedByPrincipal);
    
    // Filtering Logic
    if (filterMode === 'failed') {
        if (isAcademicPass && isConductPass) return false;
        if (isFinalPass && !allowApprovedInFailedList) return false;
        return true;
    }
    
    if (filterMode === 'passed' && !isFinalPass) return false;

    // Step 1 Specific Filtering: Exclude students with ONLY conduct failures
    if (hideInputColumn) {
        const failingSubjects = getFailingSubjects(s.items);
        if (failingSubjects.length === 0) return false;
    }

    if (onlyRegisteredItems) {
        const hasRegistered = s.items.some(i => i.isRegistered);
        if (!hasRegistered) return false;
    }

    return true;
  }).length;

  const parseDoubleAuthOld = (raw: string) => {
      const parts = raw.split('\n');
      const rawLevel = parts.find(p => p.includes('Mức')) || parts[0] || '';
      const rawScore = parts.find(p => p.includes('Điểm')) || parts[1] || '';
      return {
          level: cleanValue(rawLevel),
          score: cleanValue(rawScore)
      };
  };

  const parseDoubleAuthNew = (raw: string | undefined) => {
      const parts = (raw || '').split('|');
      return {
          level: parts[0] || '',
          score: parts[1] || ''
      };
  };

  const updateDoubleAuth = (studentId: string, itemId: string, type: 'level' | 'score', val: string, currentFull: string | undefined) => {
      const current = parseDoubleAuthNew(currentFull);
      let newVal = '';
      if (type === 'level') {
          newVal = `${val}|${current.score}`;
      } else {
          newVal = `${current.level}|${val}`;
      }
      if (onUpdateResult) {
          onUpdateResult(studentId, itemId, newVal);
      }
  };

  if (visibleStudentsCount === 0) {
      if (filterMode === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-white">
                <div className="text-green-500 mb-3"><CheckCircle size={48} /></div>
                <h3 className="text-lg font-medium text-gray-900">Không có học sinh chưa đạt</h3>
                <p className="text-gray-500 mt-1">Tất cả học sinh đã đủ điều kiện lên lớp.</p>
            </div>
        );
      } else if (filterMode === 'passed') {
         return (
            <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-white">
                <div className="text-gray-400 mb-3"><XCircle size={48} /></div>
                <h3 className="text-lg font-medium text-gray-900">Danh sách trống</h3>
                <p className="text-gray-500 mt-1">Chưa có học sinh nào được xét lên lớp.</p>
            </div>
         );
      }
  }

  const ArrowIcon = () => <ArrowRight size={14} className="text-gray-400 shrink-0" />;

  return (
    <div className="w-full flex flex-col gap-4">
        <div className="w-full overflow-x-auto border border-gray-300 rounded-lg shadow-sm bg-white relative">
            {/* Read-only Tag removed */}

            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                <table className="min-w-full table-fixed border-collapse">
                    <thead className="bg-[#21409A] sticky top-0 z-20 shadow-sm">
                    {isSummary ? (
                        <>
                            <tr>
                                {enableSelection && (
                                    <th rowSpan={3} className="bg-[#21409A] px-3 py-2 text-center w-[50px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>
                                        <input type="checkbox" checked={isAllSelected} onChange={onToggleSelectAll} className="rounded text-blue-600 focus:ring-0 cursor-pointer" />
                                    </th>
                                )}
                                <th rowSpan={3} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[60px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>STT</th>
                                <th rowSpan={3} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-auto border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Họ tên</th>
                                <th rowSpan={3} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[100px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Tên lớp</th>
                                <th colSpan={4} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Thông tư 22</th>
                                <th rowSpan={3} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-auto border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Lý do thi lại, rèn luyện lại</th>
                                <th rowSpan={3} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-auto border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Trạng thái</th>
                                <th rowSpan={3} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-auto border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Lý do lưu ban sau thi lại, rèn luyện</th>
                            </tr>
                            <tr>
                                <th colSpan={2} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Trước rèn luyện</th>
                                <th colSpan={2} className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>Sau rèn luyện</th>
                            </tr>
                            <tr>
                                <th className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[80px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>KQHT</th>
                                <th className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[100px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>KQ rèn luyện</th>
                                <th className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[80px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>KQHT</th>
                                <th className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[100px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>KQ rèn luyện</th>
                            </tr>
                        </>
                    ) : (
                    <tr>
                        {enableSelection && (
                            <th className="bg-[#21409A] px-3 py-2 text-center w-[50px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>
                                <input type="checkbox" checked={isAllSelected} onChange={onToggleSelectAll} className="rounded text-blue-600 focus:ring-0 cursor-pointer" />
                            </th>
                        )}
                        <th className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[60px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>STT</th>
                        
                        {hideInputColumn ? (
                            // Step 1 Headers
                            <>
                                <th className="bg-[#21409A] px-3 py-2 text-center text-xs font-bold text-white uppercase w-[80px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>THAO TÁC</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[250px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>HỌ TÊN</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[300px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>MÔN ĐK THI LẠI</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[250px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>LÝ DO THI LẠI</th>
                            </>
                        ) : isConductTab ? (
                            // Step 2 Conduct Tab Headers
                            <>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[250px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>THÔNG TIN HỌC SINH</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[200px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>LÝ DO RÈN LUYỆN LẠI</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[200px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>KẾT QUẢ RÈN LUYỆN LẠI</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[250px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>NHẬN XÉT</th>
                            </>
                        ) : (
                            // Step 2+ Headers
                            <>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[250px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>THÔNG TIN HỌC SINH</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[140px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>NHÓM NỘI DUNG</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[300px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>CHI TIẾT & KẾT QUẢ CŨ</th>
                                <th className="bg-[#21409A] px-3 py-2 text-left text-xs font-bold text-white uppercase w-[180px] border border-white/40 align-middle" style={{ verticalAlign: 'middle' }}>CẬP NHẬT KẾT QUẢ</th>
                            </>
                        )}
                    </tr>
                    )}
                    </thead>
            <tbody className="bg-white">
              {students.map((student, studentIndex) => {
                const isAcademicPass = checkAcademicPassStatus(student.items);
                const isConductPass = checkConductPassStatus(student.items);
                const isFinalPass = (isAcademicPass && isConductPass) || (!ignorePrincipalApproval && student.isApprovedByPrincipal);

                // Apply Filtering in the map loop
                if (filterMode === 'failed') {
                    if (isAcademicPass && isConductPass) return null;
                    if (isFinalPass && !allowApprovedInFailedList) return null;
                } else if (filterMode === 'passed' && !isFinalPass) {
                    return null;
                }

                // Step 1 Filtering & Reason Generation
                if (hideInputColumn) {
                    const failingSubjects = getFailingSubjects(student.items);
                    
                    // ONLY show students who have academic subjects to retake in Step 1
                    if (failingSubjects.length === 0) return null;
                    
                    const conductItems = student.items.filter(i => i.category === 'RÈN LUYỆN' || i.subjectName === 'Hạnh kiểm');
                    const hasConductIssue = conductItems.length > 0;
                    
                    let step1Reason = '';
                    if (failingSubjects.length > 0) {
                        step1Reason += `Thi lại do môn học: ${failingSubjects.map(i => i.subjectName).join(', ')} có ĐTBCN < 5.0. `;
                    }
                    if (hasConductIssue) {
                        step1Reason += `Kết quả rèn luyện: ${conductItems.map(i => i.currentScore).join(', ')}.`;
                    }

                    const registeredItems = student.items.filter(i => i.isRegistered && !(i.category === 'RÈN LUYỆN' || i.subjectName === 'Hạnh kiểm'));

                    return (
                        <tr key={student.id} className="border-b border-[#c0c0c0] hover:bg-blue-50 transition-colors even:bg-white odd:bg-[#f9fafb]">
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <span className="text-gray-900 font-bold text-sm">{studentIndex + 1}</span>
                            </td>
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <button 
                                    onClick={() => onOpenRegistration && onOpenRegistration(student.id)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200"
                                >
                                    Đăng ký môn
                                </button>
                            </td>
                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                <div className="flex flex-col gap-1 text-left">
                                    <span className="font-bold text-gray-900 text-base">{student.fullName}</span>
                                    <span className="text-gray-500 text-xs font-mono">Mã HS: {student.code}</span>
                                    <span className="text-gray-500 text-xs">Lớp: {student.className}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                <div className="flex flex-col gap-1">
                                    {registeredItems.length > 0 ? (
                                        <span className="text-sm font-medium text-gray-900">
                                            {registeredItems.map(item => item.subjectName).join(', ')}
                                        </span>
                                    ) : (
                                        <div className="h-10 flex items-center justify-center border border-dashed border-gray-300 rounded bg-gray-50">
                                            <span className="text-gray-400 italic text-xs">Chưa đăng ký</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                <span className="text-sm text-gray-700 leading-relaxed block">{step1Reason}</span>
                            </td>
                        </tr>
                    );
                }

                if (isSummary) {
                    const hasAcademic = student.items.some(item => item.category !== 'RÈN LUYỆN' && item.subjectName !== 'Hạnh kiểm');
                    const hasConduct = student.items.some(item => item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm');
                    
                    const reasonBefore = student.items.map(item => item.subjectName).join(', ');

                    return (
                        <tr key={student.id} className="border-b border-[#c0c0c0] hover:bg-blue-50 transition-colors even:bg-white odd:bg-[#f9fafb]">
                            {enableSelection && (
                                <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(student.id)}
                                        disabled={student.isApprovedByPrincipal}
                                        onChange={() => onToggleSelect && onToggleSelect(student.id)}
                                        className={`w-4 h-4 rounded border-gray-300 focus:ring-blue-500 ${student.isApprovedByPrincipal ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-600 cursor-pointer'}`}
                                    />
                                </td>
                            )}
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <span className="text-gray-900 font-bold text-sm">{studentIndex + 1}</span>
                            </td>
                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                <div className="flex flex-col gap-1 text-left">
                                    <span className="font-bold text-gray-900 text-base">{student.fullName}</span>
                                    <span className="text-gray-500 text-xs font-mono">Mã HS: {student.code}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <span className="text-sm text-gray-900">{student.className}</span>
                            </td>
                            
                            {/* Trước rèn luyện - KQHT */}
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <span className={`text-sm font-medium ${hasAcademic ? 'text-red-600' : 'text-green-600'}`}>
                                    {hasAcademic ? 'Chưa đạt' : 'Đạt'}
                                </span>
                            </td>
                            {/* Trước rèn luyện - KQ rèn luyện */}
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <span className={`text-sm font-medium ${hasConduct ? 'text-red-600' : 'text-green-600'}`}>
                                    {hasConduct ? 'Chưa đạt' : 'Đạt'}
                                </span>
                            </td>
                            
                            {/* Sau rèn luyện - KQHT */}
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <span className={`text-sm font-medium ${!isAcademicPass ? 'text-red-600' : 'text-green-600'}`}>
                                    {!isAcademicPass ? 'Chưa đạt' : 'Đạt'}
                                </span>
                            </td>
                            {/* Sau rèn luyện - KQ rèn luyện */}
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <span className={`text-sm font-medium ${!isConductPass ? 'text-red-600' : 'text-green-600'}`}>
                                    {!isConductPass ? 'Chưa đạt' : 'Đạt'}
                                </span>
                            </td>
                            
                            {/* Lý do thi lại, rèn luyện lại */}
                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                <span className="text-sm text-gray-700">{reasonBefore}</span>
                            </td>
                            
                            {/* Trạng thái */}
                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]">
                                <div className="flex flex-col items-center gap-2">
                                    {isFinalPass ? (
                                        <>
                                            <span className="text-sm font-bold text-green-600">Lên lớp</span>
                                            {student.isApprovedByPrincipal && !ignorePrincipalApproval && <span className="text-xs text-gray-500 font-medium">HT Duyệt</span>}
                                        </>
                                    ) : (
                                        <span className="text-sm font-bold text-red-600">Ở lại lớp</span>
                                    )}
                                </div>
                            </td>
                            
                            {/* Lý do lưu ban */}
                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                <textarea
                                    disabled={readOnlyReason}
                                    className={`w-full h-16 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none ${readOnlyReason ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                                    placeholder={readOnlyReason ? "" : "Nhập lý do..."}
                                    value={student.summary.finalReason || ''}
                                    onChange={(e) => !readOnlyReason && onUpdateSummaryReason && onUpdateSummaryReason(student.id, e.target.value)}
                                ></textarea>
                            </td>
                        </tr>
                    );
                }

                const groupedItems: Record<string, ReExamItem[]> = {};
                student.items.forEach(item => {
                    if (onlyRegisteredItems && !item.isRegistered) return;
                    if (!groupedItems[item.category]) groupedItems[item.category] = [];
                    groupedItems[item.category].push(item);
                });

                const categories = Object.keys(groupedItems);
                let totalRowsForStudent = 0;
                categories.forEach(cat => totalRowsForStudent += groupedItems[cat].length);
                if (totalRowsForStudent === 0) return null;

                let currentRowIndex = 0;

                return (
                    <React.Fragment key={student.id}>
                        {categories.map((category, catIndex) => {
                            const items = groupedItems[category];
                            const isLastCategory = catIndex === categories.length - 1;

                            return items.map((item, itemIndex) => {
                                const isFirstItemOfStudent = currentRowIndex === 0;
                                const isFirstItemOfCategory = itemIndex === 0;
                                const isLastItemOfCategory = itemIndex === items.length - 1;
                                const isLastItemOfStudent = isLastCategory && isLastItemOfCategory;
                                currentRowIndex++;

                                // BORDER LOGIC: 
                                // - Solid #c0c0c0 separator between items and students
                                let borderClass = "border-b border-[#c0c0c0]";

                                const oldDouble = parseDoubleAuthOld(item.currentScore);
                                const newDouble = parseDoubleAuthNew(item.result);
                                const singleOld = cleanValue(item.currentScore);
                                const singleNew = cleanValue(item.result);
                                const singleLabel = item.inputType === 'text' ? '' : ''; // Removed label for cleaner look as per design

                                return (
                                    <tr key={item.id} className={`${borderClass} hover:bg-blue-50 transition-colors ${studentIndex % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}`}>
                                        
                                        {enableSelection && isFirstItemOfStudent && (
                                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]" rowSpan={totalRowsForStudent}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(student.id)}
                                                    disabled={student.isApprovedByPrincipal} // Disable checkbox if already approved
                                                    onChange={() => onToggleSelect && onToggleSelect(student.id)}
                                                    className={`w-4 h-4 rounded border-gray-300 focus:ring-blue-500 ${student.isApprovedByPrincipal ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-blue-600 cursor-pointer'}`}
                                                />
                                            </td>
                                        )}

                                        {isFirstItemOfStudent && (
                                            <td className="px-3 py-2 align-middle text-center border border-[#c0c0c0]" rowSpan={totalRowsForStudent}>
                                                <span className="text-gray-900 font-bold text-sm">{studentIndex + 1}</span>
                                            </td>
                                        )}

                                        {isFirstItemOfStudent && (
                                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]" rowSpan={totalRowsForStudent}>
                                                <div className="flex flex-col gap-1 text-left">
                                                    <span className="font-bold text-gray-900 text-base">{student.fullName}</span>
                                                    <span className="text-gray-500 text-xs font-mono">Mã HS: {student.code}</span>
                                                    <span className="text-gray-500 text-xs">Lớp: {student.className}</span>
                                                </div>
                                            </td>
                                        )}

                                        {/* Step 2+: Category Column - Hide for Conduct Tab */}
                                        {!isConductTab && isFirstItemOfCategory && (
                                            <td className="px-3 py-2 align-middle text-left border border-[#c0c0c0]" rowSpan={items.length}>
                                                <span className="text-sm font-bold text-gray-900">{category}</span>
                                            </td>
                                        )}

                                        {/* Subject / Details Column */}
                                        {isConductTab ? (
                                            // Conduct Tab Columns
                                            <>
                                                <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                                    <span className="text-sm font-medium text-gray-900">{item.currentScore || 'Chưa đạt'}</span>
                                                </td>
                                                <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                                    <select 
                                                        disabled={readOnlyInput}
                                                        value={item.result || ''}
                                                        onChange={(e) => onUpdateResult && onUpdateResult(student.id, item.id, e.target.value)}
                                                        className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'cursor-pointer hover:border-blue-400'}`}
                                                    >
                                                        <option value="">-- Chọn --</option>
                                                        <option value="Tốt">Tốt</option>
                                                        <option value="Khá">Khá</option>
                                                        <option value="Đạt">Đạt</option>
                                                        <option value="Chưa đạt">Chưa đạt</option>
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                                    <textarea
                                                        disabled={readOnlyInput}
                                                        className={`w-full h-16 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none ${readOnlyInput ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                                                        placeholder={readOnlyInput ? "" : "Nhập nhận xét..."}
                                                        value={item.note || ''}
                                                        onChange={(e) => onUpdateNote && onUpdateNote(student.id, item.id, e.target.value)}
                                                    ></textarea>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-sm font-medium text-gray-900">{item.subjectName}</span>
                                                    
                                                    {item.hasDoubleAuth ? (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <CleanBadge label="MỨC" value={oldDouble.level} color="red" />
                                                            <CleanBadge label="ĐIỂM" value={oldDouble.score} color="red" />
                                                        </div>
                                                    ) : (
                                                        <CleanBadge label={singleLabel} value={singleOld} color={item.badgeColor as any} />
                                                    )}
                                                </div>
                                            </td>
                                            </>
                                        )}

                                        {/* Step 2+: Input Column - Hide for Conduct Tab */}
                                        {!isConductTab && (
                                            <td className="px-3 py-2 align-middle border border-[#c0c0c0]">
                                                {item.hasDoubleAuth ? (
                                                    <div className="flex flex-col gap-2">
                                                        <select 
                                                            disabled={readOnlyInput}
                                                            value={newDouble.level || ''}
                                                            onChange={(e) => updateDoubleAuth(student.id, item.id, 'level', e.target.value, item.result)}
                                                            className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'cursor-pointer hover:border-blue-400'}`}
                                                        >
                                                            <option value="">-- Mức --</option>
                                                            {['T', 'H', 'C'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                        <div className="relative">
                                                            <input 
                                                                type="number"
                                                                step="any"
                                                                disabled={readOnlyInput}
                                                                value={newDouble.score || ''}
                                                                onChange={(e) => updateDoubleAuth(student.id, item.id, 'score', e.target.value, item.result)}
                                                                placeholder={readOnlyInput ? "" : "Điểm..."}
                                                                className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-gray-50 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                                                            />
                                                            {!readOnlyInput && <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">/ 10</span>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    item.inputType === 'text' ? (
                                                        <div className="relative">
                                                            <input 
                                                                type="number"
                                                                step="any"
                                                                disabled={readOnlyInput}
                                                                value={item.result || ''}
                                                                onChange={(e) => onUpdateResult && onUpdateResult(student.id, item.id, e.target.value)}
                                                                placeholder={readOnlyInput ? "" : "Nhập điểm..."}
                                                                className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-gray-50 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                                                            />
                                                            {!readOnlyInput && <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">/ 10</span>}
                                                        </div>
                                                    ) : (
                                                        <select 
                                                            disabled={readOnlyInput}
                                                            value={item.result || ''}
                                                            onChange={(e) => onUpdateResult && onUpdateResult(student.id, item.id, e.target.value)}
                                                            className={`w-full border rounded-md px-3 py-2 text-sm outline-none transition-shadow bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 ${readOnlyInput ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'cursor-pointer hover:border-blue-400'}`}
                                                        >
                                                            <option value="">-- Chọn --</option>
                                                            {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    )
                                                )}
                                            </td>
                                        )}

                                    </tr>
                                );
                            });
                        })}
                    </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};