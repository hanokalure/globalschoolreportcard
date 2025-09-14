// Report Card Generator JavaScript

// Global configuration object
let reportCardConfig = {
    schoolName: "GLOBAL'S SANMARG PUBLIC SCHOOL BIDAR",
    schoolSubtitle: "English Medium School With Shaba-E-Hifz and IIT Foundation Course",
    examTitle: "Marks Card Annual Exam (2020-21)",
    maxMarks: 100,
    minMarks: 35,
    subjects: {
        subject1: "Mathematics",
        subject2: "Science",
        subject3: "Social",
        subject4: "English",
        subject5: "Kannada",
        subject6: "Hindi/Urdu"
    },
    // Auto-calculated properties
    get totalMaxMarks() {
        return this.maxMarks * 6; // 6 subjects
    },
    get totalMinMarks() {
        return this.minMarks * 6; // 6 subjects
    }
};

// Global variables
let currentStep = 1;
let uploadedStudentsData = null;
let detectedSubjects = []; // Will store detected subjects from Excel

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Check if XLSX library is loaded
    console.log('📋 Checking XLSX library...');
    if (typeof XLSX !== 'undefined') {
        console.log('✅ XLSX library loaded successfully');
        console.log('  → XLSX version:', XLSX.version);
    } else {
        console.error('❌ XLSX library not loaded!');
    }
    
    // Check if we're on the main page with the step system
    const step1 = document.getElementById('step1');
    if (!step1) {
        console.log('Step 1 not found, might be on a different page');
        return;
    }
    
    // Load saved configuration (safe to call even if elements don't exist)
    loadConfiguration();
    
    // File upload listeners
    setupFileUpload();
    
    // Step navigation listeners  
    setupStepNavigation();
    
    // Real-time update listeners for configuration marks
    const maxMarksEl = document.getElementById('maxMarks');
    const minMarksEl = document.getElementById('minMarks');
    if (maxMarksEl) maxMarksEl.addEventListener('input', updateCalculatedTotals);
    if (minMarksEl) minMarksEl.addEventListener('input', updateCalculatedTotals);
    
    // Real-time update listeners for batch marks
    const batchMaxMarks = document.getElementById('batchMaxMarks');
    const batchMinMarks = document.getElementById('batchMinMarks');
    
    console.log('Setting up batch marks event listeners:');
    console.log('   → batchMaxMarks element:', batchMaxMarks);
    console.log('   → batchMinMarks element:', batchMinMarks);
    
    if (batchMaxMarks) {
        batchMaxMarks.addEventListener('input', updateBatchTotals);
        console.log('   → Added input listener to batchMaxMarks');
    }
    if (batchMinMarks) {
        batchMinMarks.addEventListener('input', updateBatchTotals);
        console.log('   → Added input listener to batchMinMarks');
    }
    
    // Initialize batch totals
    console.log('Calling initial updateBatchTotals...');
    updateBatchTotals();
    
    // Initialize step 1 and update progress
    showStep(1);
    updateProgressSteps(1);
    
    console.log('App initialized successfully');
    console.log('Current step:', currentStep);
    console.log('Uploaded data:', !!uploadedStudentsData);
}

function setupStepNavigation() {
    // Next buttons
    document.getElementById('nextToCustomize').addEventListener('click', () => goToStep(2));
    document.getElementById('nextToMarks').addEventListener('click', () => goToStep(3));
    document.getElementById('nextToPreview').addEventListener('click', () => goToStep(4));
    
    // Back buttons
    document.getElementById('backToUpload').addEventListener('click', () => goToStep(1));
    document.getElementById('backToCustomize').addEventListener('click', () => goToStep(2));
    document.getElementById('backToMarks').addEventListener('click', () => goToStep(3));
    
    // Preview and generation buttons
    document.getElementById('generatePreview').addEventListener('click', generatePreview);
    document.getElementById('proceedToGenerate').addEventListener('click', () => {
        goToStep(5);
        proceedToFinalGeneration();
    });
    
    // MAKE PROGRESS STEPS CLICKABLE
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', () => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            
            // Only allow navigation if data is uploaded or it's step 1
            if (stepNumber === 1 || uploadedStudentsData) {
                goToStep(stepNumber);
            } else {
                showMessage('Please upload an Excel file first!', 'info');
            }
        });
        
        // Make it look clickable
        step.style.cursor = 'pointer';
    });
}

function goToStep(stepNumber) {
    // Hide all step contents
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show target step content
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update progress steps
    updateProgressSteps(stepNumber);
    
    // Update progress bar
    updateProgressBar(stepNumber);
    
    currentStep = stepNumber;
    
    // Step-specific actions
    if (stepNumber === 3) {
        // Setup Step 3 specific functionality
        setTimeout(() => {
            console.log('🚀 Setting up Step 3 - Batch Marks');
            
            // Re-attach event listeners for batch marks
            const batchMaxMarks = document.getElementById('batchMaxMarks');
            const batchMinMarks = document.getElementById('batchMinMarks');
            
            if (batchMaxMarks && batchMinMarks) {
                console.log('   → Found batch marks elements, setting up listeners...');
                
                // Remove any existing listeners first
                batchMaxMarks.removeEventListener('input', updateBatchTotals);
                batchMinMarks.removeEventListener('input', updateBatchTotals);
                
                // Add multiple event listeners for better responsiveness
                const updateOnChange = function() {
                    console.log('📝 Input changed - Max:', batchMaxMarks.value, 'Min:', batchMinMarks.value);
                    updateBatchTotals();
                };
                
                // Add listeners for various events
                batchMaxMarks.addEventListener('input', updateOnChange);
                batchMaxMarks.addEventListener('change', updateOnChange);
                batchMaxMarks.addEventListener('keyup', updateOnChange);
                batchMaxMarks.addEventListener('blur', updateOnChange);
                
                batchMinMarks.addEventListener('input', updateOnChange);
                batchMinMarks.addEventListener('change', updateOnChange);
                batchMinMarks.addEventListener('keyup', updateOnChange);
                batchMinMarks.addEventListener('blur', updateOnChange);
                
                console.log('   → Event listeners attached successfully');
                
                // Force immediate update with current values
                console.log('🔄 Forcing immediate update...');
                console.log('   → Current max value:', batchMaxMarks.value);
                console.log('   → Current min value:', batchMinMarks.value);
                
                // Update batch totals multiple times to ensure it works
                updateBatchTotals();
                
                // Also try to trigger the update manually after a short delay
                setTimeout(() => {
                    console.log('🔄 Secondary update trigger...');
                    updateBatchTotals();
                }, 200);
            } else {
                console.error('❌ Batch marks elements not found in Step 3');
            }
        }, 100);
    }
    
    if (stepNumber === 4 && uploadedStudentsData) {
        document.getElementById('studentCount').textContent = uploadedStudentsData.length;
    }
}

