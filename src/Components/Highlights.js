import { Fragment, useEffect, useState, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {getHighlights, getMoreHighlights} from "../functions/highlightFunction"
import Loader from "./Loader"

export default function Highlights(props) {
    const [linkOne, setLinkOne] = useState("");
    const [linkTwo, setLinkTwo] = useState("");
    const [videoDateOne, setVideoDateOne] = useState("");
    const [videoDateTwo, setVideoDateTwo] = useState("");
    const [loading, setLoading] = useState(true);
    const [showEmptyMessage, setShowEmptyMessage] = useState(false);

    const videoRefOne = useRef();
    const videoRefTwo = useRef();

    async function getVideoLinks() {
      // search for video links, keep going back in time if none are found, show empty message if completely empty
        console.log(props.selectedPlayerStats);
        if (props.selectedPlayerStats.teamId !== undefined) {
        const videos = await getHighlights(props.selectedPlayerStats.id, props.selectedPlayerStats.teamId);
        console.log(videos);
        setLinkOne(videos[0]);
        setVideoDateOne(videos[1]);
        if (videos.length > 2) {
            setLinkTwo(videos[2]);
            setVideoDateTwo(videos[3]);
        }
        if (videos.length === 0) {
            setShowEmptyMessage(true);
        }
        setLoading(false);
      } else {
        setShowEmptyMessage(true);
        setLoading(false);
      }
    }

    async function getMoreVideoLinks() {
      // run it again from where it left off
        setLoading(true);
        setShowEmptyMessage(false);
        setLinkTwo("");
        setVideoDateTwo("");
        if (props.selectedPlayerStats.teamId !== undefined) {
        const videos = await getMoreHighlights(props.selectedPlayerStats.id, props.selectedPlayerStats.teamId, "2022-" + videoDateTwo);
        console.log(videos);
        setLinkOne(videos[0]);
        setVideoDateOne(videos[1]);
        if (videos.length > 2) {
            setLinkTwo(videos[2]);
            setVideoDateTwo(videos[3]);
        }
        if (videos.length === 0) {
          setShowEmptyMessage(true);
        }
        setLoading(false);
      } else {
        setShowEmptyMessage(true);
        setLoading(false);
      }
    }

    function playPauseOne() {
        if (videoRefOne.current.paused) {
            videoRefOne.current.play();
        } else {
            videoRefOne.current.pause();
        }
    }

    function playPauseTwo() {
        if (videoRefTwo.current.paused) {
            videoRefTwo.current.play();
        } else {
            videoRefTwo.current.pause();
        }
    }

    function handleRestartOne() {
      videoRefOne.current.currentTime = 0;
    }

    function handleRestartTwo() {
      videoRefTwo.current.currentTime = 0;
    }

    useEffect(() => {
        getVideoLinks();
    }, []);
    
    return (<>
        <Transition.Root show={props.highlightOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={props.setHighlightOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
         <Dialog.Panel className="relative bg-gray-800 rounded-lg px-4 pt-2 pb-4 text-center overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full sm:p-4">
        <div className="flex" />
        <h1 className="text-gray-100 mb-2 font-bold">{props.selectedPlayer}</h1>
        {showEmptyMessage ? <h2 className="text-gray-300 mt-16 mb-16 font-semibold">No recent highlights.</h2>: ""}
        {loading ? <Loader /> : <div>
        <button type="button"
        disabled={showEmptyMessage}
        className="absolute top-1 right-1 rounded-md border border-transparent shadow-2xl px-4 py-2 bg-blue-900 text-base font-medium text-blue-200 hover:bg-blue-800 focus:outline-none sm:text-sm"
        onClick={getMoreVideoLinks}>
            More Highlights
        </button>
        <div className="relative">
        <p className="absolute top-0 left-1 text-left text-gray-100 text-xs">{videoDateOne}</p>
        {linkOne ? <img src={require('../media_files/restart_button_2.png')} className="absolute z-40 cursor-pointer bottom-1 left-0 h-10 w-10" onClick={handleRestartOne}/>: ""}
        {!showEmptyMessage ? <video className="max-w-full pb-1 border-b-4 cursor-pointer" src={linkOne} autoPlay={true} muted={false} ref={videoRefOne}
        onClick={playPauseOne} />: ""}
        </div>
        <div className="relative">
        <p className="absolute top-0 left-1 text-left text-gray-100 text-sm">{videoDateTwo}</p>
        {linkTwo ? <img src={require('../media_files/restart_button_2.png')} className="absolute z-40 cursor-pointer bottom-1 left-0 h-10 w-10" onClick={handleRestartTwo}/>: ""}
        {!showEmptyMessage ? <video className="max-w-full mt-1 cursor-pointer" src={linkTwo} ref={videoRefTwo}
        onClick={playPauseTwo} />: ""}
        </div>
        </div>}
         <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-2xl px-4 py-2 bg-blue-900 text-base font-medium text-blue-200 hover:bg-blue-800 focus:outline-none sm:text-sm"
                    onClick={() => props.setHighlightOpen(false)}
                  >
                    Go back
                  </button>
                </div>
         </Dialog.Panel>
         </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
    </>)
}