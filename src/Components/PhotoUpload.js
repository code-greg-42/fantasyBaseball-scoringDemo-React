export default function PhotoUpload(props) {
    return (
      <button
        type="button"
        onClick={props.onFileClick}
        className="relative flex w-full border-2 border-blue-400 border-dashed border-opacity-50 rounded-lg p-12 text-center justify-center items-center hover:border-gray-400 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="mt-2 block text-sm font-medium text-blue-200">Upload a team photo</span>
      </button>
    )
  }
  