import {useState, useEffect} from "react"
import Popdown from "./Popdown"
import DraftPlayerHighlight from "./DraftPlayerHighlight"

export default function TeamPage(props) {

    const [totals, setTotals] = useState({});
    const [draftHighlightOpen, setDraftHighlightOpen] = useState(false);
    const [chosenPlayerStats, setChosenPlayerStats] = useState({});

    const team = props.teamRosters[props.selectedTeam];
    const players = [];
    team.roster.forEach(p => {
      const i = props.playerArray.findIndex(player => player.id === p);
      players.push(props.playerArray[i])
    });

    function handlePlayerClick(player) {
        props.setSelectedPlayer(player.playerName);
        props.setPpOpen(true);
    }

    function handleRandomHighlightClick() {
      // roll for a random player then open a highlight for that player
        let chosenIndex = Math.floor(Math.random() * team.roster.length);
        let chosenPlayer = props.playerArray.find(player => player.id === players[chosenIndex].id);
        chosenPlayer.playerId = chosenPlayer.id;
        console.log(chosenPlayer);
        if (chosenPlayer.teamId !== undefined) {
          setChosenPlayerStats(chosenPlayer);
          setDraftHighlightOpen(true);
        } else {
          return handleRandomHighlightClick();
        }
    }

    function handleBackClick() {
        props.setNavSelect('League Leaderboard');
    }

    function calcTotals() {
      // initialize a totals object for each team
        let totals = {
            atBats: 0,
            freePasses: 0,
            hits: 0,
            homeRuns: 0,
            plateAppearances: 0,
            rbi: 0,
            stolenBases: 0,
            totalBases: 0,
            totalPoints: 0,
            gamesPlayed: 0,
        };
        players.forEach(player => {
            totals.atBats += player.atBats;
            totals.freePasses += player.freePasses;
            totals.hits += player.hits;
            totals.homeRuns += player.homeRuns;
            totals.plateAppearances += player.plateAppearances;
            totals.rbi += player.rbi;
            totals.stolenBases += player.stolenBases;
            totals.totalBases += player.totalBases;
            totals.totalPoints += player.totalPoints;
            totals.gamesPlayed += player.gamesPlayed;
        })
        const teamAverage = Math.round((totals.hits / totals.atBats + Number.EPSILON) * 1000) / 1000;
        totals.avg = teamAverage.toString().substring(1);
        const teamObp = Math.round(((totals.hits + totals.freePasses) / totals.plateAppearances + Number.EPSILON) * 1000) / 1000;
        const teamSlg = Math.round((totals.totalBases / totals.atBats + Number.EPSILON) * 1000) / 1000;
        const teamOps = teamObp + teamSlg
        const teamOpsString = teamOps.toString();
        if (teamOpsString[0] === "0") {
          totals.ops = teamOpsString.substring(1, 5);
        } else {
          totals.ops = teamOpsString.substring(0, 5);
        }
        totals.obp = teamObp.toString().substring(1);
        totals.slg = teamSlg.toString().substring(1);
        console.log(totals);
        setTotals(totals);
    }

    useEffect(() => {
        calcTotals();
    }, [props.selectedTeam])

    return (<>
        <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <button
              type="button"
              className="grid mt-8 mb-6 items-center justify-center text-sm rounded-md bg-blue-800 px-4 py-2 text-md font-medium text-gray-300 shadow-2xl hover:bg-blue-900 hover:text-white focus:outline-none w-32 sm:w-32"
              onClick={handleBackClick}
            >
              Go back
            </button>
            <span className="inline-flex text-2xl font-semibold text-gray-200">{team.name} - {team.owner} {team.ranking === 1 ? <img className="h-8 w-8 ml-2" src={require('../media_files/gold_medal.png')}/>:""}
                          {team.ranking === 2 ? <img className="h-8 w-8 ml-2" src={require('../media_files/silver_medal.png')}/>:""}
                          {team.ranking === 3 ? <img className="h-8 w-8 ml-2" src={require('../media_files/bronze_medal.png')}/>:""}</span>
            <p className="mt-2 text-sm text-gray-400">
              Click on any player to view their profile.
            </p>
            <div className="mt-8">
            <Popdown navSelect={props.navSelect} setNavSelect={props.setNavSelect} setLoginPanelOpen={props.setLoginPanelOpen} roundsDrafted={props.roundsDrafted} leagueHasStarted={props.leagueHasStarted} loggedIn={props.loggedIn} />
            <select onChange={e => props.setSelectedTeam(e.target.value)} defaultValue={props.selectedTeam} className="h-10 text-sm mb-1 rounded-md font-semibold bg-gray-800 text-blue-300">
              {props.teamRosters.map((team, index) => (
                  <option key={team.owner} value={index}>{team.name + " (" + team.owner + ")"}</option>
              ))}
            </select>
            </div>
          </div>
          <div className="sm:mt-0 sm:ml-16 sm:flex-none grid">
            <button
              onClick={handleRandomHighlightClick}
              type="button"
              className="inline-flex items-center w-[16vw] h-[5vh] justify-center mt-28 mr-20 rounded-md bg-blue-800 px-4 py-2 text-md font-bold text-gray-300 shadow-2xl hover:bg-blue-900 hover:text-white focus:outline-none"
            >
              Random Team Highlight
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-900">
                    <tr className="divide-x divide-gray-600">
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pl-6">
                        Position
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-blue-300">
                        Player
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        GP
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        Avg
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        BB
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pl-6">
                        HR
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-blue-300">
                        RBI
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        OPS
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        SB
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        Proj
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600 bg-gray-800">
                    {players.map((player) => (
                      <tr key={player.playerName} className="divide-x divide-gray-600">
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pl-6">
                          {player.position}
                        </td>
                        <td onClick={() => handlePlayerClick(player)}
                        className="whitespace-nowrap p-4 text-sm cursor-pointer bg-gray-700 hover:bg-gray-800 text-blue-300">{player.playerName}</td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{player.gamesPlayed}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{player.battingAverage}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{player.freePasses}</td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{player.homeRuns}</td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{player.rbi}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{player.ops}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{player.stolenBases}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{player.projection}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{player.totalPoints}</td>
                      </tr>
                    ))}
                    <tr className="divide-x font-bold bg-gray-900 divide-gray-600">
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pl-6">
                          Total
                        </td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">------</td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{totals ? totals.gamesPlayed : "----"}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{totals ? totals.avg : "----"}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{totals ? totals.freePasses : "----"}</td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{totals ? totals.homeRuns : "----"}</td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{totals ? totals.rbi : "----"}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{totals ? totals.ops : "----"}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{totals ? totals.stolenBases : "----"}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{totals ? team.projectedPoints: "----"}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{totals ? totals.totalPoints : "----"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {draftHighlightOpen ? <DraftPlayerHighlight selectedPlayerStats={chosenPlayerStats} setDraftHighlightOpen={setDraftHighlightOpen} />:""}
    </>)

}