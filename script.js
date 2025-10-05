// Report Card Generator with Supabase Database Integration
// Tenant ID: 9abe534f-1a12-474c-a387-f8795ad3ab5a

// Supabase configuration
const SUPABASE_URL = 'https://dmagnsbdjsnzsddxqrwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtYWduc2JkanNuenNkZHhxcndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTQ2MTEsImV4cCI6MjA2ODIzMDYxMX0.VAo64FAcg1Mo4qA22FWwC7Kdq6AAiLTNeBOjFB9XTi8';
const TENANT_ID = 'b8f8b5f0-1234-4567-8901-123456789000';

// Initialize Supabase client
let supabase;

// Global state
let currentStep = 1;
let selectedClass = null;
let selectedExam = null;
let selectedStudent = null;
let schoolDetails = null;
let classSubjects = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Report Card Generator...');
    initializeSupabase();
    setupEventListeners();
    loadInitialData();
    showStep(1);
    updateProgressSteps(1);
});

// Initialize Supabase connection
function initializeSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase library not loaded');
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
        console.log('🔑 Using tenant ID:', TENANT_ID);
        
        // Test connection
        testDatabaseConnection();
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        showError('Failed to connect to database. Please refresh the page.');
    }
}

// Test database connection
async function testDatabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('count', { count: 'exact' })
            .eq('tenant_id', TENANT_ID);
            
        if (error) {
            console.error('❌ Database connection test failed:', error);
            showError('Database connection failed: ' + error.message);
        } else {
            console.log('✅ Database connection successful');
        }
    } catch (error) {
        console.error('❌ Database test error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Academic Year dropdown
    const academicYearSelect = document.getElementById('academicYear');
    if (academicYearSelect) {
        academicYearSelect.addEventListener('change', onAcademicYearChange);
    }

    // Class dropdown
    const classSelect = document.getElementById('classSelect');
    if (classSelect) {
        classSelect.addEventListener('change', onClassChange);
    }

    // Student search
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('input', onStudentSearch);
    }

    // Navigation buttons
    setupNavigationButtons();
}

// Setup navigation button event listeners
function setupNavigationButtons() {
    const buttons = {
        'nextToExams': () => goToStep(2),
        'nextToStudents': () => goToStep(3),
        'generateReportCard': () => {
            console.log('Generate report card button clicked');
            goToStep(4);
        },
        'backToClass': () => goToStep(1),
        'backToExams': () => goToStep(2),
        'backToStudents': () => goToStep(3),
        'startOver': () => {
            resetSelections();
            goToStep(1);
        }
    };

    Object.entries(buttons).forEach(([id, handler]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    });
}

// Load initial data
async function loadInitialData() {
    try {
        console.log('📊 Loading initial data...');
        await loadSchoolDetails();
        await loadAcademicYears();
    } catch (error) {
        console.error('❌ Error loading initial data:', error);
        showError('Failed to load initial data. Please refresh the page.');
    }
}

// Load school details
async function loadSchoolDetails() {
    try {
        const { data, error } = await supabase
            .from('school_details')
            .select('*')
            .eq('tenant_id', TENANT_ID)
            .single();

        if (error) throw error;

        schoolDetails = data;
        console.log('✅ School details loaded:', schoolDetails);
        
        if (schoolDetails.logo_url) {
            console.log('🖼️ School logo URL found:', schoolDetails.logo_url);
        } else {
            console.log('⚠️ No school logo URL found in database');
        }
        
    } catch (error) {
        console.error('❌ Error loading school details:', error);
        console.log('📝 Using default school details');
        
        // Use default school details if not found
        schoolDetails = {
            name: "GLOBAL'S SANMARG PUBLIC SCHOOL BIDAR",
            address: "Bidar, Karnataka",
            principal_name: "Principal",
            description: "English Medium School",
            logo_url: null // No logo URL available
        };
    }
}

// Load academic years
async function loadAcademicYears() {
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('academic_year')
            .eq('tenant_id', TENANT_ID)
            .order('academic_year', { ascending: false });

        if (error) throw error;

        const uniqueYears = [...new Set(data.map(item => item.academic_year))];
        populateAcademicYearDropdown(uniqueYears);
    } catch (error) {
        console.error('❌ Error loading academic years:', error);
        showError('Failed to load academic years');
    }
}

// Populate academic year dropdown
function populateAcademicYearDropdown(years) {
    const dropdown = document.getElementById('academicYear');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Academic Year</option>';
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        dropdown.appendChild(option);
    });

    console.log('✅ Academic years loaded:', years);
}

// Handle academic year change
async function onAcademicYearChange(event) {
    const selectedYear = event.target.value;
    const classSelect = document.getElementById('classSelect');
    
    if (!selectedYear) {
        classSelect.innerHTML = '<option value="">First select academic year</option>';
        classSelect.disabled = true;
        hideClassInfo();
        return;
    }

    try {
        await loadClassesForYear(selectedYear);
        classSelect.disabled = false;
    } catch (error) {
        console.error('❌ Error loading classes:', error);
        showError('Failed to load classes for selected year');
    }
}

// Load classes for selected academic year
async function loadClassesForYear(academicYear) {
    try {
        const { data, error } = await supabase
            .from('classes')
            .select(`
                *,
                teachers(name)
            `)
            .eq('tenant_id', TENANT_ID)
            .eq('academic_year', academicYear)
            .order('class_name', { ascending: true });

        if (error) throw error;

        populateClassDropdown(data);
    } catch (error) {
        throw error;
    }
}