function updateProgressSteps(activeStep) {
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        
        // Update active state
        step.classList.toggle('active', stepNumber === activeStep);
        
        // Make steps accessible after file upload
        if (uploadedStudentsData || stepNumber === 1) {
            step.style.opacity = '1';
            step.style.cursor = 'pointer';
        } else {
            step.style.opacity = '0.5';
            step.style.cursor = 'not-allowed';
        }
    });
}

function updateProgressBar(activeStep) {
    const progressFill = document.querySelector('.progress-fill');
    const percentage = (activeStep / 5) * 100;
    progressFill.style.width = `${percentage}%`;
}

function getMaxAccessibleStep() {
    if (!uploadedStudentsData) return 1;
    return 5; // All steps accessible once file is uploaded
}


function showStep(stepNumber) {
    goToStep(stepNumber);
}

function setupFileUpload() {
    console.log('🔧 Setting up file upload...');
    
    const excelFileInput = document.getElementById('excelFile');
    const uploadArea = document.getElementById('uploadArea');
    const browseBtn = document.getElementById('browseBtn');
    
    console.log('📋 Elements found:');
    console.log('  → excelFileInput:', excelFileInput);
    console.log('  → uploadArea:', uploadArea);
    console.log('  → browseBtn:', browseBtn);
    
    if (!excelFileInput || !uploadArea || !browseBtn) {
        console.error('❌ Missing required elements for file upload!');
        console.error('  → excelFileInput missing:', !excelFileInput);
        console.error('  → uploadArea missing:', !uploadArea);
        console.error('  → browseBtn missing:', !browseBtn);
        return;
    }
    
    // File input change listener
    excelFileInput.addEventListener('change', handleFileUpload);
    
    // Browse button click listener
    browseBtn.addEventListener('click', function(e) {
        console.log('🖱️ Browse button clicked!');
        console.log('  → Event:', e);
        console.log('  → About to trigger file input click...');
        
        try {
            excelFileInput.click();
            console.log('✅ File input click triggered successfully');
        } catch (error) {
            console.error('❌ Error triggering file input click:', error);
        }
    });
    
    // Upload area click listener
    uploadArea.addEventListener('click', function(e) {
        if (e.target !== browseBtn) {
            excelFileInput.click();
        }
    });
    
    // Drag and drop listeners
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const dt = new DataTransfer();
                dt.items.add(file);
                excelFileInput.files = dt.files;
                handleFileUpload({ target: { files: [file] } });
            } else {
                showMessage('Please select an Excel file (.xlsx or .xls)', 'error');
            }
        }
    });
}

