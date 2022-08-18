export default function MediaButtons(props) {
    return (<>
        <div className="grid fixed top-2 right-2 justify-center">
        <div className="inline-flex z-20">
            <svg xmlns="http://www.w3.org/2000/svg" onClick={props.onBackClick} className="h-10 w-10 cursor-pointer hover:fill-slate-600" viewBox="0 0 20 20" fill="#c3dafb">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" onClick={props.onPlayPauseClick} className="h-10 w-10 hover:fill-slate-600 cursor-pointer" viewBox="0 0 20 20" fill="#c3dafb">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>: <svg xmlns="http://www.w3.org/2000/svg" onClick={props.onPlayPauseClick} className="h-10 w-10 hover:fill-slate-600 cursor-pointer" viewBox="0 0 20 20" fill="#c3dafb">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" onClick={props.onForwardClick} className="h-10 w-10 hover:fill-slate-600 cursor-pointer" viewBox="0 0 20 20" fill="#c3dafb">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
        </div>
        </div>
    </>)
}