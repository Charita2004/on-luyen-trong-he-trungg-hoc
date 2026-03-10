import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Menu, ChevronRight, ChevronLeft, Send, CheckSquare, Lock, XCircle, CheckCircle, X,
  Search, Maximize, Bell, ArrowLeft, ChevronDown, Check, LogOut, Clock, FileText, AlertCircle, RotateCcw, Filter, AlertTriangle, Play, Eye, List, Info, BookOpen, Award
} from 'lucide-react';
import { Stepper } from './components/Stepper';
import { ReExamTable } from './components/ReExamTable';
import { Sidebar } from './components/Sidebar';
import { InitializationScreen } from './components/InitializationScreen';
import { Step, StudentData, User, ProcessStatus } from './types';

// Steps
const STEPS: Step[] = [
  { id: 1, label: 'Đăng kí môn thi lại' },
  { id: 2, label: 'Nhập kết quả thi lại, rèn luyện lại' },
  { id: 3, label: 'Tổng hợp kết quả sau thi lại' },
  { id: 4, label: 'Hiệu trưởng xét duyệt' },
  { id: 5, label: 'Chốt sổ' },
];

// Mock Users Data
const MOCK_USERS: User[] = [
  { 
    id: 'principal', 
    name: 'Cô Phạm Thị Thu', 
    role: 'Hiệu trưởng', 
    avatarColor: 'bg-purple-600', 
    initial: 'HT' 
  },
  { 
    id: 'teacher', 
    name: 'Cô Nguyễn Thị Lan', 
    role: 'GV Chủ nhiệm', 
    avatarColor: 'bg-teal-600', 
    initial: 'GV' 
  },
];

// Configuration for Filter
const GRADES = [
    { value: '10', label: 'Khối 10' },
    { value: '11', label: 'Khối 11' },
    { value: '12', label: 'Khối 12' },
];

const CLASSES: Record<string, string[]> = {
    '12': ['12A1', '12A2', '12B'],
    '11': ['11A5', '11B1', '11B2'],
    '10': ['10A1', '10A2', '10C'],
};