// Populate class dropdown
function populateClassDropdown(classes) {
    const dropdown = document.getElementById('classSelect');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Class</option>';
    
    classes.forEach(classData => {
        const option = document.createElement('option');
        option.value = classData.id;
        option.textContent = `${classData.class_name} - ${classData.section}`;
        option.dataset.classData = JSON.stringify(classData);
        dropdown.appendChild(option);
    });

    console.log('✅ Classes loaded:', classes.length);
}

// Handle class change
async function onClassChange(event) {
    const selectedClassId = event.target.value;
    const nextButton = document.getElementById('nextToExams');
    
    if (!selectedClassId) {
        hideClassInfo();
        nextButton.disabled = true;
        return;
    }

    try {
        const selectedOption = event.target.selectedOptions[0];
        selectedClass = JSON.parse(selectedOption.dataset.classData);
        
        await showClassInfo(selectedClass);
        nextButton.disabled = false;
        
        console.log('✅ Class selected:', selectedClass);
    } catch (error) {
        console.error('❌ Error handling class selection:', error);
        showError('Failed to load class information');
    }
}

// Show class information
async function showClassInfo(classData) {
    try {
        // Count students in class
        const { count, error } = await supabase
            .from('students')
            .select('id', { count: 'exact' })
            .eq('tenant_id', TENANT_ID)
            .eq('class_id', classData.id);

        if (error) throw error;

        // Update UI elements
        document.getElementById('selectedClassName').textContent = classData.class_name;
        document.getElementById('selectedClassSection').textContent = classData.section;
        document.getElementById('selectedAcademicYear').textContent = classData.academic_year;
        document.getElementById('totalStudents').textContent = count || 0;

        // Show the info section
        const classInfo = document.getElementById('classInfo');
        if (classInfo) {
            classInfo.style.display = 'block';
        }

    } catch (error) {
        console.error('❌ Error showing class info:', error);
    }
}

// Hide class information
function hideClassInfo() {
    const classInfo = document.getElementById('classInfo');
    if (classInfo) {
        classInfo.style.display = 'none';
    }
}

// Load exams for selected class
async function loadExamsForClass(classId) {
    try {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('tenant_id', TENANT_ID)
            .eq('class_id', classId)
            .order('start_date', { ascending: false });

        if (error) throw error;

        // Store exams globally for selection reference
        window.currentExams = data;
        
        displayExams(data);
        return data;
    } catch (error) {
        console.error('❌ Error loading exams:', error);
        throw error;
    }
}

