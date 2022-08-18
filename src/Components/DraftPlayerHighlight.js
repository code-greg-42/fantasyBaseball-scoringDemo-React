import Loader from "./Loader"
import {useState, useRef, useEffect} from "react"
import {getDraftPlayerHighlight} from "../functions/highlightFunction"

export default function DailyHomerPage(props) {

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [videoDate, setVideoDate] = useState("");
    const [videoHeadline, setVideoHeadline] = useState("");

    const videoRef = useRef();

    useEffect(() => {
        playHighlight();
    }, [])

    async function playHighlight() {
        const videos = await getDraftPlayerHighlight(props.selectedPlayerStats.playerId, props.selectedPlayerStats.teamId);
        console.log(videos);
        if (videos.length > 0) {
            setVideoLink(videos[0]);
            setVideoDate(videos[1]);
            setVideoHeadline(videos[2]);
        } else {
            setErrorMessage('No highlights found.');
        }
        setLoading(false);
    }

    return (<>
    <div className="z-20 fixed inset-0 overflow-y-hidden h-screen w-screen bg-gray-500 bg-opacity-75">
        {videoLink ? <div className="fixed inset-0 m-auto z-20">
        <video ref={videoRef} controls className="border-8 border-black fixed inset-0 m-auto z-20 rounded-xl max-w-5xl cursor-pointer" src={videoLink} autoPlay={true} muted={false} />
        </div>: ""}
        {loading ? <div className="fixed inset-0 m-auto">
        <Loader isBigger={true}/>
        </div>: ""}
        <div className="fixed z-20 inline-flex items-center top-0 left-0 w-full h-12 text-lg bg-gray-900 p-3">
            <h2 className="font-bold fixed top-2 left-3 text-xl text-blue-200 text-left">{videoDate}</h2>
            <h2 className="font-bold fixed top-2 right-3 text-xl text-blue-200 text-right">{errorMessage ? errorMessage: videoHeadline}</h2>
        </div>
        <div className="z-20 fixed bottom-[10vh] right-[42vw]">
            <button 
            onClick={() => props.setDraftHighlightOpen(false)}
            className="bg-blue-800 inline-flex shadow-2xl border border-gray-900 hover:bg-blue-900 hover:text-white w-[16vw] h-[5vh] mt-2 rounded-md text-blue-200 items-center justify-center space-x-2 p-2">
                Go back
            </button>
        </div>
    </div>
    </>)
}