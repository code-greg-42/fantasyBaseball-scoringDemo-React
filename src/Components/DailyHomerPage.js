import Loader from "./Loader"
import MediaButtons from "./MediaButtons"
import Popdown from "./Popdown"
import {useState, useRef} from "react"
import {getDailyHomers} from "../functions/highlightFunction"

export default function DailyHomerPage(props) {

    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [links, setLinks] = useState([]);
    const [videoLink, setVideoLink] = useState("");
    const [videoHeadline, setVideoHeadline] = useState("Click play for today's home run highlights!");
    const [menuShow, setMenuShow] = useState(true);
    const [linkNumber, setLinkNumber] = useState(0);
    const [videoNumberDisplay, setVideoNumberDisplay] = useState("");

    const videoRef = useRef();

    async function handlePlayClick() {
        setErrorMessage("");
        setVideoHeadline("");
        setVideoNumberDisplay("");
        setLinkNumber(0);
        setMenuShow(false);
        setLoading(true);
        const videos = await getDailyHomers(selectedDate, setErrorMessage);
        console.log(videos);
        if (videos.length > 0) {
            setVideoLink(videos[0]);
            setVideoHeadline(videos[1]);
            setVideoNumberDisplay(` -- (1/${videos.length / 2})`)
            setLinks(videos);
        } else {
            setErrorMessage('No highlights found. Try yesterday!');
            setMenuShow(true);
        }
        setLoading(false);
    }

    function handleOnEnded() {
        setVideoLink(links[linkNumber + 2]);
        setVideoHeadline(links[linkNumber + 3]);
        setLinkNumber(linkNumber + 2);
        if (((linkNumber + 2) / 2 + 1) > links.length / 2) {
            setErrorMessage(`End of ${selectedDate.substring(5) ?? "today's"} highlights. Choose another day to see more!`);
            setSelectedDate("");
            setMenuShow(true);
        } else {
        setVideoNumberDisplay(` -- (${(linkNumber + 2) / 2 + 1}/${links.length / 2})`);
        }
    }

    function handleBackClick() {
        if (((linkNumber -2) / 2 + 1) > 0) {
        setVideoLink(links[linkNumber - 2])
        setVideoHeadline(links[linkNumber - 1]);
        setLinkNumber(linkNumber - 2);
        setVideoNumberDisplay(` -- (${(linkNumber - 2) / 2 + 1}/${links.length / 2})`);
        } else {
            videoRef.current.currentTime = 0;
        }
    }

    function handlePlayPauseClick() {
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    }

    function handleRestartClick() {
        videoRef.current.currentTime = 0;
      }

    function handleForwardClick() {
        setVideoLink(links[linkNumber + 2]);
        setVideoHeadline(links[linkNumber + 3]);
        setLinkNumber(linkNumber + 2);
        if (((linkNumber + 2) / 2 + 1) > links.length / 2) {
            setErrorMessage(`End of ${selectedDate.substring(5) ?? "today's"} highlights. Choose another day to see more!`);
            setSelectedDate("");
            setMenuShow(true);
        } else {
        setVideoNumberDisplay(` -- (${(linkNumber + 2) / 2 + 1}/${links.length / 2})`);
        }
    }

    return (<>
    <div className="overflow-y-hidden h-screen w-screen">
    <img src={require('../media_files/cbp_view.jpeg')} className="h-screen w-screen" />
        {menuShow ? <span className="grid h-28 fixed inset-0 m-auto"><input onChange={e => setSelectedDate(e.target.value)}
        className="bg-slate-700 relative rounded-md w-60 m-auto text-center text-blue-200" type="date" />
        <button
        onClick={handlePlayClick}
        className="m-auto relative text-2xl w-60 h-16 rounded-md shadow-2xl text-blue-200 bg-gray-900">
            Play
        </button></span>: ""}
        {videoLink ? <div className="fixed inset-0 m-auto z-20">
        <video ref={videoRef} controls className="border-8 border-black fixed inset-0 m-auto z-20 rounded-xl cursor-pointer" src={videoLink} onEnded={handleOnEnded} autoPlay={true} muted={false} />
        </div>: ""}
        {loading ? <div className="fixed inset-0 m-auto">
        <Loader isBigger={true}/>
        </div>: ""}
        {props.loginPanelOpen ? "": <div className="fixed z-20 top-0 left-0 w-full h-[54px] text-lg bg-gray-900 p-2">
            <div className="fixed top-3 left-2">
            <Popdown setNavSelect={props.setNavSelect} navSelect={props.navSelect} isSmall={true} setLoginPanelOpen={props.setLoginPanelOpen} loggedIn={props.loggedIn} />
            </div>
            <h2 className="font-bold text-xl mt-[5px] text-blue-200 text-center">{errorMessage ? errorMessage: videoHeadline + videoNumberDisplay}</h2>
            <MediaButtons onForwardClick={handleForwardClick} onBackClick={handleBackClick} onPlayPauseClick={handlePlayPauseClick} onRestartClick={handleRestartClick} />
        </div>}
    </div>
    </>)
}