function handleFileUpload(event) {
    console.log('📁 handleFileUpload called!');
    console.log('  → Event:', event);
    console.log('  → Files:', event.target.files);
    
    const file = event.target.files[0];
    console.log('  → Selected file:', file);
    
    if (!file) {
        console.log('⚠️ No file selected');
        uploadedStudentsData = null;
        document.getElementById('nextToCustomize').disabled = true;
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                showMessage('No data found in the Excel file!', 'error');
                return;
            }
            
            // Store the data globally
            uploadedStudentsData = jsonData;
            
            // Enable next step
            document.getElementById('nextToCustomize').disabled = false;
            
            // Update step accessibility
            updateProgressSteps(currentStep);
            
            // Update upload area to show success
            updateUploadStatus(file.name, jsonData.length);
            
            showMessage(`Successfully loaded ${jsonData.length} students from ${file.name}`, 'success');
            
        } catch (error) {
            console.error('Error reading Excel file:', error);
            showMessage('Error reading Excel file. Please make sure it\'s a valid Excel file.', 'error');
            uploadedStudentsData = null;
            document.getElementById('nextToCustomize').disabled = true;
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function updateUploadStatus(filename, studentCount) {
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.innerHTML = `
        <div class="upload-icon">✅</div>
        <h3>File Uploaded Successfully!</h3>
        <p><strong>${filename}</strong></p>
        <p>Found ${studentCount} students</p>
        <button class="browse-btn" type="button" id="newBrowseBtn">Choose Different File</button>
    `;
    uploadArea.style.background = 'linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.1))';
    uploadArea.style.borderColor = '#48bb78';
    
    // Re-attach event listener to the new button
    const newBrowseBtn = document.getElementById('newBrowseBtn');
    newBrowseBtn.addEventListener('click', function() {
        document.getElementById('excelFile').click();
    });
}

function generatePreview() {
    if (!uploadedStudentsData) {
        showMessage('Please upload an Excel file first!', 'error');
        return;
    }
    
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '<div class="loading">Generating preview...</div>';
    
    setTimeout(() => {
        // Get unique classes for filtering
        const classes = [...new Set(uploadedStudentsData.map(student => 
            cleanValue(student.CLASS || student.Class || '', 'text')
        ))].filter(cls => cls !== 'N/A').sort();
        
        // Generate class filter dropdown
        const classFilter = `
            <div class="preview-filter">
                <label for="classFilter">Filter by Class:</label>
                <select id="classFilter">
                    <option value="all">All Classes (${uploadedStudentsData.length} students)</option>
                    ${classes.map(cls => {
                        const count = uploadedStudentsData.filter(s => 
                            cleanValue(s.CLASS || s.Class || '', 'text') === cls
                        ).length;
                        return `<option value="${cls}">${cls} (${count} students)</option>`;
                    }).join('')}
                </select>
            </div>
        `;
        
        // Generate all preview cards
        const allPreviewCards = generateAllPreviewCards(uploadedStudentsData);
        
        previewContainer.innerHTML = `
            <div class="preview-summary">
                <h3>Preview All Report Cards</h3>
                <p>Showing all ${uploadedStudentsData.length} students</p>
                <div class="preview-settings">
                    <span>Max Marks: ${document.getElementById('batchMaxMarks').value} per subject</span>
                    <span>Min Marks: ${document.getElementById('batchMinMarks').value} to pass</span>
                </div>
            </div>
            ${classFilter}
            <div class="preview-cards" id="previewCards">${allPreviewCards}</div>
        `;
        
        // Add filter functionality
        document.getElementById('classFilter').addEventListener('change', function() {
            filterPreviewCards(this.value);
        });
    }, 1000);
}

function generateAllPreviewCards(studentsData) {
    const batchMaxMarks = parseInt(document.getElementById('batchMaxMarks').value) || 100;
    const batchMinMarks = parseInt(document.getElementById('batchMinMarks').value) || 35;
    
    return studentsData.map((student, index) => {
        const subjects = {
            Mathematics: cleanValue(student['MATHS '] || student.MATHS || student.Mathematics || student.Math, 'number'),
            Science: cleanValue(student.SCIENCE || student.Science, 'number'),
            Social: cleanValue(student.SOCIAL || student.Social || student['Social Science'], 'number'),
            English: cleanValue(student.ENGLISH || student.English, 'number'),
            Kannada: cleanValue(student.KANNADA || student.Kannada, 'number'),
            HindiUrdu: cleanValue(student['URDU\\HINDI'] || student['URDU/HINDI'] || student.URDU || student.HINDI, 'number')
        };
        
        const totalMarks = Object.values(subjects).reduce((sum, marks) => sum + marks, 0);
        const batchTotalMaxMarks = batchMaxMarks * 6;
        const percentage = ((totalMarks / batchTotalMaxMarks) * 100).toFixed(1);
        const grade = calculateGrade(parseFloat(percentage));
        
        const studentName = formatName(student.STUDENT_NAME || student.StudentName);
        const studentClass = cleanValue(student.CLASS || student.Class, 'text');
        const fatherName = formatName(student['FATHER NAME'] || student.FatherName);
        const rollNo = cleanValue(student['ROLL NUMNER'] || student.RollNo, 'text');
        
        return `
            <div class="preview-card" data-class="${studentClass}">
                <div class="preview-header">
                    <div class="student-details">
                        <h4>${studentName}</h4>
                        <p>Class: ${studentClass} | Roll: ${rollNo} | Father: ${fatherName}</p>
                    </div>
                    <div class="preview-stats">
                        <span class="total-marks">${totalMarks}/${batchTotalMaxMarks}</span>
                        <span class="percentage">${percentage}%</span>
                        <span class="grade grade-${grade.toLowerCase().replace('+', 'plus')}">${grade}</span>
                    </div>
                </div>
                <div class="preview-subjects">
                    <div class="subject-marks">
                        <span>Math: ${subjects.Mathematics}</span>
                        <span>Science: ${subjects.Science}</span>
                        <span>Social: ${subjects.Social}</span>
                        <span>English: ${subjects.English}</span>
                        <span>Kannada: ${subjects.Kannada}</span>
                        <span>Hindi/Urdu: ${subjects.HindiUrdu}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterPreviewCards(selectedClass) {
    const previewCards = document.querySelectorAll('.preview-card');
    previewCards.forEach(card => {
        if (selectedClass === 'all' || card.dataset.class === selectedClass) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function cleanValue(value, type) {
    if (value === undefined || value === null || value === '') {
        return type === 'number' ? 0 : 'N/A';
    }
    
    if (type === 'number') {
        const num = parseInt(value);
        return isNaN(num) ? 0 : num;
    }
    
    return String(value).trim() || 'N/A';
}

/**
 * Detects subject columns from Excel data
 * @param {Array} excelData - The parsed Excel data array
 * @returns {Array} - Array of detected subject objects {key, name, displayName}
 */
function detectSubjectsFromData(excelData) {
    if (!excelData || excelData.length === 0) return [];
    
    const firstRow = excelData[0];
    const allColumns = Object.keys(firstRow);
    
    console.log('All columns found in Excel:', allColumns);
    
    // Known non-subject columns
    const nonSubjectColumns = [
        'ROLL NUMNER', 'ROLL NO', 'ROLLNO', 'ROLL_NO',
        'STUDENT_NAME', 'STUDENTNAME', 'STUDENT NAME', 'NAME',
        'FATHER NAME', 'FATHERNAME', 'FATHER_NAME', 'PARENT NAME',
        'CLASS', 'GRADE', 'STANDARD',
        'SECTION', 'DIV', 'DIVISION',
        'TOTAL', 'PERCENTAGE', 'GRADE_LETTER', 'RANK', 'RESULT'
    ];
    
    // Common subject name mappings
    const subjectMappings = {
        'MATHS': 'Mathematics',
        'MATHEMATICS': 'Mathematics', 
        'MATH': 'Mathematics',
        'SCIENCE': 'Science',
        'SOCIAL': 'Social Studies',
        'SOCIAL SCIENCE': 'Social Studies',
        'ENGLISH': 'English',
        'KANNADA': 'Kannada',
        'HINDI': 'Hindi',
        'URDU': 'Urdu',
        'URDU\\HINDI': 'Hindi/Urdu',
        'URDU/HINDI': 'Hindi/Urdu',
        'HINDI/URDU': 'Hindi/Urdu',
        'PHYSICS': 'Physics',
        'CHEMISTRY': 'Chemistry',
        'BIOLOGY': 'Biology',
        'HISTORY': 'History',
        'GEOGRAPHY': 'Geography',
        'CIVICS': 'Civics',
        'ECONOMICS': 'Economics'
    };
    
    // Detect subject columns
    const subjects = [];
    
    allColumns.forEach(column => {
        const upperColumn = column.toUpperCase().trim();
        
        // Skip known non-subject columns
        if (nonSubjectColumns.some(nonSubject => upperColumn.includes(nonSubject))) {
            return;
        }
        
        // Check if it looks like a subject (has numeric values)
        const hasNumericValues = excelData.slice(0, 5).some(row => {
            const value = row[column];
            return value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(value));
        });
        
        if (hasNumericValues) {
            const displayName = subjectMappings[upperColumn] || 
                              column.charAt(0).toUpperCase() + column.slice(1).toLowerCase();
            
            subjects.push({
                key: column,           // Original column name from Excel
                name: upperColumn,     // Normalized name for matching
                displayName: displayName  // User-friendly display name
            });
        }
    });
    
    console.log('Detected subjects:', subjects);
    return subjects;
}

/**
 * Special function for name formatting - converts all names to UPPERCASE
 * This ensures consistent capitalization for Student Names and Father Names
 * even if they are entered in lowercase or mixed case in the Excel file
 * 
 * @param {string} value - The name value from Excel
 * @returns {string} - The formatted name in UPPERCASE or 'N/A' if empty
 */
function formatName(value) {
    if (value === undefined || value === null || value === '') {
        return 'N/A';
    }
    
    const cleanName = String(value).trim();
    if (cleanName === '' || cleanName.toLowerCase() === 'n/a') {
        return 'N/A';
    }
    
    // Convert to uppercase - this is the key feature!
    return cleanName.toUpperCase();
}

/**
 * Gets subject marks for a student based on detected subjects
 * @param {Object} student - Student data from Excel
 * @returns {Object} - Object with subject marks {subjectName: marks}
 */
function getSubjectMarks(student) {
    const subjects = {};
    
    detectedSubjects.forEach((subject, index) => {
        const marks = cleanValue(student[subject.key], 'number');
        subjects[`subject${index + 1}`] = {
            name: subject.displayName,
            marks: marks,
            key: subject.key
        };
    });
    
    return subjects;
}

function filterFinalReportCards(selectedClass) {
    const reportCards = document.querySelectorAll('#finalOutput .report-card');
    reportCards.forEach(card => {
        if (selectedClass === 'all' || card.getAttribute('data-class') === selectedClass) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function downloadAllReportCards() {
    const reportCards = document.querySelectorAll('#finalOutput .report-card[style*="block"], #finalOutput .report-card:not([style*="none"])');
    const visibleCards = Array.from(reportCards).filter(card => 
        card.style.display !== 'none'
    );
    
    if (visibleCards.length === 0) {
        showMessage('No report cards visible to download!', 'error');
        return;
    }
    
    showMessage(`Starting download of ${visibleCards.length} report cards...`, 'info');
    
    // Download each report card with a small delay to prevent browser blocking
    visibleCards.forEach((card, index) => {
        setTimeout(() => {
            const downloadBtn = card.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.click();
            }
        }, index * 1000); // 1 second delay between each download
    });
}

function showAllPrintableReportCards() {
    const reportCards = document.querySelectorAll('#finalOutput .report-card[style*="block"], #finalOutput .report-card:not([style*="none"])');
    const visibleCards = Array.from(reportCards).filter(card => 
        card.style.display !== 'none'
    );
    
    if (visibleCards.length === 0) {
        showMessage('No report cards visible to print!', 'error');
        return;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Report Cards - Print View</title>
            <link rel="stylesheet" href="styles.css">
            <style>
                body { 
                    font-family: 'Times New Roman', serif;
                    margin: 0;
                    padding: 0;
                }
                .print-view {
                    display: block;
                }
                .report-card {
                    page-break-after: always;
                    margin: 0;
                    padding: 20px;
                }
                .report-card:last-child {
                    page-break-after: auto;
                }
                .download-section {
                    display: none !important;
                }
            </style>
        </head>
        <body class="print-view">
    `);
    
    // Clone each visible report card to the print window
    visibleCards.forEach(card => {
        const clonedCard = card.cloneNode(true);
        // Remove the download section from the clone
        const downloadSection = clonedCard.querySelector('.download-section');
        if (downloadSection) {
            downloadSection.remove();
        }
        printWindow.document.body.appendChild(clonedCard);
    });
    
    printWindow.document.write(`
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Auto-focus and show print dialog after content loads
    printWindow.onload = function() {
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };
    
    showMessage(`Print view opened with ${visibleCards.length} report cards`, 'success');
}

function printHallTicket(button) {
    const hallTicket = button.closest('.hall-ticket');
    
    // Create a new window for printing single hall ticket
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hall Ticket - Print</title>
            <link rel="stylesheet" href="styles.css">
            <style>
                body { 
                    font-family: 'Times New Roman', serif;
                    margin: 0;
                    padding: 20px;
                }
                .download-section {
                    display: none !important;
                }
                .hall-ticket {
                    box-shadow: none;
                    border-radius: 0;
                }
            </style>
        </head>
        <body>
    `);
    
    // Clone the hall ticket
    const clonedCard = hallTicket.cloneNode(true);
    // Remove the download section
    const downloadSection = clonedCard.querySelector('.download-section');
    if (downloadSection) {
        downloadSection.remove();
    }
    
    printWindow.document.body.appendChild(clonedCard);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Auto-focus and show print dialog
    printWindow.onload = function() {
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };
}

function printReportCard(button) {
    // Redirect to hall ticket function
    printHallTicket(button);
}

function proceedToFinalGeneration() {
    console.log('Starting final generation...');
    
    if (!uploadedStudentsData) {
        showMessage('No data available for generation! Please upload Excel file first.', 'error');
        return;
    }
    
    console.log(`Generating report cards for ${uploadedStudentsData.length} students`);
    
    const finalOutput = document.getElementById('finalOutput');
    if (!finalOutput) {
        console.error('Final output element not found!');
        return;
    }
    
    finalOutput.innerHTML = '<div class="loading">Generating all report cards...</div>';
    
    setTimeout(() => {
        // Generate all report cards directly in final output
        generateReportCards(uploadedStudentsData, true); // Pass true for final generation
        
        showMessage(`Generated ${uploadedStudentsData.length} report cards successfully!`, 'success');
    }, 1500);
}

function generateReportCards(studentsData, isFinalGeneration = false) {
    console.log('🎯 Starting generateReportCards function');
    console.log('   → Students data:', studentsData.length, 'students');
    console.log('   → Final generation:', isFinalGeneration);
    
    const outputDiv = isFinalGeneration ? document.getElementById('finalOutput') : document.getElementById('output');
    const template = document.getElementById('reportCardTemplate');
    
    console.log('   → Output div found:', !!outputDiv, outputDiv?.id);
    console.log('   → Template found:', !!template);
    
    if (!outputDiv || !template) {
        console.error('❌ Required elements not found for report card generation');
        console.error('   → outputDiv:', outputDiv);
        console.error('   → template:', template);
        return;
    }
    
    console.log('🧹 Clearing previous output (including placeholder)');
    outputDiv.innerHTML = '';
    
    // Add class filter for final generation
    if (isFinalGeneration) {
        console.log('📊 Creating class filter for final generation');
        
        // Get unique classes for filtering
        const classes = [...new Set(studentsData.map(student => 
            cleanValue(student.CLASS || student.Class || '', 'text')
        ))].filter(cls => cls !== 'N/A').sort();
        
        console.log('   → Found classes:', classes);
        
        // Generate class filter dropdown for final output
        const classFilter = document.createElement('div');
        classFilter.className = 'final-filter';
        classFilter.innerHTML = `
            <div class="filter-header">
                <h3>📋 All Report Cards Generated (${studentsData.length} students)</h3>
                <div class="filter-controls">
                    <label for="finalClassFilter">Filter by Class:</label>
                    <select id="finalClassFilter">
                        <option value="all">All Classes (${studentsData.length} students)</option>
                        ${classes.map(cls => {
                            const count = studentsData.filter(s => 
                                cleanValue(s.CLASS || s.Class || '', 'text') === cls
                            ).length;
                            return `<option value="${cls}">${cls} (${count} students)</option>`;
                        }).join('')}
                    </select>
                    <button id="downloadAllBtn" class="btn btn-success">
                        📦 Download All PDFs
                    </button>
                    <button id="showAllPdfBtn" class="btn btn-primary">
                        🖨️ Show All PDF
                    </button>
                </div>
            </div>
        `;
        console.log('   → Appending class filter to output div');
        outputDiv.appendChild(classFilter);
        
        // Add filter functionality after creating the element
        setTimeout(() => {
            const finalClassFilter = document.getElementById('finalClassFilter');
            if (finalClassFilter) {
                finalClassFilter.addEventListener('change', function() {
                    filterFinalReportCards(this.value);
                });
            }
            
            const downloadAllBtn = document.getElementById('downloadAllBtn');
            if (downloadAllBtn) {
                downloadAllBtn.addEventListener('click', downloadAllReportCards);
            }
            
            const showAllPdfBtn = document.getElementById('showAllPdfBtn');
            if (showAllPdfBtn) {
                showAllPdfBtn.addEventListener('click', showAllPrintableReportCards);
            }
            console.log('   → Event listeners attached to filter controls');
        }, 100);
    }
    
    console.log('🏗️ Starting to generate individual report cards...');
    studentsData.forEach((student, index) => {
        console.log(`   → Generating card ${index + 1}/${studentsData.length}: ${formatName(student.STUDENT_NAME || student.StudentName)}`);
        
        // Clone the template
        const reportCard = template.content.cloneNode(true);
        
        // Apply configuration to template
        applyConfigurationToReportCard(reportCard);
        
        // Fill student information
        fillStudentInfo(reportCard, student);
        
        // Fill marks data
        fillMarksData(reportCard, student);
        
        // Add class data attribute for filtering
        const reportCardDiv = reportCard.querySelector('.report-card');
        if (reportCardDiv) {
            const studentClass = cleanValue(student.CLASS || student.Class, 'text');
            reportCardDiv.setAttribute('data-class', studentClass);
            reportCardDiv.setAttribute('data-student-name', formatName(student.STUDENT_NAME || student.StudentName));
        }
        
        // Append to output
        outputDiv.appendChild(reportCard);
    });
    
    console.log('✅ All report cards generated and appended');
    console.log('   → Final output div children count:', outputDiv.children.length);
    console.log('   → Final output div innerHTML length:', outputDiv.innerHTML.length);
    
    // Show success message only if not final generation (avoid duplicate messages)
    if (!isFinalGeneration) {
        showMessage(`Generated ${studentsData.length} report cards successfully!`, 'success');
    }
    
    // Force a visual update
    if (isFinalGeneration) {
        console.log('🎨 Forcing visual update for final generation');
        // Scroll to the top of the output
        outputDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function applyConfigurationToReportCard(reportCard) {
    // Update school information
    reportCard.querySelector('.school-name-display').textContent = reportCardConfig.schoolName;
    reportCard.querySelector('.school-subtitle-display').textContent = reportCardConfig.schoolSubtitle;
    reportCard.querySelector('.exam-title-display').textContent = reportCardConfig.examTitle;
    
    // Update subject names
    reportCard.querySelector('.subject1-name').textContent = reportCardConfig.subjects.subject1;
    reportCard.querySelector('.subject2-name').textContent = reportCardConfig.subjects.subject2;
    reportCard.querySelector('.subject3-name').textContent = reportCardConfig.subjects.subject3;
    reportCard.querySelector('.subject4-name').textContent = reportCardConfig.subjects.subject4;
    reportCard.querySelector('.subject5-name').textContent = reportCardConfig.subjects.subject5;
    reportCard.querySelector('.subject6-name').textContent = reportCardConfig.subjects.subject6;
    
    // Update marks configuration using batch values
    const batchMaxMarks = parseInt(document.getElementById('batchMaxMarks').value) || 100;
    const batchMinMarks = parseInt(document.getElementById('batchMinMarks').value) || 35;
    const batchTotalMaxMarks = batchMaxMarks * 6;
    const batchTotalMinMarks = batchMinMarks * 6;
    
    reportCard.querySelectorAll('.max-marks-display').forEach(el => {
        el.textContent = batchMaxMarks;
    });
    reportCard.querySelectorAll('.min-marks-display').forEach(el => {
        el.textContent = batchMinMarks;
    });
    reportCard.querySelector('.total-max-marks-display strong').textContent = batchTotalMaxMarks;
    reportCard.querySelector('.total-min-marks-display strong').textContent = batchTotalMinMarks;
}

function fillStudentInfo(reportCard, student) {
    // Fill basic student information
    const studentName = reportCard.querySelector('.student-name');
    const fatherName = reportCard.querySelector('.father-name');
    const studentClass = reportCard.querySelector('.class');
    const section = reportCard.querySelector('.section');
    const rollNo = reportCard.querySelector('.roll-no');
    
    // Handle the actual column names from the Excel file - use formatName for names to convert to UPPERCASE
    studentName.textContent = formatName(student.STUDENT_NAME || student.StudentName || student['Student Name']);
    fatherName.textContent = formatName(student['FATHER NAME'] || student.FatherName || student['Father Name']);
    studentClass.textContent = cleanValue(student.CLASS || student.Class, 'text');
    section.textContent = cleanValue(student.SECTION || student.Section, 'text');
    rollNo.textContent = cleanValue(student['ROLL NUMNER'] || student.RollNo || student['Roll No'], 'text');
}

function fillMarksData(reportCard, student) {
    // Subject mapping - handles the actual Excel column names with cleanValue
    const subjects = {
        Mathematics: cleanValue(student['MATHS '] || student.MATHS || student.Mathematics || student.Math, 'number'),
        Science: cleanValue(student.SCIENCE || student.Science, 'number'),
        Social: cleanValue(student.SOCIAL || student.Social || student['Social Science'], 'number'),
        English: cleanValue(student.ENGLISH || student.English, 'number'),
        Kannada: cleanValue(student.KANNADA || student.Kannada, 'number'),
        HindiUrdu: cleanValue(student['URDU\\HINDI'] || student['URDU/HINDI'] || student.URDU || student.HINDI || student.HindiUrdu || student['Hindi/Urdu'] || student.Hindi || student.Urdu, 'number')
    };
    
    // Debug: Log subject marks for troubleshooting
    console.log('Subject marks for', student.STUDENT_NAME || student.StudentName, subjects);
    
    // Fill individual subject marks
    reportCard.querySelector('.math-marks').textContent = subjects.Mathematics;
    reportCard.querySelector('.science-marks').textContent = subjects.Science;
    reportCard.querySelector('.social-marks').textContent = subjects.Social;
    reportCard.querySelector('.english-marks').textContent = subjects.English;
    reportCard.querySelector('.kannada-marks').textContent = subjects.Kannada;
    reportCard.querySelector('.hindi-marks').textContent = subjects.HindiUrdu;
    
    // Get batch marks for this generation
    const batchMaxMarks = parseInt(document.getElementById('batchMaxMarks').value) || 100;
    const batchMinMarks = parseInt(document.getElementById('batchMinMarks').value) || 35;
    const batchTotalMaxMarks = batchMaxMarks * 6;
    
    console.log(`Using batch marks: Max=${batchMaxMarks}, Min=${batchMinMarks}, Total Max=${batchTotalMaxMarks}`);
    
    // Fill remarks (Pass/Fail based on batch minimum marks)
    reportCard.querySelector('.math-remark').textContent = getRemarkAndClass(subjects.Mathematics, batchMinMarks);
    reportCard.querySelector('.science-remark').textContent = getRemarkAndClass(subjects.Science, batchMinMarks);
    reportCard.querySelector('.social-remark').textContent = getRemarkAndClass(subjects.Social, batchMinMarks);
    reportCard.querySelector('.english-remark').textContent = getRemarkAndClass(subjects.English, batchMinMarks);
    reportCard.querySelector('.kannada-remark').textContent = getRemarkAndClass(subjects.Kannada, batchMinMarks);
    reportCard.querySelector('.hindi-remark').textContent = getRemarkAndClass(subjects.HindiUrdu, batchMinMarks);
    
    // Calculate total marks
    const totalMarks = Object.values(subjects).reduce((sum, marks) => sum + (marks || 0), 0);
    reportCard.querySelector('.total-marks strong').textContent = totalMarks;
    
    // Calculate percentage using batch total max marks
    const percentage = ((totalMarks / batchTotalMaxMarks) * 100).toFixed(1);
    reportCard.querySelector('.percentage').textContent = percentage + '%';
    
    // Debug: Log calculation details
    console.log(`Total marks: ${totalMarks}, Batch Max marks: ${batchTotalMaxMarks}, Percentage: ${percentage}%`);
    
    // Calculate grade
    const grade = calculateGrade(parseFloat(percentage));
    reportCard.querySelector('.grade').textContent = grade;
    
    // Apply remark classes for styling
    applyRemarkStyling(reportCard, subjects, batchMinMarks);
}

function getRemarkAndClass(marks, minMarks) {
    const mark = parseInt(marks || 0);
    const minimum = minMarks || reportCardConfig.minMarks;
    return mark >= minimum ? 'Pass' : 'Fail';
}

function applyRemarkStyling(reportCard, subjects, minMarks) {
    const minimum = minMarks || reportCardConfig.minMarks;
    const remarkElements = [
        { element: reportCard.querySelector('.math-remark'), marks: subjects.Mathematics },
        { element: reportCard.querySelector('.science-remark'), marks: subjects.Science },
        { element: reportCard.querySelector('.social-remark'), marks: subjects.Social },
        { element: reportCard.querySelector('.english-remark'), marks: subjects.English },
        { element: reportCard.querySelector('.kannada-remark'), marks: subjects.Kannada },
        { element: reportCard.querySelector('.hindi-remark'), marks: subjects.HindiUrdu }
    ];
    
    remarkElements.forEach(item => {
        const mark = parseInt(item.marks || 0);
        if (mark >= minimum) {
            item.element.classList.add('pass-remark');
        } else {
            item.element.classList.add('fail-remark');
        }
    });
}

function calculateGrade(percentage) {
    const percent = parseFloat(percentage) || 0;
    console.log(`Calculating grade for percentage: ${percent}`);
    
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B+';
    if (percent >= 60) return 'B';
    if (percent >= 50) return 'C+';
    if (percent >= 40) return 'C';
    if (percent >= 35) return 'D';
    return 'F';
}

function viewHallTicket(button) {
    const hallTicket = button.closest('.hall-ticket');
    const studentName = hallTicket.querySelector('.student-name').textContent || 'Student';
    
    // Hide the download buttons temporarily
    const downloadSection = hallTicket.querySelector('.download-section');
    downloadSection.style.display = 'none';
    
    // Configure PDF options for viewing
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `HallTicket_${studentName}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };
    
    // Generate PDF and open in new tab for viewing
    html2pdf().from(hallTicket).set(opt).outputPdf('datauristring').then(function(pdfAsString) {
        // Open PDF in new tab for viewing
        const newTab = window.open();
        newTab.document.write(`
            <iframe width='100%' height='100%' src='${pdfAsString}'></iframe>
        `);
        newTab.document.title = `Hall Ticket - ${studentName}`;
        
        // Show the download buttons again
        downloadSection.style.display = 'flex';
    }).catch(() => {
        // Fallback: just download if viewing fails
        downloadHallTicket(button.nextElementSibling);
        downloadSection.style.display = 'flex';
    });
}

function viewReportCard(button) {
    // Redirect to hall ticket function
    viewHallTicket(button);
}

function downloadHallTicket(button) {
    const hallTicket = button.closest('.hall-ticket');
    const studentName = hallTicket.querySelector('.student-name').textContent || 'Student';
    const studentClass = hallTicket.querySelector('.class').textContent || 'Class';
    
    // Hide the download buttons temporarily
    const downloadSection = hallTicket.querySelector('.download-section');
    downloadSection.style.display = 'none';
    
    // Configure PDF options
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `HallTicket_${studentName}_${studentClass}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };
    
    // Generate PDF and download
    html2pdf().from(hallTicket).set(opt).save().then(() => {
        // Show the download buttons again
        downloadSection.style.display = 'flex';
    });
}

function downloadReportCard(button) {
    // Redirect to hall ticket function
    downloadHallTicket(button);
}

function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: 10px; padding: 2px 8px; border: none; background: rgba(255,255,255,0.3); cursor: pointer; border-radius: 3px;">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// Global functions to handle PDF and print operations (called from HTML)
window.downloadReportCard = downloadReportCard;
window.viewReportCard = viewReportCard;
window.printReportCard = printReportCard;
window.downloadHallTicket = downloadHallTicket;
window.viewHallTicket = viewHallTicket;
window.printHallTicket = printHallTicket;
window.showAllPDF = showAllPrintableReportCards;
window.filterFinalReportCards = filterFinalReportCards;
window.downloadAllReportCards = downloadAllReportCards;

// Testing and debugging functions (accessible from browser console)
window.testStepClick = function(stepNumber) {
    console.log(`🧪 Testing step ${stepNumber} click...`);
    const step = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (step) {
        console.log('Step element found, triggering click...');
        step.click();
    } else {
        console.error(`Step ${stepNumber} element not found!`);
    }
};

window.debugSteps = function() {
    console.log('🔍 Step Debug Information:');
    console.log('Current step:', currentStep);
    console.log('Uploaded data:', !!uploadedStudentsData);
    console.log('Detected subjects:', detectedSubjects.length);
    
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = parseInt(step.getAttribute('data-step'));
        const accessible = isStepAccessible(stepNumber);
        console.log(`Step ${stepNumber}: accessible=${accessible}, has click listener=${!!step.onclick || step._hasClickListener}`);
    });
};

window.goToStep = goToStep; // Make goToStep globally accessible

// File upload debugging functions
window.testFileUpload = function() {
    console.log('🧪 Testing file upload setup...');
    
    const excelFileInput = document.getElementById('excelFile');
    const uploadArea = document.getElementById('uploadArea');
    const browseBtn = document.getElementById('browseBtn');
    const newBrowseBtn = document.getElementById('newBrowseBtn');
    
    console.log('Excel input:', !!excelFileInput);
    console.log('Upload area:', !!uploadArea);
    console.log('Original browse button:', !!browseBtn);
    console.log('New browse button (after upload):', !!newBrowseBtn);
    
    // Test clicking the active browse button
    const activeBtn = newBrowseBtn || browseBtn;
    if (activeBtn) {
        console.log('Testing click on active browse button...');
        activeBtn.click();
    } else {
        console.error('No browse button found!');
    }
};

window.triggerFileInput = function() {
    console.log('📋 Directly triggering file input...');
    const excelFileInput = document.getElementById('excelFile');
    if (excelFileInput) {
        excelFileInput.click();
    } else {
        console.error('Excel file input not found!');
    }
};

// Helper function to output to debug panel
function debugLog(message) {
    console.log(message);
    const debugOutput = document.getElementById('debugOutput');
    if (debugOutput) {
        debugOutput.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
}

// Simple test to verify everything is working
window.simpleTest = function() {
    const debugOutput = document.getElementById('debugOutput');
    if (debugOutput) debugOutput.innerHTML = ''; // Clear previous
    
    debugLog('🧪 Running simple file upload test...');
    
    // Check all required elements
    const fileInput = document.getElementById('excelFile');
    const browseBtn = document.getElementById('browseBtn');
    const uploadArea = document.getElementById('uploadArea');
    
    debugLog(`File input element: ${!!fileInput}`);
    debugLog(`Browse button element: ${!!browseBtn}`);
    debugLog(`Upload area element: ${!!uploadArea}`);
    
    if (fileInput) {
        debugLog(`File input ID: ${fileInput.id}`);
        debugLog(`File input type: ${fileInput.type}`);
        debugLog(`File input accept: ${fileInput.accept}`);
        debugLog(`File input disabled: ${fileInput.disabled}`);
        debugLog(`File input display: ${getComputedStyle(fileInput).display}`);
        
        // Try to trigger click directly
        debugLog('Attempting to click file input...');
        try {
            fileInput.click();
            debugLog('✅ File input click successful');
        } catch (error) {
            debugLog(`❌ File input click failed: ${error.message}`);
        }
    }
    
    if (browseBtn) {
        debugLog(`Browse button text: ${browseBtn.textContent}`);
        debugLog(`Browse button disabled: ${browseBtn.disabled}`);
        debugLog(`Browse button cursor: ${getComputedStyle(browseBtn).cursor}`);
        
        // Test if browse button has event listeners
        const clonedBtn = browseBtn.cloneNode(true);
        const hasListeners = browseBtn !== clonedBtn;
        debugLog(`Browse button has listeners: ${hasListeners}`);
    }
};

// Configuration Management Functions
function toggleConfigPanel() {
    const panel = document.getElementById('configPanel');
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
}

function loadConfiguration() {
    // Load from localStorage if available
    const saved = localStorage.getItem('reportCardConfig');
    if (saved) {
        reportCardConfig = { ...reportCardConfig, ...JSON.parse(saved) };
    }
    
    // Update input fields - only if they exist
    const elements = {
        schoolName: document.getElementById('schoolName'),
        schoolSubtitle: document.getElementById('schoolSubtitle'),
        examTitle: document.getElementById('examTitle'),
        maxMarks: document.getElementById('maxMarks'),
        minMarks: document.getElementById('minMarks'),
        subject1: document.getElementById('subject1'),
        subject2: document.getElementById('subject2'),
        subject3: document.getElementById('subject3'),
        subject4: document.getElementById('subject4'),
        subject5: document.getElementById('subject5'),
        subject6: document.getElementById('subject6')
    };
    
    if (elements.schoolName) elements.schoolName.value = reportCardConfig.schoolName;
    if (elements.schoolSubtitle) elements.schoolSubtitle.value = reportCardConfig.schoolSubtitle;
    if (elements.examTitle) elements.examTitle.value = reportCardConfig.examTitle;
    if (elements.maxMarks) elements.maxMarks.value = reportCardConfig.maxMarks;
    if (elements.minMarks) elements.minMarks.value = reportCardConfig.minMarks;
    if (elements.subject1) elements.subject1.value = reportCardConfig.subjects.subject1;
    if (elements.subject2) elements.subject2.value = reportCardConfig.subjects.subject2;
    if (elements.subject3) elements.subject3.value = reportCardConfig.subjects.subject3;
    if (elements.subject4) elements.subject4.value = reportCardConfig.subjects.subject4;
    if (elements.subject5) elements.subject5.value = reportCardConfig.subjects.subject5;
    if (elements.subject6) elements.subject6.value = reportCardConfig.subjects.subject6;
    
    // Update calculated totals display (only if function exists)
    if (typeof updateCalculatedTotals === 'function') {
        updateCalculatedTotals();
    }
}

function saveConfiguration() {
    // Update configuration from input fields
    reportCardConfig.schoolName = document.getElementById('schoolName').value;
    reportCardConfig.schoolSubtitle = document.getElementById('schoolSubtitle').value;
    reportCardConfig.examTitle = document.getElementById('examTitle').value;
    reportCardConfig.maxMarks = parseInt(document.getElementById('maxMarks').value);
    reportCardConfig.minMarks = parseInt(document.getElementById('minMarks').value);
    reportCardConfig.subjects.subject1 = document.getElementById('subject1').value;
    reportCardConfig.subjects.subject2 = document.getElementById('subject2').value;
    reportCardConfig.subjects.subject3 = document.getElementById('subject3').value;
    reportCardConfig.subjects.subject4 = document.getElementById('subject4').value;
    reportCardConfig.subjects.subject5 = document.getElementById('subject5').value;
    reportCardConfig.subjects.subject6 = document.getElementById('subject6').value;
    
    // Update calculated totals display
    updateCalculatedTotals();
    
    // Save to localStorage (only the editable properties)
    const configToSave = {
        schoolName: reportCardConfig.schoolName,
        schoolSubtitle: reportCardConfig.schoolSubtitle,
        examTitle: reportCardConfig.examTitle,
        maxMarks: reportCardConfig.maxMarks,
        minMarks: reportCardConfig.minMarks,
        subjects: reportCardConfig.subjects
    };
    localStorage.setItem('reportCardConfig', JSON.stringify(configToSave));
    
    showMessage('Configuration saved successfully! Total marks auto-calculated.', 'success');
}

function resetConfiguration() {
    // Reset to default values
    reportCardConfig = {
        schoolName: "GLOBAL'S SANMARG PUBLIC SCHOOL BIDAR",
        schoolSubtitle: "English Medium School With Shaba-E-Hifz and IIT Foundation Course",
        examTitle: "Marks Card Annual Exam (2020-21)",
        maxMarks: 100,
        minMarks: 35,
        subjects: {
            subject1: "Mathematics",
            subject2: "Science",
            subject3: "Social",
            subject4: "English",
            subject5: "Kannada",
            subject6: "Hindi/Urdu"
        },
        // Auto-calculated properties
        get totalMaxMarks() {
            return this.maxMarks * 6; // 6 subjects
        },
        get totalMinMarks() {
            return this.minMarks * 6; // 6 subjects
        }
    };
    
    // Clear localStorage
    localStorage.removeItem('reportCardConfig');
    
    // Reload form fields
    loadConfiguration();
    
    showMessage('Configuration reset to defaults! Totals auto-calculated.', 'info');
}

// Function to update the calculated totals display
function updateCalculatedTotals() {
    const maxMarksElement = document.getElementById('maxMarks');
    const minMarksElement = document.getElementById('minMarks');
    
    if (!maxMarksElement || !minMarksElement) {
        console.error('Max marks or min marks elements not found');
        return;
    }
    
    const maxMarks = parseInt(maxMarksElement.value) || 100;
    const minMarks = parseInt(minMarksElement.value) || 35;
    
    const totalMax = maxMarks * 6; // 6 subjects
    const totalMin = minMarks * 6; // 6 subjects
    
    console.log(`Updating totals: Max=${maxMarks} → Total=${totalMax}, Min=${minMarks} → Total=${totalMin}`);
    
    const totalMaxDisplay = document.getElementById('totalMaxDisplay');
    const totalMinDisplay = document.getElementById('totalMinDisplay');
    
    if (totalMaxDisplay) totalMaxDisplay.textContent = totalMax;
    if (totalMinDisplay) totalMinDisplay.textContent = totalMin;
    
    // Update the config object values
    reportCardConfig.maxMarks = maxMarks;
    reportCardConfig.minMarks = minMarks;
}

// Function to update the batch totals display
function updateBatchTotals() {
    console.log('🔢 updateBatchTotals called');
    
    const batchMaxElement = document.getElementById('batchMaxMarks');
    const batchMinElement = document.getElementById('batchMinMarks');
    
    console.log('   → batchMaxElement:', batchMaxElement);
    console.log('   → batchMinElement:', batchMinElement);
    
    if (!batchMaxElement || !batchMinElement) {
        console.error('❌ Batch marks elements not found');
        console.error('   → batchMaxElement exists:', !!batchMaxElement);
        console.error('   → batchMinElement exists:', !!batchMinElement);
        return;
    }
    
    const batchMax = parseInt(batchMaxElement.value) || 100;
    const batchMin = parseInt(batchMinElement.value) || 35;
    
    const totalMax = batchMax * 6; // 6 subjects
    const totalMin = batchMin * 6; // 6 subjects
    
    console.log(`   → Calculated totals: Max=${batchMax} → Total=${totalMax}, Min=${batchMin} → Total=${totalMin}`);
    
    const batchTotalMaxDisplay = document.getElementById('batchTotalMax');
    const batchTotalMinDisplay = document.getElementById('batchTotalMin');
    
    console.log('   → Display elements found:', !!batchTotalMaxDisplay, !!batchTotalMinDisplay);
    
    if (batchTotalMaxDisplay) {
        console.log('   → Updating max display from', batchTotalMaxDisplay.textContent, 'to', totalMax);
        batchTotalMaxDisplay.textContent = totalMax;
        
        // Update the formula text as well
        const maxFormulaElement = batchTotalMaxDisplay.parentElement.querySelector('.total-formula');
        if (maxFormulaElement) {
            maxFormulaElement.textContent = `(${batchMax} × 6 subjects)`;
        }
    }
    
    if (batchTotalMinDisplay) {
        console.log('   → Updating min display from', batchTotalMinDisplay.textContent, 'to', totalMin);
        batchTotalMinDisplay.textContent = totalMin;
        
        // Update the formula text as well
        const minFormulaElement = batchTotalMinDisplay.parentElement.querySelector('.total-formula');
        if (minFormulaElement) {
            minFormulaElement.textContent = `(${batchMin} × 6 subjects)`;
        }
    }
    
    console.log('✅ updateBatchTotals completed');
}

// Utility function to validate Excel data
function validateExcelData(data) {
    const requiredFields = ['StudentName', 'Mathematics', 'Science', 'Social', 'English', 'Kannada'];
    const alternativeFields = {
        'StudentName': ['Student Name', 'Name'],
        'Mathematics': ['Math'],
        'Social': ['Social Science'],
        'HindiUrdu': ['Hindi/Urdu', 'Hindi', 'Urdu']
    };
    
    return data.every(student => {
        return requiredFields.every(field => {
            if (student[field] !== undefined) return true;
            if (alternativeFields[field]) {
                return alternativeFields[field].some(altField => student[altField] !== undefined);
            }
            return false;
        });
    });
}