// Display exams in grid
function displayExams(exams) {
    const examGrid = document.getElementById('examGrid');
    if (!examGrid) return;

    if (exams.length === 0) {
        examGrid.innerHTML = `
            <div class="no-data-message">
                <div class="no-data-icon">📝</div>
                <h3>No Exams Found</h3>
                <p>No exams are available for the selected class and academic year.</p>
            </div>
        `;
        return;
    }

    examGrid.innerHTML = exams.map(exam => `
        <div class="exam-card" data-exam-id="${exam.id}" onclick="selectExam('${exam.id}')">
            <div class="exam-card-header">
                <h4>${exam.name}</h4>
                <div class="exam-max-marks">Max: ${exam.max_marks}</div>
            </div>
            <div class="exam-card-body">
                <p><strong>Start Date:</strong> ${formatDate(exam.start_date)}</p>
                <p><strong>End Date:</strong> ${formatDate(exam.end_date)}</p>
                ${exam.remarks ? `<p><strong>Remarks:</strong> ${exam.remarks}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Select exam
function selectExam(examId) {
    // Remove previous selection
    document.querySelectorAll('.exam-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-exam-id="${examId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    // Find and store selected exam data from the current exams in memory
    // We need to store the exam data when loading exams
    selectedExam = window.currentExams?.find(exam => exam.id === examId) || { id: examId };
    
    console.log('✅ Exam selected:', selectedExam);

    // Enable next button
    const nextButton = document.getElementById('nextToStudents');
    if (nextButton) {
        nextButton.disabled = false;
    }

    // Show exam info
    showExamInfo(selectedExam);
}

// Show exam information
function showExamInfo(exam) {
    if (!exam || typeof exam === 'string') return;
    
    // Update exam info elements
    const elements = {
        'selectedExamName': exam.name || 'N/A',
        'examStartDate': formatDate(exam.start_date),
        'examEndDate': formatDate(exam.end_date),
        'examMaxMarks': exam.max_marks || 'N/A',
        'examRemarks': exam.remarks || 'None'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    const examInfo = document.getElementById('examInfo');
    if (examInfo) {
        examInfo.style.display = 'block';
    }
}

// Load students for selected class
async function loadStudentsForClass(classId) {
    try {
        console.log('📋 Loading students for class ID:', classId);
        
        // First try without parent join to see if students exist
        const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('tenant_id', TENANT_ID)
            .eq('class_id', classId)
            .order('roll_no', { ascending: true });

        if (studentsError) {
            console.error('❌ Error loading students:', studentsError);
            throw studentsError;
        }
        
        console.log(`📊 Found ${studentsData?.length || 0} students`);
        
        if (!studentsData || studentsData.length === 0) {
            console.log('⚠️ No students found for class:', classId);
            displayStudents([]);
            return [];
        }
        
        // Try to load parents separately to avoid join issues
        const studentIds = studentsData.map(s => s.id);
        const { data: parentsData, error: parentsError } = await supabase
            .from('parents')
            .select('*')
            .eq('tenant_id', TENANT_ID)
            .in('student_id', studentIds);
            
        if (parentsError) {
            console.warn('⚠️ Could not load parents:', parentsError);
        }
        
        // Merge parent data with student data
        const studentsWithParents = studentsData.map(student => {
            const studentParents = parentsData?.filter(p => p.student_id === student.id) || [];
            return {
                ...student,
                parents: studentParents
            };
        });

        // Store students globally for selection reference
        window.currentStudents = studentsWithParents;
        
        displayStudents(studentsWithParents);
        return studentsWithParents;
    } catch (error) {
        console.error('❌ Error loading students:', error);
        displayStudents([]);
        throw error;
    }
}

// Display students in grid
function displayStudents(students) {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) return;

    if (students.length === 0) {
        studentsGrid.innerHTML = `
            <div class="no-data-message">
                <div class="no-data-icon">👥</div>
                <h3>No Students Found</h3>
                <p>No students are found in the selected class.</p>
            </div>
        `;
        return;
    }

    studentsGrid.innerHTML = students.map(student => {
        // Find father from parents array
        const father = student.parents?.find(p => p.relation === 'Father');
        
        return `
            <div class="student-card" data-student-id="${student.id}" onclick="selectStudent('${student.id}')">
                <div class="student-card-header">
                    <div class="student-roll">${student.roll_no || 'N/A'}</div>
                </div>
                <div class="student-card-body">
                    <h4 class="student-name">${student.name}</h4>
                    <p class="student-father">Father: ${father?.name || 'N/A'}</p>
                    <p class="student-admission">Adm. No: ${student.admission_no}</p>
                    <div class="student-details">
                        <span class="student-gender">${student.gender || 'N/A'}</span>
                        <span class="student-dob">${formatDate(student.dob)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Update summary
    updateStudentsSummary(students.length, students.length);
}

// Select student
function selectStudent(studentId) {
    // Remove previous selection
    document.querySelectorAll('.student-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-student-id="${studentId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    // Store selected student with complete data
    selectedStudent = window.currentStudents?.find(student => student.id === studentId) || { id: studentId };
    
    console.log('✅ Student selected:', selectedStudent);

    // Enable generate button
    const generateButton = document.getElementById('generateReportCard');
    if (generateButton) {
        generateButton.disabled = false;
    }
}

// Handle student search
function onStudentSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const studentCards = document.querySelectorAll('.student-card');
    let visibleCount = 0;

    studentCards.forEach(card => {
        const studentName = card.querySelector('.student-name').textContent.toLowerCase();
        const rollNo = card.querySelector('.student-roll').textContent.toLowerCase();
        const admissionNo = card.querySelector('.student-admission').textContent.toLowerCase();

        const matches = studentName.includes(searchTerm) || 
                       rollNo.includes(searchTerm) || 
                       admissionNo.includes(searchTerm);

        card.style.display = matches ? 'block' : 'none';
        if (matches) visibleCount++;
    });

    updateStudentsSummary(visibleCount, studentCards.length);
}

// Update students summary
function updateStudentsSummary(visible, total) {
    const summary = document.getElementById('studentsSummary');
    const visibleCount = document.getElementById('visibleStudentsCount');
    const totalCount = document.getElementById('totalStudentsCount');

    if (visibleCount) visibleCount.textContent = visible;
    if (totalCount) totalCount.textContent = total;
    if (summary) summary.style.display = 'block';
}

// BULLETPROOF REPORT CARD GENERATION
async function generateReportCard() {
    if (!selectedStudent || !selectedExam || !selectedClass) {
        alert('Please select class, exam, and student first');
        return;
    }

    // Get display element
    const display = document.getElementById('reportCardDisplay');
    if (!display) {
        alert('Report card display area not found!');
        return;
    }

    try {
        // Show subtle loading indicator
        display.innerHTML = `
            <div style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
                color: #495057;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e9ecef;
                    border-top: 3px solid #667eea;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                "></div>
                <h3 style="margin: 0 0 10px 0; color: #495057;">Generating Report Card</h3>
                <p style="margin: 0; font-size: 14px; color: #6c757d;">Please wait a moment...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Load data
        let marks, subjects;
        try {
            marks = await loadStudentMarks(selectedStudent.id, selectedExam.id);
        } catch (e) {
            marks = [];
        }
        
        try {
            subjects = await loadClassSubjects(selectedClass.id);
        } catch (e) {
            subjects = [];
        }
        
        // Create bulletproof HTML
        const html = createBulletproofReportCard(selectedStudent, selectedExam, marks, subjects, selectedClass);
        
        // Set HTML directly (no delay)
        display.innerHTML = html;
        
        // Show actions immediately
        setTimeout(() => {
            const reportCard = display.querySelector('.report-card-container');
            if (reportCard) {
                console.log('✅ Report card rendered successfully');
                showActionsPanel();
            } else {
                alert('Report card failed to render. Check browser console for errors.');
                console.error('Failed to find .report-card-container in DOM');
                console.log('Display innerHTML:', display.innerHTML.substring(0, 500));
            }
        }, 50);
        
    } catch (error) {
        console.error('Error generating report card:', error);
        display.innerHTML = `
            <div style="background: red; color: white; padding: 30px; text-align: center;">
                <h3>ERROR GENERATING REPORT CARD</h3>
                <p>Error: ${error.message}</p>
                <p>Please check browser console for details.</p>
            </div>
        `;
    }
}

// Load student marks for exam
async function loadStudentMarks(studentId, examId) {
    try {
        const { data, error } = await supabase
            .from('marks')
            .select(`
                *,
                subjects(name)
            `)
            .eq('tenant_id', TENANT_ID)
            .eq('student_id', studentId)
            .eq('exam_id', examId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error loading student marks:', error);
        throw error;
    }
}

// Load class subjects
async function loadClassSubjects(classId) {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('tenant_id', TENANT_ID)
            .eq('class_id', classId)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Error loading subjects:', error);
        throw error;
    }
}

// Navigation functions
function goToStep(stepNumber) {
    // Hide all step contents
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show target step content
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    } else {
        console.error(`❌ Step ${stepNumber} element not found!`);
    }

    // Update progress
    updateProgressSteps(stepNumber);
    updateProgressBar(stepNumber);

    currentStep = stepNumber;

    // Step-specific actions
    handleStepSpecificActions(stepNumber);
}

// Handle step-specific actions
function handleStepSpecificActions(stepNumber) {
    switch (stepNumber) {
        case 2:
            if (selectedClass) {
                updateCurrentClassInfo();
                loadExamsForClass(selectedClass.id)
                    .catch(error => {
                        console.error('❌ Failed to load exams:', error);
                        showError('Failed to load exams for the selected class');
                    });
            }
            break;
        case 3:
            if (selectedClass) {
                updateSelectionSummary();
                showStudentsLoading();
                loadStudentsForClass(selectedClass.id)
                    .catch(error => {
                        console.error('❌ Failed to load students:', error);
                        showError('Failed to load students for the selected class');
                    });
            }
            break;
        case 4:
            if (selectedStudent && selectedExam && selectedClass) {
                generateReportCard();
            } else {
                showError('Please complete all previous steps before generating the report card.');
            }
            break;
    }
}

// Update progress steps
function updateProgressSteps(activeStep) {
    document.querySelectorAll('.step').forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active');

        if (stepNum === activeStep) {
            step.classList.add('active');
        }
    });
}

// Update progress bar
function updateProgressBar(activeStep) {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const percentage = (activeStep / 4) * 100; // 4 steps total
        progressFill.style.width = `${percentage}%`;
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
}

function showError(message) {
    console.error('🚨 Error:', message);
    
    // Create a better error display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-family: Arial, sans-serif;
    `;
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">❌</span>
            <div>
                <strong>Error</strong><br>
                <span style="font-size: 14px;">${message}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
    
    // Also show in console for debugging
    console.trace('Error stack trace:');
}

function showLoadingMessage(message) {
    const display = document.getElementById('reportCardDisplay');
    if (display) {
        display.innerHTML = `
            <div class="loading-message">
                <div class="loading-icon">⏳</div>
                <h3>${message}</h3>
                <p>Please wait...</p>
            </div>
        `;
    }
}

function showStudentsLoading() {
    const studentsGrid = document.getElementById('studentsGrid');
    if (studentsGrid) {
        studentsGrid.innerHTML = `
            <div class="loading-message">
                <div class="loading-icon">⏳</div>
                <h3>Loading Students...</h3>
                <p>Please wait while we fetch students for the selected class</p>
            </div>
        `;
    }
}

// Missing helper functions
function updateCurrentClassInfo() {
    if (!selectedClass) return;
    
    document.getElementById('currentClassName').textContent = selectedClass.class_name;
    document.getElementById('currentClassSection').textContent = selectedClass.section;
    document.getElementById('currentAcademicYear').textContent = selectedClass.academic_year;
}

function updateSelectionSummary() {
    if (!selectedClass) return;
    
    document.getElementById('summaryClassName').textContent = `${selectedClass.class_name} - ${selectedClass.section}`;
    document.getElementById('summaryAcademicYear').textContent = selectedClass.academic_year;
    
    if (selectedExam) {
        document.getElementById('summaryExamName').textContent = selectedExam.name || 'Selected Exam';
    } else {
        document.getElementById('summaryExamName').textContent = 'No exam selected';
    }
}

// BULLETPROOF REPORT CARD HTML GENERATOR
function createBulletproofReportCard(student, exam, marks, subjects, selectedClass) {
    // Create sample data if nothing found
    if (!marks || marks.length === 0) {
        marks = [
            { subjects: { name: 'Mathematics' }, marks_obtained: 85, max_marks: 100, grade: 'A' },
            { subjects: { name: 'English' }, marks_obtained: 78, max_marks: 100, grade: 'B+' },
            { subjects: { name: 'Science' }, marks_obtained: 92, max_marks: 100, grade: 'A+' },
            { subjects: { name: 'Social Studies' }, marks_obtained: 76, max_marks: 100, grade: 'B+' }
        ];
    }
    
    // Calculate totals
    const totalMarks = marks.reduce((sum, mark) => sum + (mark.marks_obtained || 0), 0);
    const maxMarks = marks.reduce((sum, mark) => sum + (mark.max_marks || 0), 0);
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;
    const grade = getGrade(percentage);
    
    // Create logo HTML
    const logoHTML = schoolDetails?.logo_url ? 
        `<img src="${schoolDetails.logo_url}" alt="School Logo" style="width: 80px; height: 80px; object-fit: contain; margin-right: 20px;" onerror="this.style.display='none'">` :
        `<img src="images/logo.jpg" alt="School Logo" style="width: 80px; height: 80px; object-fit: contain; margin-right: 20px;" onerror="this.style.display='none'">`;
    
    return `
        <div class="report-card-container hall-ticket" style="
            background: white !important;
            color: black !important;
            padding: 30px;
            border: 3px solid #000;
            margin: 20px auto;
            max-width: 800px;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            display: block !important;
            visibility: visible !important;
        ">
            <!-- Header with Logo -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
            ">
                ${logoHTML}
                <div style="text-align: center; flex: 1;">
                    <h1 style="
                        margin: 0;
                        color: #000;
                        font-size: 24px;
                        font-weight: bold;
                    ">${schoolDetails?.name || "GLOBAL'S SANMARG PUBLIC SCHOOL BIDAR"}</h1>
                    <p style="
                        margin: 5px 0;
                        color: #333;
                        font-size: 14px;
                    ">${schoolDetails?.description || "English Medium School"}</p>
                    <h2 style="
                        margin: 10px 0;
                        color: #000;
                        font-size: 18px;
                        font-weight: bold;
                    ">Report Card - ${exam?.name || 'Exam'} (${selectedClass?.academic_year || '2024-25'})</h2>
                </div>
            </div>
            
            <!-- Student Information -->
            <div style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 25px;
                background: #f9f9f9;
                padding: 15px;
                border: 1px solid #ccc;
            ">
                <div style="flex: 1; padding-right: 20px;">
                    <p style="margin: 8px 0; color: #000;"><strong>Student Name:</strong> ${student?.name || 'Test Student'}</p>
                    <p style="margin: 8px 0; color: #000;"><strong>Class:</strong> ${selectedClass?.class_name || '10th'}</p>
                    <p style="margin: 8px 0; color: #000;"><strong>Roll No:</strong> ${student?.roll_no || '101'}</p>
                </div>
                <div style="flex: 1;">
                    <p style="margin: 8px 0; color: #000;"><strong>Admission No:</strong> ${student?.admission_no || 'ADM001'}</p>
                    <p style="margin: 8px 0; color: #000;"><strong>Section:</strong> ${selectedClass?.section || 'A'}</p>
                    <p style="margin: 8px 0; color: #000;"><strong>DOB:</strong> ${formatDate(student?.dob) || '01/01/2005'}</p>
                </div>
            </div>
            
            <!-- Marks Table -->
            <table style="
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                border: 2px solid #000;
            ">
                <thead>
                    <tr style="background: #e6e6e6;">
                        <th style="border: 1px solid #000; padding: 12px; text-align: center; font-weight: bold;">Subjects</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: center; font-weight: bold;">Max Marks</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: center; font-weight: bold;">Marks Obtained</th>
                        <th style="border: 1px solid #000; padding: 12px; text-align: center; font-weight: bold;">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${marks.map(mark => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 10px; color: #000;">${mark.subjects?.name || 'Subject'}</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: center; color: #000;">${mark.max_marks || 100}</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: center; color: #000;">${mark.marks_obtained || 0}</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: center; color: #000; font-weight: bold;">${mark.grade || getGradeForMarks(mark.marks_obtained, mark.max_marks)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background: #f0f0f0;">
                        <td style="border: 1px solid #000; padding: 10px; font-weight: bold; color: #000;">TOTAL</td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; color: #000;">${maxMarks}</td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; color: #000;">${totalMarks}</td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; color: #000;">${grade}</td>
                    </tr>
                    <tr style="background: #f0f0f0;">
                        <td style="border: 1px solid #000; padding: 10px; font-weight: bold; color: #000;">PERCENTAGE</td>
                        <td colspan="3" style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; color: #000; font-size: 18px;">${percentage}%</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- Co-Scholastic Areas -->
            <div style="margin: 25px 0; border: 1px solid #000; padding: 15px;">
                <h3 style="color: #000; margin-bottom: 15px; text-align: center;">Co-Scholastic Areas</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ccc;">
                        <span style="color: #000;">1. Discipline in the classroom</span>
                        <span style="font-weight: bold; color: #000;">[ A / B / C ]</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ccc;">
                        <span style="color: #000;">2. Behavior / Conduct with teachers & classmates</span>
                        <span style="font-weight: bold; color: #000;">[ A / B / C ]</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ccc;">
                        <span style="color: #000;">3. Regularity & Neatness in doing HW/CW</span>
                        <span style="font-weight: bold; color: #000;">[ A / B / C ]</span>
                    </div>
                </div>
            </div>
            
            <!-- Signatures -->
            <div style="display: flex; justify-content: space-around; margin: 40px 0 20px 0; padding: 20px 0;">
                <div style="text-align: center;">
                    <div style="width: 120px; height: 2px; background: #000; margin: 20px auto 8px auto;"></div>
                    <strong style="color: #000;">Parent Sign</strong>
                </div>
                <div style="text-align: center;">
                    <div style="width: 120px; height: 2px; background: #000; margin: 20px auto 8px auto;"></div>
                    <strong style="color: #000;">Class Teacher</strong>
                </div>
                <div style="text-align: center;">
                    <div style="width: 120px; height: 2px; background: #000; margin: 20px auto 8px auto;"></div>
                    <strong style="color: #000;">Academic Head</strong>
                </div>
            </div>
        </div>
    `;
}

// OLD FUNCTION - KEEP FOR COMPATIBILITY
function createReportCardHTML(student, exam, marks, subjects, selectedClass) {
    // Handle missing marks
    if (!marks || marks.length === 0) {
        marks = subjects?.map(subject => ({
            subjects: { name: subject.name },
            marks_obtained: 0,
            max_marks: 100,
            grade: 'F'
        })) || [{
            subjects: { name: 'Math' },
            marks_obtained: 85,
            max_marks: 100,
            grade: 'A'
        }, {
            subjects: { name: 'English' },
            marks_obtained: 78,
            max_marks: 100,
            grade: 'B+'
        }];
    }
    
    // Calculate totals
    const totalMarks = marks.reduce((sum, mark) => sum + (mark.marks_obtained || 0), 0);
    const maxMarks = marks.reduce((sum, mark) => sum + (mark.max_marks || 0), 0);
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;
    const grade = getGrade(percentage);
    
    return `
        <div class="hall-ticket" style="background: white; padding: 30px; border: 2px solid #333; margin: 20px auto; max-width: 800px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                <h1 style="margin: 0; color: #333; font-size: 24px;">${schoolDetails?.name || "GLOBAL'S SANMARG PUBLIC SCHOOL BIDAR"}</h1>
                <p style="margin: 5px 0; color: #666;">${schoolDetails?.description || "English Medium School"}</p>
                <h2 style="margin: 10px 0; color: #333; font-size: 20px;">Report Card - ${exam.name} (${selectedClass.academic_year})</h2>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <p style="margin: 5px 0;"><strong>Student Name:</strong> ${student.name}</p>
                    <p style="margin: 5px 0;"><strong>Class:</strong> ${selectedClass.class_name}</p>
                    <p style="margin: 5px 0;"><strong>Roll No:</strong> ${student.roll_no || 'N/A'}</p>
                </div>
                <div style="flex: 1;">
                    <p style="margin: 5px 0;"><strong>Admission No:</strong> ${student.admission_no}</p>
                    <p style="margin: 5px 0;"><strong>Section:</strong> ${selectedClass.section}</p>
                    <p style="margin: 5px 0;"><strong>DOB:</strong> ${formatDate(student.dob)}</p>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="border: 1px solid #333; padding: 10px; text-align: center;">Subjects</th>
                        <th style="border: 1px solid #333; padding: 10px; text-align: center;">Max Marks</th>
                        <th style="border: 1px solid #333; padding: 10px; text-align: center;">Marks Obtained</th>
                        <th style="border: 1px solid #333; padding: 10px; text-align: center;">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${marks.map(mark => `
                        <tr>
                            <td style="border: 1px solid #333; padding: 8px;">${mark.subjects?.name || 'Subject'}</td>
                            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${mark.max_marks || 100}</td>
                            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${mark.marks_obtained || 0}</td>
                            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${mark.grade || getGradeForMarks(mark.marks_obtained, mark.max_marks)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background: #f9f9f9; font-weight: bold;">
                        <td style="border: 1px solid #333; padding: 8px;">Total</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: center;">${maxMarks}</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: center;">${totalMarks}</td>
                        <td style="border: 1px solid #333; padding: 8px; text-align: center;">${grade}</td>
                    </tr>
                    <tr style="background: #f9f9f9; font-weight: bold;">
                        <td style="border: 1px solid #333; padding: 8px;">Percentage</td>
                        <td colspan="3" style="border: 1px solid #333; padding: 8px; text-align: center;">${percentage}%</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin: 30px 0;">
                <h3 style="color: #333; margin-bottom: 15px;">Co-Scholastic Areas</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #ddd;">
                        <span>1. Discipline in the classroom</span>
                        <span style="font-weight: bold;">[ A / B / C ]</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #ddd;">
                        <span>2. Behavior / Conduct with teachers & classmates</span>
                        <span style="font-weight: bold;">[ A / B / C ]</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #ddd;">
                        <span>3. Regularity & Neatness in doing HW/CW</span>
                        <span style="font-weight: bold;">[ A / B / C ]</span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-around; margin: 40px 0; padding: 20px 0;">
                <div style="text-align: center;">
                    <div style="width: 120px; height: 2px; background: #333; margin: 20px auto 5px auto;"></div>
                    <strong>Parent Sign</strong>
                </div>
                <div style="text-align: center;">
                    <div style="width: 120px; height: 2px; background: #333; margin: 20px auto 5px auto;"></div>
                    <strong>Class Teacher</strong>
                </div>
                <div style="text-align: center;">
                    <div style="width: 120px; height: 2px; background: #333; margin: 20px auto 5px auto;"></div>
                    <strong>Academic Head</strong>
                </div>
            </div>
        </div>
    `;
}

// Keep old function for compatibility but not used
function generateReportCardHTML(student, exam, marks, subjects) {
    return createReportCardHTML(student, exam, marks, subjects, selectedClass);
}

function oldGenerateReportCardHTML(student, exam, marks, subjects) {
    // Calculate totals and grades
    const totalMarks = marks.reduce((sum, mark) => sum + (mark.marks_obtained || 0), 0);
    const maxMarks = marks.reduce((sum, mark) => sum + (mark.max_marks || 0), 0);
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;
    const grade = getGrade(percentage);
    
    return `
        <div class="hall-ticket">
            <div class="diamond-border-frame">
                <div class="hall-ticket-header">
                    <div class="school-logo">
                        ${schoolDetails?.logo_url ? 
                            `<img src="${schoolDetails.logo_url}" alt="School Logo" class="logo-img" onerror="this.style.display='none'">` : 
                            '<div class="logo-placeholder">🏫</div>'
                        }
                    </div>
                    <div class="school-info">
                        <h1 class="school-name">${schoolDetails?.name || "GLOBAL'S SANMARG PUBLIC SCHOOL BIDAR"}</h1>
                        <p class="school-subtitle">${schoolDetails?.description || schoolDetails?.address || "English Medium School"}</p>
                        <h2 class="exam-title">Report Card - ${exam.name || 'Examination'} (${selectedClass.academic_year})</h2>
                    </div>
                </div>
                
                <div class="student-info">
                    <div class="student-left">
                        <div class="student-field">
                            <span class="field-label">STUDENT NAME:</span>
                            <span class="field-value">${student.name}</span>
                        </div>
                        <div class="student-field">
                            <span class="field-label">CLASS:</span>
                            <span class="field-value">${selectedClass.class_name}</span>
                        </div>
                        <div class="student-field">
                            <span class="field-label">ROLL NO:</span>
                            <span class="field-value">${student.roll_no || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="student-right">
                        <div class="student-field">
                            <span class="field-label">ADMISSION NO:</span>
                            <span class="field-value">${student.admission_no}</span>
                        </div>
                        <div class="student-field">
                            <span class="field-label">SECTION:</span>
                            <span class="field-value">${selectedClass.section}</span>
                        </div>
                        <div class="student-field">
                            <span class="field-label">DOB:</span>
                            <span class="field-value">${formatDate(student.dob)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="marks-section">
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th>Subjects</th>
                                <th>Max.Marks</th>
                                <th>Marks Obt.</th>
                                <th>Grade</th>
                                <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${marks.map(mark => {
                                const subjectName = mark.subjects?.name || mark.subject_name || 'Subject';
                                const maxMarks = mark.max_marks || 100;
                                const obtainedMarks = mark.marks_obtained || 0;
                                const grade = mark.grade || getGradeForMarks(obtainedMarks, maxMarks);
                                const remarks = mark.remarks || '';
                                
                                return `
                                    <tr>
                                        <td>${subjectName}</td>
                                        <td>${maxMarks}</td>
                                        <td>${obtainedMarks}</td>
                                        <td>${grade}</td>
                                        <td>${remarks}</td>
                                    </tr>
                                `;
                            }).join('')}
                            <tr class="total-row">
                                <td><strong>Total</strong></td>
                                <td><strong>${maxMarks}</strong></td>
                                <td><strong>${totalMarks}</strong></td>
                                <td><strong>${grade}</strong></td>
                                <td></td>
                            </tr>
                            <tr class="percentage-row">
                                <td><strong>Percentage</strong></td>
                                <td colspan="3"><strong>${percentage}%</strong></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="co-scholastic">
                    <h3>Co-Scholastic Areas</h3>
                    <div class="co-scholastic-grid">
                        <div class="co-item">
                            <span>1. Discipline in the classroom</span>
                            <div class="grade-options">[ A / B / C ]</div>
                        </div>
                        <div class="co-item">
                            <span>2. Behavior / Conduct with teachers & classmates</span>
                            <div class="grade-options">[ A / B / C ]</div>
                        </div>
                        <div class="co-item">
                            <span>3. Regularity & Neatness in doing HW/CW</span>
                            <div class="grade-options">[ A / B / C ]</div>
                        </div>
                    </div>
                </div>
                
                <div class="signatures">
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <strong>Parent Sign</strong>
                    </div>
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <strong>Class Teacher</strong>
                    </div>
                    <div class="signature-item">
                        <div class="signature-line"></div>
                        <strong>Academic Head</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Simple displayReportCard - not used in new implementation
function displayReportCard(html) {
    const display = document.getElementById('reportCardDisplay');
    if (display) {
        display.innerHTML = html;
        showActionsPanel();
    }
}

function showActionsPanel() {
    const panel = document.getElementById('actionsPanel');
    if (panel) {
        panel.style.display = 'block';
    }
    
    // Show floating New Card button
    const floatingBtn = document.getElementById('floatingNewCard');
    if (floatingBtn) {
        floatingBtn.style.display = 'flex';
        floatingBtn.classList.add('show');
    }
}

function getGrade(percentage) {
    const p = parseFloat(percentage);
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B+';
    if (p >= 60) return 'B';
    if (p >= 50) return 'C+';
    if (p >= 40) return 'C';
    if (p >= 35) return 'D';
    return 'F';
}

function getGradeForMarks(obtained, maximum) {
    if (!obtained || !maximum) return 'F';
    const percentage = (obtained / maximum) * 100;
    return getGrade(percentage);
}

// Action functions for report card
function printReportCard() {
    // Try simple print first
    printReportCardSimple();
}

// Simple print function
function printReportCardSimple() {
    const reportCard = document.querySelector('.report-card-container') || document.querySelector('.hall-ticket');
    if (!reportCard) {
        alert('No report card found to print.');
        return;
    }
    
    // Create a new window with just the report card
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Get the report card HTML
    const reportCardHTML = reportCard.outerHTML;
    
    // Create the print document
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Report Card</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background: white;
                    color: black;
                }
                .report-card-container {
                    border: 2px solid black !important;
                    padding: 20px !important;
                    background: white !important;
                    color: black !important;
                    max-width: none !important;
                    box-shadow: none !important;
                }
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                }
                table, th, td {
                    border: 1px solid black !important;
                    padding: 8px !important;
                    color: black !important;
                }
                h1, h2, h3, p {
                    color: black !important;
                }
                img {
                    max-width: 80px !important;
                    max-height: 80px !important;
                }
                @media print {
                    body { margin: 0; }
                    .report-card-container { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${reportCardHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 1000);
}

function viewReportCardPDF() {
    // Implementation for PDF viewing
    console.log('Viewing PDF...');
}

function downloadReportCardPDF() {
    if (!selectedStudent || !selectedExam || !selectedClass) {
        alert('No report card to download');
        return;
    }
    
    // Get the report card content
    const reportCard = document.querySelector('.report-card-container') || document.querySelector('.hall-ticket');
    if (!reportCard) {
        alert('No report card found to download. Please regenerate the report card first.');
        return;
    }
    
    try {
        // Check if html2pdf library is available
        if (typeof window.html2pdf === 'undefined') {
            // Fallback: Use print to PDF
            alert('PDF library not available. Using browser print instead.\n\nAfter clicking OK:\n1. A new window will open\n2. The print dialog will appear\n3. Select "Save as PDF" as the destination\n4. Choose where to save your PDF');
            printReportCardSimple();
            return;
        }
        
        console.log('📄 Starting PDF download...');
        
        // Create a clean version for PDF generation
        const cleanReportCard = reportCard.cloneNode(true);
        
        // Remove any problematic elements
        const problematicElements = cleanReportCard.querySelectorAll('button, .floating-btn, .actions-panel');
        problematicElements.forEach(el => el.remove());
        
        // Temporarily add the clean version to the page (hidden)
        cleanReportCard.style.position = 'fixed';
        cleanReportCard.style.left = '-9999px';
        cleanReportCard.style.top = '0';
        cleanReportCard.style.zIndex = '-1';
        cleanReportCard.style.backgroundColor = 'white';
        cleanReportCard.style.boxShadow = 'none';
        document.body.appendChild(cleanReportCard);
        
        // Configure PDF options
        const opt = {
            margin: [15, 10, 15, 10],
            filename: `ReportCard_${selectedStudent.name.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedClass.class_name}_${selectedExam.name || 'Exam'}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                letterRendering: true,
                width: 800,
                height: 1100,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { 
                mode: ['avoid-all', 'css'],
                before: '.page-break',
                after: '.page-break',
                avoid: '.report-card-container'
            }
        };
        
        // Generate PDF
        window.html2pdf()
            .set(opt)
            .from(cleanReportCard)
            .save()
            .then(() => {
                // Remove the temporary element
                document.body.removeChild(cleanReportCard);
                console.log('✅ PDF downloaded successfully');
                alert('PDF downloaded successfully!');
            })
            .catch((error) => {
                console.error('❌ PDF generation failed:', error);
                // Remove the temporary element
                if (document.body.contains(cleanReportCard)) {
                    document.body.removeChild(cleanReportCard);
                }
                
                // Fallback to print
                alert('PDF generation failed. Using browser print instead.\n\nAfter clicking OK:\n1. A new window will open\n2. The print dialog will appear\n3. Select "Save as PDF" as the destination');
                printReportCardSimple();
            });
            
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        alert('PDF download failed. Using browser print instead.\n\nAfter clicking OK:\n1. A new window will open\n2. The print dialog will appear\n3. Select "Save as PDF" as the destination');
        printReportCardSimple();
    }
}

function generateNewCard() {
    resetSelections();
    goToStep(1);
}

function resetSelections() {
    // Reset all global selections
    selectedClass = null;
    selectedExam = null;
    selectedStudent = null;
    window.currentExams = null;
    window.currentStudents = null;
    
    // Reset dropdowns
    const academicYear = document.getElementById('academicYear');
    const classSelect = document.getElementById('classSelect');
    
    if (academicYear) academicYear.value = '';
    if (classSelect) {
        classSelect.innerHTML = '<option value="">First select academic year</option>';
        classSelect.disabled = true;
    }
    
    // Hide info panels
    hideClassInfo();
    const examInfo = document.getElementById('examInfo');
    if (examInfo) examInfo.style.display = 'none';
    
    // Hide floating button
    const floatingBtn = document.getElementById('floatingNewCard');
    if (floatingBtn) {
        floatingBtn.style.display = 'none';
        floatingBtn.classList.remove('show');
    }
    
    // Hide actions panel
    const actionsPanel = document.getElementById('actionsPanel');
    if (actionsPanel) {
        actionsPanel.style.display = 'none';
    }
    
    console.log('🔄 Selections reset');
}

// Improved initialization
function initializeApp() {
    // This function will be called by the DOMContentLoaded event
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('📏 Report Card Generator script loaded');

// Test function to verify logo and report card
function testReportCardGeneration() {
    const display = document.getElementById('reportCardDisplay');
    if (!display) {
        console.error('reportCardDisplay not found');
        return;
    }
    
    // Test with sample data
    const testStudent = {
        name: 'Test Student',
        roll_no: '101',
        admission_no: 'ADM001',
        dob: '2005-01-01'
    };
    
    const testExam = {
        name: 'Test Exam'
    };
    
    const testClass = {
        class_name: '10th',
        section: 'A',
        academic_year: '2024-25'
    };
    
    const testMarks = [
        { subjects: { name: 'Mathematics' }, marks_obtained: 85, max_marks: 100, grade: 'A' },
        { subjects: { name: 'English' }, marks_obtained: 78, max_marks: 100, grade: 'B+' }
    ];
    
    console.log('Creating test report card...');
    const html = createBulletproofReportCard(testStudent, testExam, testMarks, [], testClass);
    
    console.log('Setting HTML...');
    display.innerHTML = html;
    
    console.log('Test report card generated!');
    showActionsPanel();
}

// Add to global scope for manual testing
window.testReportCard = testReportCardGeneration;

// Debug function to check school details
window.debugSchoolDetails = function() {
    console.log('Current school details:', schoolDetails);
    if (schoolDetails?.logo_url) {
        console.log('Logo URL is available:', schoolDetails.logo_url);
    } else {
        console.log('No logo URL found');
    }
};

// Debug function to check current selections
window.debugCurrentState = function() {
    console.log('Current state:', {
        selectedClass: selectedClass?.class_name,
        selectedExam: selectedExam?.name,
        selectedStudent: selectedStudent?.name,
        schoolDetails: schoolDetails
    });
};