// Initial Mock Data Factory Function
const getInitialData = (): StudentData[] => [
  // =========================================================================
  // LỚP 11A5 (Lớp INTERACTIVE - Của GVCN Demo)
  // =========================================================================
  {
    id: '1',
    code: 'HS11A5_01',
    fullName: 'Nguyễn Văn An',
    className: '11A5',
    items: [
      {
        id: 'i1_1',
        category: 'MÔN HỌC BẮT BUỘC',
        subjectName: 'Toán',
        currentScore: 'Điểm 3.5',
        badgeColor: 'red',
        trainingContent: 'Ôn tập kiến thức Đại số',
        inputType: 'text',
        result: '' 
      },
      {
        id: 'i1_2',
        category: 'MÔN HỌC LỰA CHỌN',
        subjectName: 'Vật lí',
        currentScore: 'Điểm 4.8',
        badgeColor: 'red',
        trainingContent: 'Ôn tập Cơ học',
        inputType: 'text',
        result: ''
      },
      {
        id: 'i1_3',
        category: 'MÔN HỌC BẮT BUỘC',
        subjectName: 'Lịch sử',
        currentScore: 'Điểm 4.5',
        badgeColor: 'red',
        trainingContent: 'Ôn tập lịch sử Việt Nam',
        inputType: 'text',
        result: ''
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },
  {
    id: '2',
    code: 'HS11A5_02',
    fullName: 'Trần Văn Bình',
    className: '11A5',
    items: [
      {
        id: 'i2_1',
        category: 'RÈN LUYỆN',
        subjectName: 'Hạnh kiểm',
        currentScore: 'Chưa đạt',
        badgeColor: 'orange',
        trainingContent: 'Rèn luyện ý thức kỷ luật',
        inputType: 'select',
        options: ['Tốt', 'Khá', 'Đạt', 'Chưa đạt'],
        result: '',
        isRegistered: true,
        registrationDate: new Date().toLocaleDateString('en-GB')
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },
  // Mock data for other classes to support filtering
  {
    id: '3',
    code: 'HS10A1_01',
    fullName: 'Lê Thị C',
    className: '10A1',
    items: [
      {
        id: 'i3_1',
        category: 'MÔN HỌC LỰA CHỌN',
        subjectName: 'Hóa học',
        currentScore: 'Điểm 4.0',
        badgeColor: 'red',
        trainingContent: 'Cân bằng phương trình',
        inputType: 'text',
        result: ''
      },
      {
        id: 'i3_2',
        category: 'MÔN HỌC TỰ CHỌN',
        subjectName: 'Tiếng dân tộc thiểu số',
        currentScore: 'Điểm 4.5',
        badgeColor: 'red',
        trainingContent: 'Ôn tập từ vựng',
        inputType: 'text',
        result: ''
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  },
  {
    id: '4',
    code: 'HS11A5_04',
    fullName: 'Phạm Văn D',
    className: '11A5',
    items: [
      {
        id: 'i4_1',
        category: 'MÔN HỌC BẮT BUỘC',
        subjectName: 'Toán',
        currentScore: 'Điểm 3.0',
        badgeColor: 'red',
        trainingContent: 'Ôn tập kiến thức cơ bản',
        inputType: 'text',
        result: ''
      },
      {
        id: 'i4_2',
        category: 'RÈN LUYỆN',
        subjectName: 'Hạnh kiểm',
        currentScore: 'Chưa đạt',
        badgeColor: 'orange',
        trainingContent: 'Rèn luyện đạo đức, lối sống',
        inputType: 'select',
        options: ['Tốt', 'Khá', 'Đạt', 'Chưa đạt'],
        result: '',
        isRegistered: true,
        registrationDate: new Date().toLocaleDateString('en-GB')
      }
    ],
    summary: { academic: '', qualities: '', promotion: '', finalReason: '' }
  }
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // User Management State
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[1]); // Default to GVCN
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Flow State
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('INIT'); // Start at INIT
  // Initialize Finalized classes
  const [finalizedClasses, setFinalizedClasses] = useState<string[]>([]); 
  const [isSyncing, setIsSyncing] = useState(false); // For INIT mock sync

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [students, setStudents] = useState<StudentData[]>(getInitialData);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Filter State (For Principal)
  const [selectedGrade, setSelectedGrade] = useState<string>('11'); // Default to Grade 11
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES['11'][0]); // Initialize with first class of Grade 11

  // Step 5 Master-Detail View State
  const [step5View, setStep5View] = useState<'master' | 'detail'>('master');
  // New State for Master View Checkboxes
  const [selectedClassesForLock, setSelectedClassesForLock] = useState<string[]>([]);

  // Step 5 specific states
  const [step5Tab, setStep5Tab] = useState<'passed' | 'failed'>('passed');
  const [step2Tab, setStep2Tab] = useState<'academic' | 'conduct'>('academic');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // For Step 5 Finalize
  const [showApprovalModal, setShowApprovalModal] = useState(false); // For Step 4 Approval
  const [showNoSelectionModal, setShowNoSelectionModal] = useState(false); // For Step 4 Warning
  const [showSendWarningModal, setShowSendWarningModal] = useState(false); // For Step 3 Confirm
  const [showStartConfirmModal, setShowStartConfirmModal] = useState(false); // For Step 0 Confirm
  const [showStep2ConfirmModal, setShowStep2ConfirmModal] = useState(false); // For Step 2 Confirm
  const [showStep1ConfirmModal, setShowStep1ConfirmModal] = useState(false); // For Step 1 Confirm
  const [showValidationModal, setShowValidationModal] = useState(false); // For Step 2 Validation
  const [validationMessage, setValidationMessage] = useState(''); // For Step 2 Validation Message
  const [showRegistrationModal, setShowRegistrationModal] = useState(false); // For Step 1 Registration
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempRegistration, setTempRegistration] = useState<Record<string, boolean>>({});

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logic 2: Initialize Step based on Role 
  // IMPORTANT: We do NOT reset data here anymore, so Principal can see Teacher's input
  useEffect(() => {
    // Clear selection to avoid UI bugs with checkboxes across roles
    setSelectedStudentIds([]);
    
    // Set Navigation defaults based on Role
    if (currentUser.id === 'principal') {
      // If still in INIT, Principal sees that status (handled in render)
      // Otherwise, go to Step 4
      if (processStatus !== 'INIT') {
         setCurrentStep(4);
      } else {
         // If Principal accesses Step 1, 2, 3 but process is not INIT, it's fine (ReadOnly mode)
         // Default to Step 4 if valid
         setCurrentStep(4);
      }
    } else {
       // Teacher Logic
       if (processStatus !== 'INIT') {
         setCurrentStep(1);
       }
    }
  }, [currentUser]);

  // Reset Step 5 View to Master when navigation out or on role change
  useEffect(() => {
      if (currentStep !== 5) {
          setStep5View('master');
          setSelectedClassesForLock([]); // Reset class selection
      }
  }, [currentStep]);

  // --- SUBMITTED CLASSES LOGIC (Mock) ---
  const submittedClasses = useMemo(() => {
      // Dynamic: 11A5 based on status (If submitted/approved/finalized, it's visible)
      const dynamic = ['SUBMITTED', 'APPROVED', 'FINALIZED'].includes(processStatus) ? ['11A5'] : [];
      
      // Static mocks for demo (These represent classes that have *already* finished Step 3 by their respective teachers)
      // Note: 10A1 is finalized, so it effectively has been submitted.
      const staticMocks: string[] = []; 
      
      return [...dynamic, ...staticMocks];
  }, [processStatus]);

  // --- FILTER OPTIONS ---
  const gradeOptions = useMemo(() => {
      if (currentUser.id === 'principal' && currentStep === 4) {
          // Only grades that have at least one submitted class
          const activeGrades = new Set(submittedClasses.map(c => c.replace(/[^0-9]/g, ''))); // e.g. '11' from '11A5'
          return GRADES.filter(g => activeGrades.has(g.value));
      }
      return GRADES;
  }, [currentUser, currentStep, submittedClasses]);

  const classOptions = useMemo(() => {
      const allForGrade = CLASSES[selectedGrade] || [];
      if (currentUser.id === 'principal' && currentStep === 4) {
           return allForGrade.filter(c => submittedClasses.includes(c));
      }
      return allForGrade;
  }, [currentUser, currentStep, selectedGrade, submittedClasses]);

  // Logic 2b: Enforce specific class selection for Principal (Updated for Step 4 filter)
  useEffect(() => {
    if (currentUser.id === 'principal') {
        // 1. Validate Grade
        // If current selectedGrade is not in the allowed options (e.g. switched to Step 4 and Grade 1 has no submitted classes)
        const isGradeValid = gradeOptions.some(g => g.value === selectedGrade);
        
        if (!isGradeValid && gradeOptions.length > 0) {
            // Pick the first available grade
            const newGrade = gradeOptions[0].value;
            setSelectedGrade(newGrade);
            // We'll let the next render cycle or the Class validation block handle the class update 
            // to avoid race conditions, but we can also check classes here for safety.
            // However, since classOptions depends on selectedGrade, it will update in next render.
            return; 
        }

        // 2. Validate Class
        // Only proceed if grade is valid (or just became valid)
        // Note: classOptions updates when selectedGrade updates.
        const isClassValid = classOptions.includes(selectedClass);
        if (!isClassValid) {
             if (classOptions.length > 0) {
                 setSelectedClass(classOptions[0]);
             } else {
                 // Fallback if current grade has no classes (shouldn't happen if data consistent)
                 // Or if waiting for grade update.
                 // We can set to empty or handle gracefully.
             }
        }
    }
  }, [currentStep, currentUser, gradeOptions, classOptions, selectedGrade, selectedClass]);

  // Manual Reset Function for Demo Purposes (User Menu)
  const handleResetDemo = () => {
    setStudents(getInitialData());
    setProcessStatus('INIT'); // Reset to INIT
    setFinalizedClasses(['10A1']); // Reset finalized classes (keep 10A1 as mock finalized)
    setSelectedStudentIds([]);
    setSelectedClassesForLock([]);
    setStep5Tab('passed');
    setCurrentStep(1);
    setStep5View('master');
    setUserMenuOpen(false);
    setSelectedGrade('11');
    setSelectedClass(CLASSES['11'][0]); // Reset Filter to first class of Grade 11
    // Force switch to teacher for a clean start
    if (currentUser.id === 'principal') {
        setCurrentUser(MOCK_USERS[1]);
    }
  };

  // Logic 3: Permission Check (isEditable) - UPDATED with ProcessStatus
  const isEditable = useMemo(() => {
    if (currentUser.id === 'teacher') {
      // Teacher can only edit Step 1-3 AND when status is DRAFT
      return currentStep <= 3 && processStatus === 'DRAFT';
    } else if (currentUser.id === 'principal') {
      // Principal can edit Step 4 (Approving)
      if (currentStep === 4) return true;
      // Principal can edit Step 5 (Finalizing) only if APPROVED
      if (currentStep === 5) return processStatus === 'APPROVED';
    }
    return false;
  }, [currentUser, currentStep, processStatus]);

  // Navigation Constraint for Stepper
  const maxStepAllowed = useMemo(() => {
    if (currentUser.id === 'teacher') return 5; // Teacher can click up to 5 to see the "Waiting" screens
    return 5; // Principal sees all
  }, [currentUser]);


  // Determine the tab to display based on the current step
  const displayTab = (currentStep >= 3) ? 'summary' : 'academic'; 

  // --- FILTERING LOGIC ---
  const filteredStudents = useMemo(() => {
    let result = students;

    // 1. Role-based filtering
    if (currentUser.id === 'teacher') {
        // Teacher sees only their class (Mock: 11A5)
        result = result.filter(s => s.className === '11A5');
    } 
    // 2. Principal filtering (Only in Step 4 & 5)
    else if (currentUser.id === 'principal') {
        
        // Filter by Grade (Startswith check, e.g., '11A5' starts with '11')
        if (selectedGrade !== 'ALL') {
             result = result.filter(s => s.className.startsWith(selectedGrade));
        }

        // Filter by Class
        if (selectedClass !== 'ALL') {
            result = result.filter(s => s.className === selectedClass);
        }
    }
    
    return result;
  }, [students, currentUser, currentStep, selectedGrade, selectedClass]);


  // Helper: Check student status
  const checkStudentPass = (student: StudentData) => {
    if (student.isApprovedByPrincipal) return true;
    
    // Check academic pass
    const isAcademicFail = student.items.some(item => {
      const val = item.result?.trim() || ''; 
      
      // Handle Double Auth Logic (Hybrid Assessment)
      if (item.hasDoubleAuth) {
         // Expect val format: "LEVEL|SCORE"
         const parts = val.split('|');
         const level = parts[0];
         const scoreStr = parts[1];
         const score = parseFloat(scoreStr);
         
         // Fail condition: Level is C OR Score < 5 OR Score invalid
         if (level === 'C' || isNaN(score) || score < 5) return true; // Fail
         if (!level || !scoreStr) return true; // Fail if incomplete
         return false; // Pass
      }

      if (item.inputType === 'text') {
        const num = parseFloat(val);
        return isNaN(num) || num < 5.0; 
      }
      return val === 'C' || val === '' || val === 'Chưa đạt' || val === 'Chưa hoàn thành';
    });
    
    return !isAcademicFail;
  };

  // Helper: Get Class Status for Filter Badge
  const getClassStatus = (cls: string) => {
    if (finalizedClasses.includes(cls)) return { label: 'Đã chốt sổ', color: 'bg-green-100 text-green-700 border-green-200' };
    
    // Note: In this mock app, processStatus is global. In a real app, this would be per-class status.
    // We simulate per-class status loosely here based on the global state for demo purposes.
    switch(processStatus) {
        case 'INIT': return { label: 'Chưa bắt đầu', color: 'bg-gray-100 text-gray-500 border-gray-200' };
        case 'DRAFT': return { label: 'Đang nhập liệu', color: 'bg-blue-50 text-blue-700 border-blue-200' };
        case 'SUBMITTED': return { label: 'Chờ duyệt', color: 'bg-orange-50 text-orange-700 border-orange-200' };
        case 'APPROVED': return { label: 'Đã duyệt', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
        case 'FINALIZED': return { label: 'Đã chốt sổ', color: 'bg-green-100 text-green-700 border-green-200' };
        default: return { label: '---', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    }
  };

  // Calculate counts based on FILTERED students
  const passedCount = useMemo(() => filteredStudents.filter(s => checkStudentPass(s)).length, [filteredStudents]);
  const failedCount = useMemo(() => filteredStudents.length - passedCount, [filteredStudents]);

  // --- STEP 2: FILTERED STUDENTS FOR TAB ---
  const step2FilteredStudents = useMemo(() => {
    if (currentStep !== 2) return filteredStudents;
    
    return filteredStudents.map(student => {
        const filteredItems = student.items.filter(item => {
            const isConduct = item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm';
            return step2Tab === 'conduct' ? isConduct : !isConduct;
        });
        return { ...student, items: filteredItems };
    }).filter(s => s.items.length > 0);
  }, [filteredStudents, currentStep, step2Tab]);

  // --- STEP 5: MASTER DATA AGGREGATION ---
  const step5SummaryData = useMemo(() => {
    let classesToShow = Object.values(CLASSES).flat();

    // Filter by Grade if in Step 5 Master View (using selectedGrade state)
    if (selectedGrade !== 'ALL') {
         classesToShow = classesToShow.filter(cls => cls.startsWith(selectedGrade));
    }

    return classesToShow.map(cls => {
        // Count student in this class from the mock data
        const count = students.filter(s => s.className === cls).length;
        const isLocked = finalizedClasses.includes(cls);
        return { className: cls, count, isLocked };
    }).filter(item => item.count > 0); // Only show classes with students for demo
  }, [students, finalizedClasses, selectedGrade]);


  // --- SELECT ALL LOGIC (For Step 4) ---
  const studentsVisibleForSelection = useMemo(() => {
     // In Step 4, the table shows 'failed' students. 
     // This includes those who failed academic check AND haven't been approved yet.
     // NOTE: `checkStudentPass` returns TRUE if approved. So `!checkStudentPass` returns unapproved failures.
     if (currentStep === 4) {
         return filteredStudents.filter(s => !checkStudentPass(s));
     }
     return [];
  }, [filteredStudents, currentStep]);

  const isAllSelected = useMemo(() => {
     if (studentsVisibleForSelection.length === 0) return false;
     return studentsVisibleForSelection.every(s => selectedStudentIds.includes(s.id));
  }, [studentsVisibleForSelection, selectedStudentIds]);

  const handleToggleSelectAll = () => {
     if (isAllSelected) {
         // Deselect all visible
         const idsToDeselect = studentsVisibleForSelection.map(s => s.id);
         setSelectedStudentIds(prev => prev.filter(id => !idsToDeselect.includes(id)));
     } else {
         // Select all visible
         const idsToSelect = studentsVisibleForSelection.map(s => s.id);
         setSelectedStudentIds(prev => [...new Set([...prev, ...idsToSelect])]);
     }
  };

  // Data Handlers
  const handleUpdateResult = (studentId: string, itemId: string, value: string) => {
    if (!isEditable) return; 
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      return {
        ...student,
        items: student.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, result: value };
        })
      };
    }));
  };

  const handleUpdateNote = (studentId: string, itemId: string, value: string) => {
    if (!isEditable) return; 
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      return {
        ...student,
        items: student.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, note: value };
        })
      };
    }));
  };

  const handleUpdateSummaryReason = (studentId: string, value: string) => {
    if (!isEditable) return;
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      return {
        ...student,
        summary: { ...student.summary, finalReason: value }
      };
    }));
  };

  const handleToggleSelectStudent = (studentId: string) => {
    if (!isEditable) return;
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Master View Lock Selection Logic
  const handleToggleClassLockSelection = (className: string) => {
      if (finalizedClasses.includes(className)) return; // Already locked
      setSelectedClassesForLock(prev => 
          prev.includes(className)
            ? prev.filter(c => c !== className)
            : [...prev, className]
      );
  };

  const handleBatchFinalize = () => {
      if (selectedClassesForLock.length === 0) return;
      setFinalizedClasses(prev => [...new Set([...prev, ...selectedClassesForLock])]);
      setSelectedClassesForLock([]);
      setShowSuccessModal(true);
  };


  // ACTIONS

  // 0. INIT Actions
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
        // Mock refreshing data
        setStudents(getInitialData()); 
    }, 1000);
  }

  const handleStartProcess = () => {
      setShowStartConfirmModal(true);
  }

  const handleOpenRegistration = (studentId: string) => {
    setEditingStudentId(studentId);
    const student = students.find(s => s.id === studentId);
    if (student) {
      const initialTemp: Record<string, boolean> = {};
      student.items.forEach(item => {
        initialTemp[item.id] = !!item.isRegistered;
      });
      setTempRegistration(initialTemp);
      setShowRegistrationModal(true);
    }
  };

  const handleConfirmRegistration = () => {
    if (!editingStudentId) return;
    const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format
    setStudents(prev => prev.map(student => {
      if (student.id !== editingStudentId) return student;
      return {
        ...student,
        items: student.items.map(item => {
          const isConduct = item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm';
          // If it's conduct, keep its previous registration state (or we could force it to true)
          // For now, let's keep it as is, but since it's hidden from modal, tempRegistration won't have it unless initialized.
          const isRegistered = isConduct ? !!item.isRegistered : !!tempRegistration[item.id];
          
          return {
            ...item,
            isRegistered: isRegistered,
            registrationDate: isRegistered ? (item.registrationDate || today) : undefined
          };
        })
      };
    }));
    setShowRegistrationModal(false);
    setEditingStudentId(null);
    setToast({ message: 'Đăng ký môn thành công', type: 'success' });
  };

  const confirmStartProcess = () => {
      setProcessStatus('DRAFT');
      setCurrentStep(1);
      setShowStartConfirmModal(false);
  }

  // 1. Teacher Sends to Principal (Step 3) - Trigger Modal
  const handleSendToPrincipalClick = () => {
    if (processStatus !== 'DRAFT') return;
    setShowSendWarningModal(true);
  };

  // 1b. Actually Confirm Send
  const confirmSendToPrincipal = () => {
     setProcessStatus('SUBMITTED');
     setCurrentStep(4);
     setShowSendWarningModal(false);
  };
  
  // New Action: Step 2 Confirmation
  const handleStep2ContinueClick = () => {
    // Validate that all students have results for all registered items
    for (const student of filteredStudents) {
      for (const item of student.items) {
        if (item.isRegistered && (!item.result || item.result.trim() === '')) {
          const isConduct = item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm';
          const typeName = isConduct ? 'Rèn luyện hạnh kiểm' : 'Thi lại môn học';
          setValidationMessage(`Thầy/ Cô chưa nhập kết quả ${typeName} của học sinh ${student.fullName}. Vui lòng nhập đủ kết quả!`);
          setShowValidationModal(true);
          return;
        }
      }
    }
    setShowStep2ConfirmModal(true);
  };

  const confirmStep2Continue = () => {
    setCurrentStep(3);
    setShowStep2ConfirmModal(false);
  };

  // 2. Principal Approves (Step 4)
  const handleApproveSelected = () => {
    // Only proceed if Principal
    if (currentUser.role !== 'Hiệu trưởng') return;

    // Check if selection is empty
    if (selectedStudentIds.length === 0) {
        setShowNoSelectionModal(true);
        return;
    }

    if (selectedStudentIds.length > 0) {
      setStudents(prev => prev.map(student => {
        if (selectedStudentIds.includes(student.id)) {
          return { ...student, isApprovedByPrincipal: true };
        }
        return student;
      }));
      setSelectedStudentIds([]);
    }
    
    // Change Status to APPROVED
    setProcessStatus('APPROVED');
    setShowApprovalModal(true);
  };

  // 2b. Principal Continues (Step 4 -> 5)
  // New handler for clicking "Continue" without necessarily approving via checkbox
  const handlePrincipalStep4Continue = () => {
     // If status is not yet APPROVED or FINALIZED, upgrade it to APPROVED so Step 5 actions are enabled.
     if (processStatus === 'SUBMITTED' || processStatus === 'DRAFT') {
         setProcessStatus('APPROVED');
     }
     setCurrentStep(5);
  };

  // 3. Principal Finalizes (Step 5) - SINGLE CLASS from Detail View
  const handleFinalizeSingleClass = () => {
     // Only proceed if Principal and Status is APPROVED
     if (currentUser.role !== 'Hiệu trưởng' || processStatus !== 'APPROVED') return;

     // Ensure a specific class is selected
     if (selectedClass === 'ALL') {
        alert("Vui lòng chọn một lớp cụ thể để chốt sổ!");
        return;
     }

     // Add current selected class to finalized list
     if (!finalizedClasses.includes(selectedClass)) {
         setFinalizedClasses(prev => [...prev, selectedClass]);
     }
     
     setShowSuccessModal(true);
  }

  // 4. Principal View Details in Step 5
  const handleViewDetails = (className: string) => {
      // 1. Set the global selected class so filters work
      setSelectedClass(className);
      // 2. Switch View
      setStep5View('detail');
  };

  const isStep1Complete = useMemo(() => {
    // Check if ALL students who have failing subjects have registered at least one subject
    return filteredStudents.every(student => 
      student.items.some(item => item.isRegistered)
    );
  }, [filteredStudents]);

  // --- RENDER HELPERS ---

  // Check if we should show the "Waiting for Principal" screen for Teacher at Step 4
  const showTeacherWaitingScreen = currentUser.id === 'teacher' && currentStep === 4 && (processStatus === 'DRAFT' || processStatus === 'SUBMITTED');

  // Check if we should show the "Not Finalized" screen for Teacher at Step 5
  // Updated: Checks if Teacher's class (11A5) is in the finalizedClasses list
  const showTeacherNotFinalizedScreen = currentUser.id === 'teacher' && currentStep === 5 && !finalizedClasses.includes('11A5');

  // NEW: Check if we should show the "Waiting for Teacher" screen for Principal in Steps 1, 2, 3
  const showPrincipalWaitingForTeacher = currentUser.id === 'principal' && currentStep <= 3 && processStatus === 'INIT';


  // Badge Color helper for Status
  const getStatusBadge = () => {
    // For Principal viewing Step 5, show status specific to selected class
    if (currentUser.id === 'principal' && currentStep === 5 && selectedClass !== 'ALL' && finalizedClasses.includes(selectedClass)) {
         return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">Lớp {selectedClass} đã chốt sổ</span>;
    }

    switch (processStatus) {
      case 'INIT': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500 text-white border border-gray-600">Khởi tạo</span>;
      case 'DRAFT': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">Đang nhập liệu</span>;
      case 'SUBMITTED': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 animate-pulse">Chờ duyệt</span>;
      case 'APPROVED': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">Đã duyệt</span>;
      case 'FINALIZED': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">Đã chốt sổ</span>; // Global Fallback
    }
  };

  const getHeaderContent = () => {
    // Dynamic Class Name Logic
    const targetClass = currentUser.id === 'teacher' ? '11A5' : (selectedClass === 'ALL' ? '...' : selectedClass);

    switch (currentStep) {
      case 1:
        return { title: `Rèn luyện hè - Lớp ${targetClass}`, desc: 'Đăng ký môn thi lại cho học sinh' };
      case 2:
        return { title: 'Tổng hợp kết quả xét lên lớp', desc: 'Kiểm tra và chốt kết quả xét lên lớp sau rèn luyện' };
      case 3:
        return { title: 'Tổng hợp kết quả sau thi lại', desc: 'Kết quả đánh giá lại của môn học được sử dụng thay thế cho kết quả học tập cả năm học của môn học đó để xét lên lớp theo quy định của thông tư 22' };
      case 4:
        return { title: 'Hiệu trưởng xét duyệt', desc: 'Hiệu trưởng xét duyệt cho những học sinh không đủ điều kiện lên lớp sau rèn luyện lại' };
      case 5:
        return { title: 'Chốt sổ kết quả rèn luyện hè', desc: 'Danh sách chính thức học sinh lên lớp và ở lại lớp sau xét duyệt' };
      default:
        return { title: 'Khóa sổ', desc: '' };
    }
  };
  const headerInfo = getHeaderContent();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans relative">
      
      {/* Modals */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-md shadow-xl w-full max-w-[480px] transform transition-all scale-100 py-12 px-10 flex flex-col items-center justify-center text-center">
             <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
             <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50"><CheckCircle className="w-12 h-12 text-green-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Chốt sổ {selectedClassesForLock.length > 0 ? `${selectedClassesForLock.length} lớp` : (selectedClass !== 'ALL' ? `lớp ${selectedClass}` : '')} thành công!</h3>
             <p className="text-gray-500 text-center mb-8">Dữ liệu kết quả rèn luyện hè của lớp đã được lưu trữ vào hệ thống.</p>
             <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">Đóng</button>
          </div>
        </div>
      )}

      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-md shadow-xl w-full max-w-[400px] transform transition-all scale-100 py-16 px-8 flex flex-col items-center justify-center text-center">
             <button onClick={() => setShowApprovalModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
             <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50"><CheckCircle className="w-12 h-12 text-blue-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900">Đã phê duyệt!</h3>
          </div>
        </div>
      )}

      {showNoSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-12 px-10 flex flex-col items-center justify-center text-center">
             <button onClick={() => setShowNoSelectionModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
             <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-yellow-50/50"><AlertCircle className="w-12 h-12 text-yellow-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa chọn học sinh</h3>
             <p className="text-gray-500 text-center mb-8">Chưa chọn học sinh nào để duyệt.</p>
             <button onClick={() => setShowNoSelectionModal(false)} className="w-full py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">Đóng</button>
          </div>
        </div>
      )}

      {showSendWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-10 px-8 flex flex-col items-center justify-center text-center">
                <button onClick={() => setShowSendWarningModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-yellow-50/50">
                   <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận gửi duyệt</h3>
                <p className="text-gray-500 text-center mb-8 px-2">
                    Kết quả rèn luyện lại của học sinh sau khi gửi cho Hiệu trưởng sẽ không được chỉnh sửa nữa.
                </p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setShowSendWarningModal(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                        Kiểm tra lại
                    </button>
                    <button 
                        onClick={confirmSendToPrincipal} 
                        className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                        Gửi
                    </button>
                </div>
            </div>
        </div>
      )}
      
      {/* STEP 2 VALIDATION MODAL */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-10 px-8 flex flex-col items-center justify-center text-center">
                <button onClick={() => setShowValidationModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
                   <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thiếu thông tin</h3>
                <p className="text-gray-500 text-center mb-8 px-2">
                    {validationMessage}
                </p>
                <button 
                    onClick={() => setShowValidationModal(false)} 
                    className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                    Đóng
                </button>
            </div>
        </div>
      )}

      {/* STEP 1 CONFIRM MODAL */}
      {showStep1ConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-10 px-8 flex flex-col items-center justify-center text-center">
                <button onClick={() => setShowStep1ConfirmModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-yellow-50/50">
                   <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận chốt danh sách</h3>
                <p className="text-gray-500 text-center mb-8 px-2">
                    Sau khi chốt danh sách các môn cho học sinh thi lại, giáo viên sẽ không thể chỉnh sửa nữa.
                </p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setShowStep1ConfirmModal(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={() => {
                            setShowStep1ConfirmModal(false);
                            setCurrentStep(2);
                        }} 
                        className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* STEP 2 CONFIRM MODAL */}
      {showStep2ConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-10 px-8 flex flex-col items-center justify-center text-center">
                <button onClick={() => setShowStep2ConfirmModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-yellow-50/50">
                   <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận tổng hợp kết quả</h3>
                <p className="text-gray-500 text-center mb-8 px-2">
                    Vui lòng kiểm tra kĩ thông tin điểm và kết quả sau thi lại. Sau khi xác nhận , Thầy Cô sẽ không thể thực hiện chỉnh sửa điểm nữa.
                </p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setShowStep2ConfirmModal(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={confirmStep2Continue} 
                        className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* START PROCESS CONFIRM MODAL */}
      {showStartConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-md shadow-xl w-full max-w-[450px] transform transition-all scale-100 py-10 px-8 flex flex-col items-center justify-center text-center">
                <button onClick={() => setShowStartConfirmModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
                   <Lock className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Khởi tạo quy trình rèn luyện hè</h3>
                <p className="text-gray-500 text-center mb-8 px-2">
                    <span className="text-red-600">Sổ điểm chính của năm học sẽ bị KHÓA</span> để đảm bảo tính nhất quán dữ liệu trong quá trình rèn luyện lại. Bạn có chắc chắn muốn tiếp tục?
                </p>
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => setShowStartConfirmModal(false)} 
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={confirmStartProcess} 
                        className="flex-1 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* REGISTRATION MODAL (Step 1) */}
      {showRegistrationModal && editingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all scale-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Đăng ký môn thi lại - {students.find(s => s.id === editingStudentId)?.fullName}</h3>
              <button onClick={() => setShowRegistrationModal(false)} className="text-white/80 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                          checked={(() => {
                            const student = students.find(s => s.id === editingStudentId);
                            if (!student) return false;
                            const visibleItems = student.items.filter(item => !(item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm'));
                            if (visibleItems.length === 0) return false;
                            return visibleItems.every(item => tempRegistration[item.id]);
                          })()}
                          onChange={(e) => {
                            const isConduct = (item: any) => item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm';
                            const visibleItems = students.find(s => s.id === editingStudentId)?.items.filter(item => !isConduct(item)) || [];
                            const allVisibleChecked = visibleItems.every(item => tempRegistration[item.id]);
                            
                            const checked = e.target.checked;
                            const newTemp = { ...tempRegistration };
                            visibleItems.forEach(item => {
                              newTemp[item.id] = checked;
                            });
                            setTempRegistration(newTemp);
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Môn học</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">TBM trước thi lại</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.find(s => s.id === editingStudentId)?.items
                      .filter(item => !(item.category === 'RÈN LUYỆN' || item.subjectName === 'Hạnh kiểm'))
                      .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={!!tempRegistration[item.id]}
                            onChange={() => setTempRegistration(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.subjectName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded font-bold text-xs border border-red-100">
                                {item.currentScore}
                            </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                            {tempRegistration[item.id] ? (item.registrationDate || new Date().toLocaleDateString('en-GB')) : '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowRegistrationModal(false)} 
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmRegistration}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
          fixed lg:static inset-y-0 left-0 z-30 h-full bg-[#0f172a] shadow-xl transition-all duration-300 ease-in-out flex-shrink-0 border-r border-gray-800
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:w-0 lg:translate-x-0 lg:overflow-hidden'}
      `}>
         <div className="w-64 h-full">
           <Sidebar />
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex-shrink-0 z-40 px-4 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20} /></button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900 truncate">Sổ ghi điểm</h1>
              <div className="hidden sm:block">{getStatusBadge()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors hidden sm:block"><Search size={20} /></button>
             <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors hidden sm:block"><Maximize size={20} /></button>
             <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative"><Bell size={20} /><span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
             <button className="hidden sm:flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm ml-2"><ArrowLeft size={16} /> Quay lại trang chủ</button>

             {/* User Switcher */}
             <div className="relative ml-2" ref={userMenuRef}>
                <div onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>{currentUser.initial}</div>
                    <div className="hidden lg:flex flex-col items-start leading-none mr-2">
                        <span className="text-sm font-bold text-gray-800">{currentUser.name}</span>
                        <span className="text-xs text-gray-500">{currentUser.role}</span>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </div>
                {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">GIẢ LẬP: CHUYỂN ĐỔI TÀI KHOẢN</h3>
                            <p className="text-xs text-gray-400">Chọn user để test phân quyền dữ liệu</p>
                        </div>
                        <div className="py-2">
                            {MOCK_USERS.map((user) => (
                                <button key={user.id} onClick={() => { setCurrentUser(user); setUserMenuOpen(false); }} className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${currentUser.id === user.id ? 'bg-blue-50/50' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 ${user.avatarColor} flex items-center justify-center text-white font-bold`}>{user.initial}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.role}</p>
                                    </div>
                                    {currentUser.id === user.id && <Check size={18} className="text-blue-600" />}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 p-2">
                             <button onClick={handleResetDemo} className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors mb-1"><RotateCcw size={16} /> Reset Dữ liệu Demo</button>
                             <button className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"><LogOut size={16} /> Đăng xuất</button>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 w-full bg-gray-100">
          <div className="w-full pb-20">
            
            {/* CONDITIONAL RENDER: Step 0 (INIT) vs The Rest */}
            {processStatus === 'INIT' && currentUser.id === 'teacher' ? (
                // --- STEP 0: INIT SCREEN (Teacher Only) ---
                <InitializationScreen 
                    students={filteredStudents}
                    isSyncing={isSyncing}
                    onSync={handleSync}
                    onStart={handleStartProcess}
                />
            ) : (
                // --- EXISTING 5-STEP PROCESS ---
                <>
                    <div className="mb-6">
                    <Stepper 
                        steps={STEPS} 
                        currentStep={currentStep} 
                        onStepClick={(step) => { if (step <= maxStepAllowed) setCurrentStep(step); }}
                        maxStepAllowed={maxStepAllowed}
                    />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-white rounded-t-lg border-b border-gray-200 shadow-sm transition-all">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{headerInfo.title}</h2>
                                    <p className={`mt-1 text-sm ${(currentStep === 3 || currentStep === 4 || currentStep === 5) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                        {headerInfo.desc}
                                        {currentStep === 5 && (
                                            <span className="block mt-1">
                                                Thầy Cô vui lòng thực hiện Chốt sổ để hệ thống cập nhật lại danh sách cho năm học tới , đồng thời phục vụ cho việc sử dụng Sổ theo dõi và Học bạ số
                                            </span>
                                        )}
                                    </p>
                                </div>
                                {/* Header Buttons Removed */}
                            </div>
                        </div>

                        {/* --- FILTER BAR (VISIBLE IN STEPS 1-4 & STEP 5 MASTER) --- */}
                        {currentUser.id === 'principal' && (currentStep !== 5 || step5View !== 'detail') && (
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm whitespace-nowrap">
                                    <Eye size={20} className="text-blue-600" />
                                    <span>Đang xem dữ liệu của:</span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    {/* Dropdown 1: Grade */}
                                    <select 
                                        value={selectedGrade}
                                        onChange={(e) => {
                                            const newGrade = e.target.value;
                                            setSelectedGrade(newGrade);
                                            // Always select first valid class of new grade
                                            let newClassOptions = CLASSES[newGrade] || [];
                                            if (currentStep === 4) {
                                                newClassOptions = newClassOptions.filter(c => submittedClasses.includes(c));
                                            }
                                            setSelectedClass(newClassOptions[0] || '');
                                        }}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-40 p-2.5"
                                    >
                                        {gradeOptions.map(grade => (
                                            <option key={grade.value} value={grade.value}>{grade.label}</option>
                                        ))}
                                    </select>

                                    {/* Dropdown 2: Class - Only show if NOT in Step 5 (Master View) */}
                                    {currentStep !== 5 && (
                                    <select 
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-40 p-2.5"
                                    >
                                        {classOptions.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                    )}
                                </div>

                                {/* Right: Class Status Badge - Hide in Step 5 Master View */}
                                {currentStep !== 5 && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Trạng thái lớp:</span>
                                    {(() => {
                                        const status = getClassStatus(selectedClass);
                                        return (
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                )}
                            </div>
                        )}
                        
                        {/* --- DETAIL VIEW HEADER (STEP 5 DETAIL) - CONTEXT DISPLAY --- */}
                        {currentStep === 5 && step5View === 'detail' && (
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-right-4">
                                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm whitespace-nowrap">
                                    <Eye size={20} className="text-blue-600" />
                                    <span>Đang xem dữ liệu chi tiết lớp:</span>
                                    <span className="bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded-md ml-2">{selectedClass}</span>
                                </div>
                                
                                {/* Right: Class Status Badge */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:inline">Trạng thái lớp:</span>
                                    {(() => {
                                        const status = getClassStatus(selectedClass);
                                        return (
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                        {/* -------------------------------------------------- */}

                        <div className="p-4 sm:p-6 min-h-[400px]">
                            {/* 1. TEACHER BLOCKING SCREENS */}
                            {showTeacherWaitingScreen && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                        <Clock className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Hồ sơ đang chờ xét duyệt</h3>
                                    <p className="text-gray-500 max-w-md text-center">Bạn đã gửi hồ sơ thành công. Vui lòng chờ Hiệu trưởng kiểm tra và phê duyệt kết quả. Bạn sẽ nhận được thông báo khi hoàn tất.</p>
                                </div>
                            )}

                            {showTeacherNotFinalizedScreen && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white">
                                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                        <FileText className="w-10 h-10 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có kết quả chốt sổ</h3>
                                    <p className="text-gray-500 max-w-md text-center">Quy trình xét duyệt chưa hoàn tất hoặc chưa được chốt sổ bởi Hiệu trưởng. Vui lòng quay lại sau.</p>
                                </div>
                            )}

                            {/* 2. PRINCIPAL BLOCKING SCREEN (Steps 1-3 when Status is INIT) */}
                            {showPrincipalWaitingForTeacher && (
                                <div className="flex flex-col items-center justify-center py-20 bg-white">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                        <Clock className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Giáo viên chủ nhiệm chưa thực hiện chốt danh sách rèn luyện hè</h3>
                                    <p className="text-gray-500 max-w-md text-center">
                                       Dữ liệu rèn luyện hè đang ở trạng thái <b>Khởi tạo</b>. Vui lòng chờ Giáo viên chủ nhiệm chốt danh sách học sinh rèn luyện lại để xem dữ liệu.
                                    </p>
                                </div>
                            )}
                            
                            {/* 3. TABLE CONTENT (Only show if NOT blocked) */}
                            {!showTeacherWaitingScreen && !showTeacherNotFinalizedScreen && !showPrincipalWaitingForTeacher && (
                                <>
                                {currentStep === 5 ? (
                                    <>
                                        {/* STEP 5: MASTER VIEW (Summary Table) */}
                                        {step5View === 'master' && (
                                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-blue-800">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase w-16 tracking-wider">STT</th>
                                                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tên lớp</th>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Tổng số HS thi lại/RL hè</th>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Khóa sổ</th>
                                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase w-32 tracking-wider">Xem chi tiết</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {step5SummaryData.map((row, index) => (
                                                                <tr key={row.className} className="hover:bg-blue-50 transition-colors">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">{index + 1}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{row.className}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">{row.count}</td>
                                                                    
                                                                    {/* CHECKBOX LOCK COLUMN */}
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                        <div className="flex justify-center">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                disabled={row.isLocked || processStatus !== 'APPROVED'}
                                                                                checked={row.isLocked || selectedClassesForLock.includes(row.className)}
                                                                                onChange={() => handleToggleClassLockSelection(row.className)}
                                                                                className={`w-5 h-5 rounded border-gray-300 focus:ring-blue-500 ${(row.isLocked || processStatus !== 'APPROVED') ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-blue-600 cursor-pointer'}`}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                                        <button 
                                                                            onClick={() => handleViewDetails(row.className)}
                                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
                                                                            title="Xem danh sách chi tiết"
                                                                        >
                                                                            <Eye size={18} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {step5SummaryData.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                                                        Không có lớp nào trong khối {selectedGrade} có dữ liệu học sinh cần rèn luyện.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 5: DETAIL VIEW (Tabs + Table) */}
                                        {step5View === 'detail' && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                                    <button 
                                                        onClick={() => setStep5Tab('passed')} 
                                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-sm
                                                            ${step5Tab === 'passed' 
                                                                ? 'bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-2' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
                                                    >
                                                        <CheckCircle size={20} className={step5Tab === 'passed' ? 'text-white' : 'text-gray-500'} /> 
                                                        ĐƯỢC LÊN LỚP 
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${step5Tab === 'passed' ? 'bg-white text-green-700' : 'bg-gray-200 text-gray-600'}`}>{passedCount}</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setStep5Tab('failed')} 
                                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-sm
                                                            ${step5Tab === 'failed' 
                                                                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-2' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
                                                    >
                                                        <XCircle size={20} className={step5Tab === 'failed' ? 'text-white' : 'text-gray-500'} /> 
                                                        CHƯA ĐƯỢC LÊN LỚP 
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${step5Tab === 'failed' ? 'bg-white text-red-700' : 'bg-gray-200 text-gray-600'}`}>{failedCount}</span>
                                                    </button>
                                                </div>
                                                <div>
                                                    {step5Tab === 'passed' && <ReExamTable students={filteredStudents} activeTab={displayTab} filterMode="passed" showReasonInput={false} readOnlyReason={true} readOnlyInput={true} />}
                                                    {step5Tab === 'failed' && <ReExamTable students={filteredStudents} activeTab={displayTab} filterMode="failed" showReasonInput={true} readOnlyReason={true} readOnlyInput={true} />}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                        <>
                                        {currentStep === 1 && (
                                            <div className="bg-[#FFFBEB] border border-yellow-200 p-4 rounded-md flex items-start gap-3 mb-6">
                                                <div className="text-yellow-600 mt-0.5">
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-yellow-800 font-bold text-sm uppercase">Lưu ý quan trọng</h4>
                                                    <p className="text-yellow-700 text-sm mt-1">
                                                        Danh sách chỉ bao gồm học sinh có điểm trung bình môn <strong>&lt; 5.0</strong>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 2 && (
                                            <>
                                            <div className="bg-[#FFFBEB] border border-yellow-200 p-4 rounded-md flex items-start gap-3 mb-6">
                                                <div className="text-yellow-600 mt-0.5">
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-yellow-800 font-bold text-sm uppercase">Lưu ý quan trọng</h4>
                                                    <p className="text-yellow-700 text-sm mt-1">
                                                        Danh sách chỉ bao gồm học sinh có điểm trung bình môn <strong>&lt; 5.0</strong> hoặc Hạnh kiểm xếp loại <strong>"Chưa đạt"</strong>.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 mb-6">
                                                <button
                                                    onClick={() => setStep2Tab('academic')}
                                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                                                        step2Tab === 'academic' 
                                                        ? 'bg-[#21409A] text-white shadow-md' 
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <BookOpen size={18} />
                                                    Thi lại môn học
                                                </button>
                                                <button
                                                    onClick={() => setStep2Tab('conduct')}
                                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                                                        step2Tab === 'conduct' 
                                                        ? 'bg-[#21409A] text-white shadow-md' 
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <Award size={18} />
                                                    Rèn luyện hạnh kiểm
                                                </button>
                                            </div>
                                            </>
                                        )}
                                        <ReExamTable 
                                            students={currentStep === 2 ? step2FilteredStudents : filteredStudents} 
                                            activeTab={displayTab} 
                                            onUpdateResult={handleUpdateResult}
                                            onUpdateNote={handleUpdateNote}
                                            onUpdateSummaryReason={handleUpdateSummaryReason}
                                            isConductTab={currentStep === 2 && step2Tab === 'conduct'}
                                            filterMode={currentStep === 4 ? "failed" : "all"}
                                            showReasonInput={currentStep === 4}
                                            // Step 4: Always read-only for Reason input
                                            readOnlyReason={currentStep === 4 ? true : !isEditable}
                                            readOnlyInput={currentStep === 2 ? !isEditable : true}
                                            hideInputColumn={currentStep === 1}
                                            enableSelection={isEditable && currentStep === 4}
                                            selectedIds={selectedStudentIds}
                                            onToggleSelect={handleToggleSelectStudent}
                                            onToggleSelectAll={handleToggleSelectAll}
                                            isAllSelected={isAllSelected}
                                            // FIX: Ignore Principal Approval in Step 3 so the list looks "Failed" even if approved later
                                            ignorePrincipalApproval={currentStep === 3}
                                            allowApprovedInFailedList={currentStep === 4}
                                            onOpenRegistration={handleOpenRegistration}
                                            onlyRegisteredItems={currentStep === 2 && step2Tab !== 'conduct'}
                                        />
                                        </>
                                )}
                                {/* Text "Last updated" Removed from here */}
                                </>
                            )}
                        </div>

                        {/* UNIFIED FOOTER ACTIONS (Bottom) */}
                        {!showTeacherWaitingScreen && !showTeacherNotFinalizedScreen && !showPrincipalWaitingForTeacher && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                                {/* Left: Last Updated Text */}
                                <div className="text-xs text-gray-400 italic text-left">
                                    * Dữ liệu được cập nhật lần cuối: 10/06/2024 08:30
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-3">
                                    {currentStep > 1 && currentStep !== 5 && (
                                        <button 
                                            onClick={() => setCurrentStep(prev => prev - 1)} 
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm"
                                        >
                                            <ChevronLeft size={16} /> Quay lại
                                        </button>
                                    )}

                                    {/* TEACHER ACTIONS */}
                                    {currentUser.id === 'teacher' && (
                                        <>
                                            {/* EDIT MODE ACTIONS */}
                                            {isEditable && currentStep === 1 && (
                                                <button onClick={() => setShowStep1ConfirmModal(true)} disabled={!isStep1Complete} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-sm text-sm transition-colors ${isStep1Complete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Chốt danh sách đăng ký <ChevronRight size={16} /></button>
                                            )}
                                            {isEditable && currentStep === 2 && (
                                                <button onClick={handleStep2ContinueClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">Xác nhận & Tiếp tục <ChevronRight size={16} /></button>
                                            )}
                                            {isEditable && currentStep === 3 && (
                                                <button onClick={handleSendToPrincipalClick} className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 transition-colors shadow-sm text-sm"><Send size={16} /> Gửi lên Hiệu trưởng</button>
                                            )}
                                            
                                            {/* READ ONLY MODE ACTIONS (View Next) */}
                                            {!isEditable && currentStep < 5 && (
                                                    <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm">Xem tiếp <ChevronRight size={16} /></button>
                                            )}
                                        </>
                                    )}

                                    {/* PRINCIPAL ACTIONS */}
                                    {currentUser.id === 'principal' && (
                                        <>
                                            {currentStep < 4 && (
                                                    <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm">Xem tiếp <ChevronRight size={16} /></button>
                                            )}
                                            
                                            {/* Principal Step 4 Actions */}
                                            {currentStep === 4 && isEditable && (
                                                <>
                                                    <button 
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm text-sm"
                                                    >
                                                        <RotateCcw size={16} /> Khôi phục dữ liệu gốc
                                                    </button>
                                                    <button onClick={handleApproveSelected} className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm text-sm`}>
                                                        <CheckSquare size={16} /> Duyệt lên lớp
                                                    </button>
                                                    <button onClick={handlePrincipalStep4Continue} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm">
                                                        Tiếp tục <ChevronRight size={16} />
                                                    </button>
                                                </>
                                            )}

                                            {/* STEP 5 MASTER VIEW BATCH ACTION */}
                                            {currentStep === 5 && step5View === 'master' && (
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={handleBatchFinalize} 
                                                        disabled={selectedClassesForLock.length === 0 || processStatus !== 'APPROVED'}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors shadow-sm text-sm ${
                                                            (selectedClassesForLock.length === 0 || processStatus !== 'APPROVED')
                                                                ? 'bg-gray-300 text-white cursor-not-allowed' 
                                                                : 'bg-red-600 text-white hover:bg-red-700'
                                                        }`}
                                                    >
                                                        <Lock size={16} /> 
                                                        {selectedClassesForLock.length > 0 ? `Chốt sổ (${selectedClassesForLock.length}) lớp đã chọn` : `Chốt sổ`}
                                                    </button>
                                                </div>
                                            )}

                                            {/* STEP 5 DETAIL VIEW ACTIONS (MOVED HERE) */}
                                            {currentStep === 5 && step5View === 'detail' && (
                                                <div className="flex items-center gap-3">
                                                     <button 
                                                        onClick={() => setStep5View('master')} 
                                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-white hover:border-gray-400 transition-colors shadow-sm text-sm"
                                                    >
                                                        <ChevronLeft size={16} /> Quay lại
                                                    </button>

                                                    <button 
                                                        onClick={handleFinalizeSingleClass}
                                                        disabled={finalizedClasses.includes(selectedClass) || processStatus !== 'APPROVED'}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors shadow-sm text-sm ${
                                                            (finalizedClasses.includes(selectedClass) || processStatus !== 'APPROVED')
                                                                ? 'bg-gray-300 text-white cursor-not-allowed' 
                                                                : 'bg-red-600 text-white hover:bg-red-700'
                                                        }`}
                                                    >
                                                        <Lock size={16} />
                                                        {finalizedClasses.includes(selectedClass) ? `Đã chốt sổ lớp ${selectedClass}` : `Chốt sổ lớp ${selectedClass}`}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

          </div>
        </main>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <AlertCircle size={20} />}
          {toast.type === 'info' && <Info size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
      </div>
    </div>
  );
}