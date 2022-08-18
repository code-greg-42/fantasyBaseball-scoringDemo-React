import Popdown from "./Popdown"

export default function TeamTable(props) {

    const handleClick = (team) => {
        props.setSelectedPlayer(team.star.name);
        props.setPpOpen(true);
    }

    const handleTeamClick = (index) => {
        props.setSelectedPlayer("");
        props.setSelectedTeam(index);
        props.setNavSelect('Team Rosters');
    }

    const handleLogoutClick = async () => {
        props.setShowLoginSuccessNote(true);
        props.setLoggedIn(false);
        props.setOwnerName("");
        props.setTeamName("");
        props.setTeamId(null);
        props.setRoundsDrafted(0);
        setTimeout(() => {
          props.setShowLoginSuccessNote(false);
        }, 6000);
    }

    function getNameById(playerId) {
        if (props.playerArray.length > 0 && playerId) {
          return props.playerArray.find(p => p.id === playerId).playerName;
        }
    }

    function unixToDate(unixTime) {
      // convert unix time to a date string
      const tradeDate = new Date(unixTime);
      const tradeString = tradeDate.toString();
      const tradeDateString = tradeString.substring(0, tradeString.length - 33);
      return tradeDateString;
    }

    const teams = props.teamRosters;

    return (<>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl mt-8 font-semibold text-gray-200">Fantasy Baseball Sprint - Version 1 Test</h1>
            <p className="mt-2 text-sm text-gray-400">
              Click on the team name to view any team's lineup, or on a top scorer to view the player profile.
            </p>
            <div className="mt-12">
              {!props.teamLoading ? <Popdown navSelect={props.navSelect} setNavSelect={props.setNavSelect} setLoginPanelOpen={props.setLoginPanelOpen} loggedIn={props.loggedIn} roundsDrafted={props.roundsDrafted} leagueHasStarted={props.leagueHasStarted} />: ""}
            </div>
          </div>
          <div className="sm:mt-0 sm:ml-16 sm:flex-none">
            {!props.loggedIn ? <button
              type="button"
              onClick={() => props.setLoginPanelOpen(true)}
              className="inline-flex mr-20 mt-16 items-center justify-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-md font-medium text-gray-100 hover:text-white shadow-2xl hover:bg-blue-600 focus:outline-none focus:ring-transparent focus:ring-offset-transparent sm:w-auto"
            >
              Login / Signup
            </button>:
            <div className="inline-flex items-center">
            {props.myProposalEvents.length > 0 ? <img src={require('../media_files/new-mail-icon.png')} onClick={() => props.setNavSelect('Trading Post')} className="h-12 mr-4 mt-16 cursor-pointer" />: ""}
            <button
            type="button"
            onClick={handleLogoutClick}
            className="inline-flex mr-20 mt-16 h-12 items-center justify-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-md font-medium text-gray-100 hover:text-white shadow-2xl hover:bg-blue-600 focus:outline-none focus:ring-transparent focus:ring-offset-transparent sm:w-auto"
          >
            Logout of {props.ownerName}
          </button>
          </div>}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {!props.teamLoading ? <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-900">
                    <tr className="divide-x divide-gray-600">
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pl-6">
                        Team Name
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-blue-300">
                        Team Owner
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        {props.leagueHasStarted ? 'Top Scorer': 'Completed Draft'}
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        Projected
                      </th>
                      <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-blue-300 sm:pr-6">
                        Total Points
                      </th>
                    </tr>
                  </thead>
                  {props.leagueHasStarted ? <tbody className="divide-y divide-gray-600 bg-gray-800">
                    {teams.map((team, index) => (
                       <tr key={team.owner} className="divide-x divide-gray-600">
                        <td className="whitespace-nowrap cursor-pointer py-4 pl-4 pr-4 text-sm font-medium bg-gray-700 hover:bg-gray-800 hover:text-white text-blue-300 sm:pl-6" onClick={() => handleTeamClick(index)}>
                          <span className="inline-flex">{team.name}{index === 0 ? <img className="h-5 w-5 ml-2" src={require('../media_files/gold_medal.png')}/>:""}
                          {index === 1 ? <img className="h-5 w-5 ml-2" src={require('../media_files/silver_medal.png')}/>:""}
                          {index === 2 ? <img className="h-5 w-5 ml-2" src={require('../media_files/bronze_medal.png')}/>:""}</span>
                        </td>
                        <td className="whitespace-nowrap p-4 text-sm text-blue-300">{team.owner}</td>
                        <td className="whitespace-nowrap cursor-pointer p-4 text-sm bg-gray-700 hover:bg-gray-800 text-blue-300 hover:text-white" onClick={() => handleClick(team)}>{team.star.name} - ({team.star.points})</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{!props.projLoading ? props.projections[team.owner]: "----"}</td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm text-blue-300 sm:pr-6">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>: <tbody className="divide-y divide-gray-600 bg-gray-800">
                  {props.teamList.map(team => (
                    <tr key={team.username} className="divide-x divide-gray-600">
                    <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium bg-gray-700 text-blue-300 sm:pl-6">{team.teamName}</td>
                    <td className="whitespace-nowrap p-4 text-sm text-blue-300">{team.username}</td>
                    <td className="whitespace-nowrap p-4 text-sm text-blue-300">{team.draftComplete ? "Yes": "No"}</td>
                    <td className="whitespace-nowrap p-4 text-sm text-blue-300"></td>
                    <td className="whitespace-nowrap p-4 text-sm text-blue-300"></td>
                    </tr>))}
                    </tbody>}
                </table>: ""}
                {props.leagueHasStarted ? "": <div className="grid place-items-center text-center">
                <p className="text-blue-200 mt-8 text-lg font-semibold">Please start by going to the 'Draft a Team' page in the dropdown. The start button below will become available at - {props.leagueStartTime}.</p>
                <button
              type="button"
              disabled={props.leagueStartUnix > Date.now()}
              onClick={() => props.startLeague()}
              className="min-w-[30vw] max-w-[50vw] mt-8 rounded-md border border-transparent bg-blue-900 px-4 py-2 text-xl font-semibold text-blue-200 hover:text-white shadow-2xl hover:bg-blue-700 focus:outline-none focus:ring-transparent focus:ring-offset-transparent sm:w-auto"
            >
              Click to kickoff the league!
            </button>
            </div>}
            {!(Date.now() > props.leagueStartUnix + 3628800000) ? "": <div className="grid place-items-center text-center">
                <button
              type="button"
              disabled={props.leagueStartUnix + 3628800000 > Date.now()}
              onClick={() => props.finalScore()}
              className="min-w-[30vw] max-w-[50vw] mt-8 rounded-md border border-transparent bg-blue-900 px-4 py-2 text-xl font-semibold text-blue-200 hover:text-white shadow-2xl hover:bg-blue-700 focus:outline-none focus:ring-transparent focus:ring-offset-transparent sm:w-auto"
            >
              Click to Pay the Winner!
            </button>
            </div>}
            {props.executedTrades.length > 0 && !props.projLoading ? <div className="grid mt-6">
              {props.executedTrades.map((trade, index) => (
                <p key={trade.timestamp} className="text-md text-gray-300 text-opacity-75 mt-1">{trade.team1.name} has traded {getNameById(trade.team1.tradedPlayers[0])}{!trade.isGamble ? ` and ${getNameById(trade.team1.tradedPlayers[1])}`: ""} for {getNameById(trade.team2.tradedPlayers[0])}{!trade.isGamble ? ` and ${getNameById(trade.team2.tradedPlayers[1])}`:""} from {trade.team2.name} in {trade.isGamble ? "a gamble trade": "an even trade"} at {unixToDate(trade.timestamp)}</p>
              ))}</div>:""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>)
  }
  