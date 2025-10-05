# Report Card Generator - Database Edition

## Overview

This updated version of the Report Card Generator now works directly with your Supabase database instead of Excel uploads. It provides a streamlined workflow for generating individual student report cards.

## 🔧 Configuration

The system is pre-configured to work with:
- **Tenant ID**: `9abe534f-1a12-474c-a387-f8795ad3ab5a`
- **Supabase URL**: `https://dmagnsbdjsnzsddxqrwd.supabase.co`
- All data queries are automatically filtered by your tenant

## 🔄 Workflow

### Step 1: Select Class & Academic Year
1. **Academic Year**: Choose from available academic years in your database
2. **Class Selection**: After selecting academic year, classes will be loaded
3. **Class Information**: View class details including:
   - Class name and section
   - Academic year
   - Class teacher (if assigned)
   - Total number of students

### Step 2: Select Exam
1. **Exam Cards**: Browse available exams for the selected class
2. **Exam Details**: Each card shows:
   - Exam name
   - Start and end dates
   - Maximum marks
   - Remarks (if any)
3. **Selection**: Click on an exam card to select it

### Step 3: Select Student
1. **Search Function**: Use the search box to find students by:
   - Student name
   - Roll number
   - Admission number
2. **Student Cards**: View student information including:
   - Roll number
   - Student name
   - Father's name
   - Admission number
   - Gender and date of birth
3. **Selection Summary**: See your current class and exam selection
4. **Selection**: Click on a student card to select them

### Step 4: Generate Report Card
1. **Automatic Generation**: Report card is generated with:
   - School information
   - Student details
   - Subject-wise marks from the database
   - Calculated totals, percentages, and grades
   - Co-scholastic areas
   - Signature sections

2. **Available Actions**:
   - **Print**: Print the report card directly
   - **View PDF**: View as PDF (opens in new tab)
   - **Download PDF**: Download as PDF file
   - **New Card**: Generate another report card

## 📊 Data Requirements

### Database Tables Used
- `classes`: Class information and academic years
- `exams`: Exam details for each class
- `students`: Student information and enrollment
- `marks`: Individual student marks for each exam/subject
- `subjects`: Subject information for each class
- `school_details`: School information (optional)
- `teachers`: Teacher information (for class teacher display)
- `parents`: Parent information (for father's name)

### Required Data Structure
- All tables must have `tenant_id` field with your tenant ID
- Students must be linked to classes via `class_id`
- Marks must be linked to students, exams, and subjects
- Exams must be linked to classes

## 🎯 Features

### ✅ Implemented Features
- **Academic Year Filtering**: All data filtered by selected academic year
- **Tenant Isolation**: Only your organization's data is accessed
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Search**: Instant student search functionality
- **Grade Calculation**: Automatic percentage and grade calculation
- **Professional Layout**: Diamond border design matching school standards
- **Multiple Actions**: Print, view, and download options

### 🔧 Technical Features
- **Database Integration**: Direct Supabase connection
- **Error Handling**: Graceful handling of missing data
- **Loading States**: Visual feedback during data loading
- **Validation**: Ensures all required selections are made
- **Reset Functionality**: Easy restart for generating multiple cards

## 🚀 Usage Tips

1. **Data Preparation**: Ensure your database has:
   - Classes with academic years
   - Exams linked to classes
   - Students enrolled in classes
   - Marks entered for students in exams

2. **Best Practices**:
   - Use consistent academic year formats (e.g., "2023-24")
   - Ensure all students have roll numbers for better organization
   - Enter complete parent information for better report cards

3. **Troubleshooting**:
   - If no data appears, check your internet connection
   - Verify that data exists in your database for the selected academic year
   - Check browser console for any error messages

## 📱 Browser Compatibility

- **Chrome**: 60+ ✅
- **Firefox**: 55+ ✅
- **Safari**: 12+ ✅
- **Edge**: 79+ ✅

## 🔐 Security

- Data is accessed using row-level security with tenant isolation
- No sensitive data is stored locally
- All database queries include tenant filtering
- Supabase handles authentication and authorization

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your database structure matches the requirements
3. Ensure you have proper data in all required tables

## 🎉 Enjoy Your New Report Card Generator!

The system is now ready to generate professional report cards directly from your database. No more Excel uploads - just select, click, and generate!