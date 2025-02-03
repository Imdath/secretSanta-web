import axios from 'axios'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import toast from 'react-hot-toast'

// Function to validate email
const validateEmail = (email) => {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
	return emailRegex.test(email)
}

export const handleFileUpload = async (event, setEmployees) => {
	const file = event.target.files[0]
	console.log('File selected:', file)
	if (!file) return

	const fileType = file.name.split('.').pop().toLowerCase()
	console.log('File type:', fileType)

	try {
		if (fileType === 'csv') {
			// Handle CSV file
			const text = await file.text()
			Papa.parse(text, {
				header: true,
				complete: (results) => {
					console.log('CSV parsing results:', results)

					// Check for required columns
					const headers = Object.keys(results.data[0])
					if (
						!headers.includes('Employee_Name') ||
						!headers.includes('Employee_EmailID')
					) {
						toast.error(
							'Please ensure the CSV file contains the columns "Employee_Name" and "Employee_EmailID"'
						)
						return
					}

					const employees = results.data
						.filter((row) => row.Employee_Name && row.Employee_EmailID)
						.map((row) => ({
							name: row.Employee_Name,
							email: row.Employee_EmailID
						}))

					// Validate emails
					const validEmails = employees.filter((emp) =>
						validateEmail(emp.email)
					)

					if (validEmails.length < 2) {
						toast.error(
							'Please ensure there are at least 2 employees with valid email addresses.'
						)
						return
					}

					console.log('Processed employees from CSV:', validEmails)
					setEmployees(validEmails)
				},
				error: (error) => {
					console.error('Error parsing CSV:', error)
					toast.error('Error reading CSV file. Please check the format.')
				}
			})
		} else if (fileType === 'xlsx') {
			// Handle XLSX file
			const data = await file.arrayBuffer()
			const workbook = XLSX.read(data)
			const worksheet = workbook.Sheets[workbook.SheetNames[0]]
			const jsonData = XLSX.utils.sheet_to_json(worksheet)
			console.log('XLSX parsing results:', jsonData)

			// Check for required columns
			const headers = Object.keys(jsonData[0])
			if (
				!headers.includes('Employee_Name') ||
				!headers.includes('Employee_EmailID')
			) {
				toast.error(
					'Please ensure the XLSX file contains the columns "Employee_Name" and "Employee_EmailID"'
				)
				return
			}

			const employees = jsonData
				.map((row) => ({
					name: row.Employee_Name || '', // Use the correct key from your JSON data
					email: row.Employee_EmailID || '' // Use the correct key from your JSON data
				}))
				.filter((emp) => emp.name && emp.email)

			// Validate emails
			const validEmails = employees.filter((emp) => validateEmail(emp.email))

			if (validEmails.length < 2) {
				toast.error(
					'Please ensure there are at least 2 employees with valid email addresses.'
				)
				return
			}

			console.log('Processed employees from XLSX:', validEmails)
			setEmployees(validEmails)
		}
	} catch (error) {
		console.error('Error reading file:', error)
		toast.error('Error reading file. Please check the format.')
	}
}

export const generateSecretSanta = async (employees, setAssignments) => {
	if (employees.length < 2) {
		toast.error('At least 2 employees required!')
		return
	}

	try {
		const response = await axios.post(
			`http://localhost:5000/assign-secret-santa/generate/${new Date().getFullYear()}`,
			{ employees }
		)
		setAssignments(response.data)
	} catch (error) {
		toast.error(
			'Error: ' + error.response?.data.message || 'Something went wrong!'
		)
	}
}

export const handleFileChange = (event, setFileName, setEmployees) => {
	const file = event.target.files[0]
	if (file) {
		const fileType = file.name.split('.').pop().toLowerCase()
		if (fileType !== 'xlsx' && fileType !== 'csv') {
			toast.error('Please upload either a CSV or XLSX file')
			return
		}
		setFileName(file.name)
		handleFileUpload(event, setEmployees)
	}
}

export const handleGenerateSanta = async (
	setIsLoading,
	employees,
	setAssignments
) => {
	setIsLoading(true)
	try {
		await generateSecretSanta(employees, setAssignments)
		toast.success('Secret Santa assignments generated successfully!')
	} catch (error) {
		toast.error(error.message || 'Failed to generate assignments')
	} finally {
		setIsLoading(false)
	}
}

export const handleDownload = async (
	format,
	assignments,
	setIsDownloadingCSV,
	setIsDownloadingXLSX,
	setIsDownloadModalOpen
) => {
	try {
		// Transform assignments to match the required CSV/XLSX headers
		const transformedAssignments = assignments.map((assignment) => ({
			Employee_Name: assignment.giverName,
			Employee_EmailID: assignment.giverEmail,
			Secret_Child_Name: assignment.receiverName,
			Secret_Child_EmailID: assignment.receiverEmail
		}))

		if (format === 'csv') {
			setIsDownloadingCSV(true)
			const csv = Papa.unparse(transformedAssignments)
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const link = document.createElement('a')
			link.href = URL.createObjectURL(blob)
			link.download = `secret_santa_assignments_${new Date().getFullYear()}.csv`
			await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing
			link.click()
			toast.success('CSV downloaded successfully!')
		} else if (format === 'xlsx') {
			setIsDownloadingXLSX(true)
			const ws = XLSX.utils.json_to_sheet(transformedAssignments)

			// Set column widths
			const columnWidths = [
				{ wch: 20 }, // Employee_Name
				{ wch: 30 }, // Employee_EmailID
				{ wch: 20 }, // Secret_Child_Name
				{ wch: 30 } // Secret_Child_EmailID
			]
			ws['!cols'] = columnWidths

			const wb = XLSX.utils.book_new()
			XLSX.utils.book_append_sheet(wb, ws, 'Assignments')
			await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing
			XLSX.writeFile(
				wb,
				`secret_santa_assignments_${new Date().getFullYear()}.xlsx`
			)
			toast.success('XLSX downloaded successfully!')
		}
	} catch (error) {
		toast.error(`Failed to download ${format.toUpperCase()} file`)
	} finally {
		setIsDownloadingCSV(false)
		setIsDownloadingXLSX(false)
		setIsDownloadModalOpen(false)
	}
}
