import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import './App.css'
import {
	handleDownload,
	handleFileChange,
	handleGenerateSanta
} from './functions'
import { Loader } from './Loader'

const App = () => {
	const [employees, setEmployees] = useState([])
	const [assignments, setAssignments] = useState([])
	const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
	const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
	const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
	const [fileName, setFileName] = useState('No file chosen')
	const [isLoading, setIsLoading] = useState(false)
	const [isDownloadingCSV, setIsDownloadingCSV] = useState(false)
	const [isDownloadingXLSX, setIsDownloadingXLSX] = useState(false)

	return (
		<div className='app'>
			<Toaster position='top-center' />
			<h1 className='title'>{`Secret Santa ${new Date().getFullYear()}`}</h1>

			<div className='container'>
				<div className='file-upload'>
					<label className='file-label'>
						Upload Employee List (CSV or XLSX)
					</label>
					<div className='file-status'>
						<span className='file-name'>{fileName}</span>
					</div>
					<div className='button-group'>
						<div className='file-input-wrapper'>
							<input
								type='file'
								accept='.xlsx,.csv'
								onChange={(event) =>
									handleFileChange(event, setFileName, setEmployees)
								}
								className='file-input'
								id='file-upload'
							/>
							<label htmlFor='file-upload' className='file-button'>
								Choose File
							</label>
						</div>
						{employees.length > 0 && (
							<div className='action-buttons'>
								<button
									onClick={() => setIsEmployeeModalOpen(true)}
									className='view-employees-button'
								>
									View Employees ({employees.length})
								</button>
								{assignments.length > 0 && (
									<>
										<button
											onClick={() => setIsAssignmentModalOpen(true)}
											className='view-assignments-button'
										>
											View Assignments
										</button>
										<button
											onClick={() => setIsDownloadModalOpen(true)}
											className='download-assignments-button'
										>
											Download Assignments
										</button>
									</>
								)}
							</div>
						)}
					</div>
				</div>

				<button
					onClick={() =>
						handleGenerateSanta(setIsLoading, employees, setAssignments)
					}
					className={`generate-button ${
						employees.length === 0 ? 'disabled' : ''
					}`}
					disabled={employees.length === 0 || isLoading}
				>
					{isLoading ? <Loader /> : 'Generate Secret Santa'}
				</button>
			</div>

			{isEmployeeModalOpen && (
				<EmployeeModal
					setIsOpen={setIsEmployeeModalOpen}
					employees={employees}
				/>
			)}

			{isAssignmentModalOpen && (
				<AssignmentModal
					setIsOpen={setIsAssignmentModalOpen}
					assignments={assignments}
				/>
			)}

			{isDownloadModalOpen && (
				<DownloadModal
					setIsOpen={setIsDownloadModalOpen}
					handleDownload={(format) =>
						handleDownload(
							format,
							assignments,
							setIsDownloadingCSV,
							setIsDownloadingXLSX,
							setIsDownloadModalOpen
						)
					}
					isDownloadingCSV={isDownloadingCSV}
					isDownloadingXLSX={isDownloadingXLSX}
				/>
			)}
		</div>
	)
}

const EmployeeModal = ({ setIsOpen, employees }) => {
	return (
		<div className='modal-overlay'>
			<div className='modal-content' onClick={(e) => e.stopPropagation()}>
				<h3 className='modal-title'>Uploaded Employees</h3>
				<div className='modal-body'>
					<ul className='employee-list'>
						{employees.map((emp, index) => (
							<li key={index} className='employee-item'>
								<span className='employee-name'>{emp.name}</span> - {emp.email}
							</li>
						))}
					</ul>
				</div>
				<button className='modal-close' onClick={() => setIsOpen(false)}>
					Close
				</button>
			</div>
		</div>
	)
}

const AssignmentModal = ({ setIsOpen, assignments }) => {
	return (
		<div className='modal-overlay'>
			<div className='modal-content' onClick={(e) => e.stopPropagation()}>
				<h3 className='modal-title'>Secret Santa Assignments</h3>
				<div className='modal-body'>
					<ul className='assignment-list'>
						{assignments.map((assign, index) => (
							<li key={index} className='assignment-item'>
								<div className='assignment-pair'>
									<span className='giver'>{assign.giverEmail}</span>
									<span className='arrow'>→</span>
									<span className='receiver'>{assign.receiverEmail}</span>
								</div>
							</li>
						))}
					</ul>
				</div>
				<button className='modal-close' onClick={() => setIsOpen(false)}>
					Close
				</button>
			</div>
		</div>
	)
}

const DownloadModal = ({
	setIsOpen,
	handleDownload,
	isDownloadingCSV,
	isDownloadingXLSX
}) => {
	return (
		<div className='modal-overlay'>
			<div className='modal-content' onClick={(e) => e.stopPropagation()}>
				<h3 className='modal-title'>Download Assignments</h3>
				<div className='modal-body'>
					<button
						onClick={() => handleDownload('csv')}
						className='download-button'
						disabled={isDownloadingCSV || isDownloadingXLSX}
					>
						{isDownloadingCSV ? (
							<div className='loader'>
								<div className='loader-spinner'></div>
								<span className='loader-text'>Downloading CSV...</span>
							</div>
						) : (
							'Download as CSV'
						)}
					</button>
					<button
						onClick={() => handleDownload('xlsx')}
						className='download-button'
						disabled={isDownloadingXLSX || isDownloadingCSV}
					>
						{isDownloadingXLSX ? (
							<div className='loader'>
								<div className='loader-spinner'></div>
								<span className='loader-text'>Downloading XLSX...</span>
							</div>
						) : (
							'Download as XLSX'
						)}
					</button>
				</div>
				<button
					className='modal-close'
					onClick={() => setIsOpen(false)}
					disabled={isDownloadingCSV || isDownloadingXLSX}
				>
					Close
				</button>
			</div>
		</div>
	)
}

export default App
