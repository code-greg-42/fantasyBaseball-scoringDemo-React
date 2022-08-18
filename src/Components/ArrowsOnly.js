export default function MediaButtons(props) {

    function handleBackClick() {
        if (props.useIndex > 0) {
        props.setUseIndex(prevIndex => prevIndex - 1);
        }
    }

    function handleForwardClick() {
        if (props.useIndex < props.totalProposals - 1) {
            props.setUseIndex(prevIndex => prevIndex + 1)
        }
    }

    return (<>
        <div className="grid relative justify-center">
        <div className="inline-flex z-20">
            <svg xmlns="http://www.w3.org/2000/svg" onClick={handleBackClick} className="h-10 w-10 cursor-pointer hover:fill-blue-400" viewBox="0 0 20 20" fill="#c3dafb">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
            <h1 className="mt-1 mx-1 text-2xl font-bold">{props.useIndex + 1} / {props.totalProposals}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" onClick={handleForwardClick} className="h-10 w-10 hover:fill-blue-400 cursor-pointer" viewBox="0 0 20 20" fill="#c3dafb">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
            </svg>
        </div>
        </div>
    </>)
}