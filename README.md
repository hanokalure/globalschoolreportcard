# School Report Card Generator

A web-based application to generate professional report cards from Excel data, designed to match the format of Global's Sanmarg Public School Bidar.

## Features

- Upload Excel files with student data
- Automatically calculate totals, percentages, and grades
- Generate professional report cards matching the school format
- Download individual report cards as PDF
- Responsive design for mobile and desktop
- Pass/Fail indicators with color coding

## Excel File Format Required

Your Excel file should contain the following columns:

| Column Name | Description | Required |
|-------------|-------------|----------|
| ROLL NUMNER | Roll number of the student | Yes |
| STUDENT_NAME | Full name of the student | Yes |
| FATHER NAME | Father's name | Yes |
| CLASS | Student's class (e.g., 5th, NURSERY) | Yes |
| SECTION | Class section (e.g., A, B) | Optional |
| MATHS  | Math marks (out of 100) | Yes |
| SCIENCE | Science marks (out of 100) | Yes |
| SOCIAL | Social Science marks (out of 100) | Yes |
| ENGLISH | English marks (out of 100) | Yes |
| KANNADA | Kannada marks (out of 100) | Yes |
| URDU\HINDI | Hindi/Urdu marks (out of 100) | Yes |

### Alternative Column Names Supported

The system also accepts these alternative column names:
- `Student Name` instead of `StudentName`
- `Father Name` instead of `FatherName`
- `Roll No` instead of `RollNo`
- `Math` instead of `Mathematics`
- `Social Science` instead of `Social`
- `Hindi/Urdu`, `Hindi`, or `Urdu` instead of `HindiUrdu`

## Sample Excel Data

```csv
ROLL NUMNER,STUDENT_NAME,FATHER NAME,CLASS,SECTION,MATHS ,SCIENCE,SOCIAL,ENGLISH,KANNADA,URDU\HINDI
1,RIYANSH,RAKESH,NURSERY,,23,22,21,2,20,21
2,MOHD SHAHZAIB,MOHD SALAHUDDIN,NURSERY,,22,12,13,14,15,16
16,SYEDA WANIYA MAHAM,SYED ZAHIR,5th,A,66,65,65,66,66,70
17,AHMED ALI KHAN,MOHAMMED SALEEM,5th,A,75,78,72,80,74,76
18,FATIMA BEGUM,ABDUL RAHMAN,5th,A,88,85,90,87,82,89
```

## How to Use

1. **Open the Application**
   - Open `index.html` in a web browser

2. **Upload Excel File**
   - Click on "Choose File" button
   - Select your Excel file (.xlsx or .xls format)
   - The system will automatically process the file

3. **Review Report Cards**
   - Report cards will be generated automatically
   - Each report card shows:
     - Student information
     - Subject-wise marks
     - Pass/Fail status for each subject
     - Total marks, percentage, and grade
     - Co-scholastic areas section
     - Signature sections

4. **Download PDFs**
   - Click the "Download PDF" button on each report card
   - PDF will be saved with the filename: `ReportCard_[StudentName]_[Class].pdf`

## Grading System

| Percentage | Grade |
|------------|-------|
| 90% and above | A+ |
| 80% - 89% | A |
| 70% - 79% | B+ |
| 60% - 69% | B |
| 50% - 59% | C+ |
| 40% - 49% | C |
| 35% - 39% | D |
| Below 35% | F |

## Pass/Fail Criteria

- **Pass**: 35 marks or above in each subject
- **Fail**: Below 35 marks in any subject

## File Structure

```
global1/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── sample_students.csv # Sample data file
└── README.md          # This file
```

## Technical Requirements

- Modern web browser with JavaScript enabled
- Internet connection (for loading external libraries)
- Excel files in .xlsx or .xls format

## External Libraries Used

- **XLSX.js**: For reading Excel files
- **html2pdf.js**: For generating PDF downloads

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

**Excel file not loading:**
- Ensure the file is in .xlsx or .xls format
- Check that all required columns are present
- Verify that the column names match the expected format

**PDF download not working:**
- Ensure you have a modern browser with JavaScript enabled
- Check that pop-up blockers are not preventing downloads

**Report cards not displaying correctly:**
- Refresh the page and try uploading the file again
- Check browser console for any error messages

## Customization

To modify the school name, exam year, or other details:
1. Edit the HTML template in `index.html`
2. Modify the school information section
3. Update CSS styles in `styles.css` as needed

## Support

For technical support or customization requests, please ensure you have:
- Sample Excel file that's causing issues
- Browser version information
- Error messages (if any)"# reportcard" 
