import Popdown from "./Popdown"
import {useState, useEffect} from "react"
import {numOwners} from "../functions/mlbApi"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function PlayerLeaderboard(props) {

    const [selectedType, setSelectedType] = useState("sprint");
    const [selectedPos, setSelectedPos] = useState("ALL");
    const [sortedBy, setSortedBy] = useState("totalPoints");
    const [leadersOnTop, setLeadersOnTop] = useState(true);
    const [ownersArray, setOwnersArray] = useState([]);
    const [ownersLoaded, setOwnersLoaded] = useState(false);

    useEffect(() => {
      if (!ownersLoaded) {
        setOwnersArray(numOwners(props.teamRosters, props.playerArray));
        setOwnersLoaded(true);
      }
    }, [])

    const displayPlayers = (pos, array, leadersOnTop, type) => {
      // function to sort by sprint stats or season stats, then by position if selected
      if (type === 'sprint') {
          if (pos === 'ALL') {
            if (leadersOnTop) {
            array.sort((a, b) => b[sortedBy] - a[sortedBy]);
            } else {
            array.sort((a, b) => a[sortedBy] - b[sortedBy]);
            }
            return array;
          } else {
            let filteredList = array.filter(player => player.position === pos);
            if (leadersOnTop) {
            filteredList.sort((a, b) => b[sortedBy] - a[sortedBy]);
            } else {
            filteredList.sort((a, b) => a[sortedBy] - b[sortedBy]);
            }
            return filteredList;
            }
      }
      if (type === 'season') {
        if (pos === 'ALL') {
          array.sort((a, b) => b.seasonStats[sortedBy] - a.seasonStats[sortedBy]);
          if (!leadersOnTop) {
          array.reverse();
          }
          return array;
        } else {
          let filteredList = array.filter(player => player.position === pos);
          filteredList.sort((a, b) => b.seasonStats[sortedBy] - a.seasonStats[sortedBy]);
          if (!leadersOnTop) {
          filteredList.reverse();
            }
          return filteredList;
          }
        }
    }

    const players = displayPlayers(selectedPos, props.playerArray, leadersOnTop, selectedType);

    function handlePosSelect(e) {
        console.log(e.target.value);
        setSelectedPos(e.target.value);
    }

    function handlePlayerClick(player) {
        props.setSelectedPlayer(player.playerName);
        props.setPpOpen(true);
    }

    function handleBackClick() {
        props.setNavSelect('League Leaderboard');
    }

    function handleSortClick(category) {
        if (sortedBy === category) {
          setLeadersOnTop(!leadersOnTop);
        } else {
          setSortedBy(category);
          setLeadersOnTop(true);
        }
    }

    return (<>
        <div className="px-4 mx-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <button
              type="button"
              className="absolute top-5 left-24 text-sm rounded-md bg-blue-800 px-4 py-2 text-md font-medium text-gray-300 shadow-2xl hover:bg-blue-900 hover:text-white focus:outline-none w-32 sm:w-32"
              onClick={handleBackClick}
            >
              Go back
            </button>
            <p className="text-sm mt-6 ml-[15vw] text-center text-gray-400">
              Click on any player to view their profile. Click on a category to sort. Season stats show only qualifying players.
            </p>
            <div className="mt-12">
            <Popdown navSelect={props.navSelect} setNavSelect={props.setNavSelect} setLoginPanelOpen={props.setLoginPanelOpen} roundsDrafted={props.roundsDrafted} leagueHasStarted={props.leagueHasStarted} loggedIn={props.loggedIn} />
              </div>
          </div>
          <div className="sm:mt-0 sm:ml-16 sm:flex-none grid">
            <select onChange={e => setSelectedType(e.target.value)}className="h-10 text-sm mt-16 rounded-md font-semibold bg-gray-800 text-blue-300">
              <option value='sprint'>Sprint Stats Leaderboard</option>
              <option value='season'>Season Stats Leaderboard</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-y-auto h-[83vh] shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-900 sticky top-0">
                    <tr className="divide-x divide-gray-600">
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pl-6">
                        #
                      </th>
                      <th scope="col" onClick={() => setSortedBy('playerName')} className="py-3.5 pl-4 pr-4 cursor-pointer hover:bg-gray-800 hover:text-white text-left text-sm font-semibold text-blue-300 sm:pl-6">
                        PLAYER
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-blue-300">
                        <select onChange={e => handlePosSelect(e)} className="bg-gray-800 hover:text-white text-sm rounded-md font-semibold">
                          <option>ALL</option>
                          <option>First Base</option>
                          <option>Second Base</option>
                          <option>Third Base</option>
                          <option>Catcher</option>
                          <option>Outfielder</option>
                          <option>Designated Hitter</option>
                        </select>
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        #OWNERS
                      </th>
                      <th scope="col" onClick={() => handleSortClick('gamesPlayed')} className="py-3.5 pl-4 pr-4 hover:bg-gray-800 hover:text-white cursor-pointer text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        GP
                      </th>
                      <th scope="col" onClick={() => handleSortClick('battingAverage')} className="py-3.5 pl-4 pr-4 hover:bg-gray-800 hover:text-white cursor-pointer text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        AVG
                      </th>
                      <th scope="col" onClick={() => handleSortClick('freePasses')} className="py-3.5 pl-4 pr-4 hover:bg-gray-800 hover:text-white cursor-pointer text-left text-sm font-semibold text-blue-300 sm:pl-6">
                        BB
                      </th>
                      <th scope="col" onClick={() => handleSortClick('homeRuns')} className="px-4 py-3.5 hover:bg-gray-800 hover:text-white cursor-pointer text-left text-sm font-semibold text-blue-300">
                        HR
                      </th>
                      <th scope="col" onClick={() => handleSortClick('rbi')} className="py-3.5 pl-4 hover:bg-gray-800 hover:text-white cursor-pointer pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        RBI
                      </th>
                      <th scope="col" onClick={() => handleSortClick('ops')} className="py-3.5 pl-4 hover:bg-gray-800 hover:text-white cursor-pointer pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        OPS
                      </th>
                      <th scope="col" onClick={() => handleSortClick('stolenBases')} className="py-3.5 pl-4 hover:bg-gray-800 hover:text-white cursor-pointer pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        SB
                      </th>
                      <th scope="col" onClick={() => handleSortClick('pointsPerGame')} className="py-3.5 pl-4 hover:bg-gray-800 hover:text-white cursor-pointer pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        PPG
                      </th>
                      <th scope="col" onClick={() => handleSortClick('totalPoints')} className="py-3.5 pl-4 hover:bg-gray-800 hover:text-white cursor-pointer pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        PTS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600 bg-gray-800">
                    {players.map((player, index) => props.playerArray.findIndex(p => p.playerName === player.playerName) !== -1 ? (
                        <tr key={player.playerName} className="divide-x divide-gray-600">
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{index + 1}</td>
                        <td onClick={() => handlePlayerClick(player)}
                        className={classNames(sortedBy === 'playerName' ? "bg-gray-700 hover:bg-gray-800": "bg-gray-800 hover:bg-gray-700", "whitespace-nowrap p-4 text-sm cursor-pointer hover:text-white text-blue-300")}>{player.playerName}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pl-6">
                          {player.position}
                        </td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{ownersArray[player.id]}</td>
                        <td className={classNames(sortedBy === 'gamesPlayed' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6")}>{selectedType === 'sprint' ? player.gamesPlayed: player.seasonStats.gamesPlayed}</td>
                        <td className={classNames(sortedBy === 'battingAverage' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6")}>{selectedType === 'sprint' ? player.battingAverage: player.seasonStats.battingAverage}</td>
                        <td className={classNames(sortedBy === 'freePasses' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap p-4 text-sm text-blue-300")}>{selectedType === 'sprint' ? player.freePasses: player.seasonStats.freePasses}</td>
                        <td className={classNames(sortedBy === 'homeRuns' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap p-4 text-sm text-blue-300")}>{selectedType === 'sprint' ? player.homeRuns: player.seasonStats.homeRuns}</td>
                        <td className={classNames(sortedBy === 'rbi' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6")}>{selectedType === 'sprint' ? player.rbi: player.seasonStats.rbi}</td>
                        <td className={classNames(sortedBy === 'ops' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6")}>{selectedType === 'sprint' ? player.ops: player.seasonStats.ops}</td>
                        <td className={classNames(sortedBy === 'stolenBases' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6")}>{selectedType === 'sprint' ? player.stolenBases: player.seasonStats.stolenBases}</td>
                        <td className={classNames(sortedBy === 'pointsPerGame' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6")}>{selectedType === 'sprint' ? player.pointsPerGame: player.seasonStats.pointsPerGame}</td>
                        <td className={classNames(sortedBy === 'totalPoints' ? "bg-gray-700": "bg-gray-800", "whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6")}>{selectedType === 'sprint' ? player.totalPoints: player.seasonStats.totalPoints}</td>
                      </tr>
                    ):"")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>)

}