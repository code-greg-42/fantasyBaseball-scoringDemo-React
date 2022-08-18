import RosterPhoto from "./RosterPhoto"
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { hitterInfo } from '../functions/nameStorage'

export default function PlayerProfile(props) {
  const [numberOfSeasons, setNumberOfSeasons] = useState("");
  const [photoUrl, setPhotoUrl] = useState("no_pfp.png");

  const details = hitterInfo[props.selectedPlayer];
  const playerStats = props.selectedPlayerStats;

  useEffect(() => {
    if (details) {
    getNumberOfSeasons();
    }
    setPhotoUrl(props.selectedPlayer.toLowerCase().replaceAll(" ", "_") + ".png")
  }, []);

  function handleHighlightClick() {
    props.setDraftHighlightOpen(true);
  }

  async function getNumberOfSeasons() {
    const date = new Date();
    const year = date.getFullYear();
    const debutYear = details.mlbDebutDate.slice(0, 4);
    const seasons = year - debutYear;
    const abnormals = [1, 2, 3, 21, 22, 23]
    const abnormalsEndings = {1: "st", 2: "nd", 3: "rd"}
    let seasonStr = ""
    if (!abnormals.includes(seasons)) {
        seasonStr = seasons + "th";
    } else {
        seasonStr = seasons + abnormalsEndings[seasons[seasons.length - 1]];
    }
    setNumberOfSeasons(seasonStr);
  }

  return (
    <Transition.Root show={props.ppOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={props.setPpOpen}>
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

        <div className="fixed z-10 inset-0 overflow-y-auto">
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
              <Dialog.Panel className="relative bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
                <div className="flex">
                <RosterPhoto photoUrl={photoUrl} />
                <p className="absolute top-1 left-1 text-gray-400 text-sm">#{details.primaryNumber}</p>
                {details ? <img src={require(`../media_files/country_flags/${details.birthCountry.toLowerCase().replaceAll(" ", "_")}_flag.png`)} className="absolute h-6 top-2 right-2" />:""}
                <img src={require(`../media_files/team_logos/${playerStats.teamName.toLowerCase().replaceAll(" ", "_")}.webp`)} className="absolute h-6 top-10 right-2" />
                <div className="grid ml-24">
                <h1 className=" text-gray-100 text-lg font-semibold">{playerStats.playerName}</h1>
                <p className="text-sm text-gray-400">{playerStats.position}</p>
                {details ? (<>
                <p className="text-sm text-gray-400">{details.handedness}</p>
                <p className="text-sm text-gray-400">{details.height}/{details.weight}</p>
                </>):""}
                </div>
                </div>
                <div className="inline-block">
                <table className="min-w-full shadow-2xl divide-y divide-gray-600 mt-8 text-gray-200">
                    <thead>
                    <tr className="divide-x divide-gray-600">
                        <th scope="col" className="p-1 text-center text-sm">
                            Player Rank
                        </th>
                        <th scope="col" className="p-1 text-center text-sm">
                            Pos Rank
                        </th>
                        <th scope="col" className="p-1 text-center text-sm">
                            Games Played
                        </th>
                        <th scope="col" className="p-1 text-center text-sm">
                            Avg Points
                        </th>
                        <th scope="col" className="p-1 text-center text-sm">
                            Total Points
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr className="divide-x divide-gray-600"><td className="text-sm text-center p-2">{playerStats.overallRank}</td>
                        <td className="text-sm text-center p-2">{playerStats.posRank}</td>
                        <td className="text-sm text-center p-2">{playerStats.sprintStats.gamesPlayed}</td>
                        <td className="text-sm text-center p-2">{playerStats.sprintStats.pointsPerGame}</td>
                        <td className="text-sm text-center p-2">{playerStats.sprintStats.totalPoints}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <p className="text-gray-400 text-center mt-4 text-sm">Sprint Stats</p>
                <div className="inline-block w-full">
                <table className="min-w-full shadow-2xl divide-y divide-gray-400 rounded-md bg-gray-700 text-gray-200">
                    <thead>
                    <tr className="divide-x divide-gray-600">
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            avg
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            hr
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            rbi
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            r
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            sb
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            ops
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr className="divide-x divide-gray-600"><td className="text-sm px-1 py-2 text-center">{playerStats.sprintStats.battingAverage}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.sprintStats.homeRuns}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.sprintStats.rbi}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.sprintStats.runs}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.sprintStats.stolenBases}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.sprintStats.ops}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <p className="text-gray-400 text-center mt-4 text-sm">Season Stats</p>
                <div className="inline-block w-full">
                <table className="min-w-full shadow-2xl divide-y divide-gray-400 rounded-md border-2 border-opacity-50 border-gray-600 bg-gray-800 text-gray-200">
                    <thead>
                    <tr className="divide-x divide-gray-600">
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            avg
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            hr
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            rbi
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            hits
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            sb
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            ops
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            pts
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr className="divide-x divide-gray-600"><td className="text-sm px-1 py-2 text-center">{playerStats.seasonStats.battingAverage}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.seasonStats.homeRuns}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.seasonStats.rbi}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.seasonStats.hits}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.seasonStats.stolenBases}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.seasonStats.ops}</td>
                        <td className="text-sm px-1 py-2 text-center">{playerStats.seasonStats.totalPoints}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                {details ? <p className="text-gray-500 text-center text-xs">{`${details.fullName} is ${details.currentAge} years old`}{!numberOfSeasons ? "": ` and in his ${numberOfSeasons} season`}</p>:""}
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-2xl px-4 py-2 bg-blue-900 text-base font-medium text-blue-200 hover:bg-blue-800 focus:outline-none sm:text-sm"
                    onClick={() => props.setPpOpen(false)}
                  >
                    Go back
                  </button>
                </div>
                <button className="absolute top-20 right-12 border border-transparent shadow-2xl text-base font-medium pr-4 pl-4 pt-2 rounded-md pb-2 text-blue-200 bg-blue-900  hover:bg-blue-800 focus:outline-none sm:text-sm"
                onClick={handleHighlightClick}>Daily Highlight</button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}