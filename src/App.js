import FantasyBaseball from "./contracts/FantasyBaseball.sol/FantasyBaseball"
import TeamTable from "./Components/TeamTable";
import PlayerProfile from "./Components/PlayerProfile";
import Footer from "./Components/Footer";
import Highlights from "./Components/Highlights";
import Loader from "./Components/Loader";
import LoginPanel from "./Components/LoginPanel";
import LoginSuccessNote from "./Components/LoginSuccessNote";
import TeamPage from "./Components/TeamPage";
import DraftPage from "./Components/DraftPage";
import TradingPost from "./Components/TradingPost";
import PlayerLeaderboard from "./Components/PlayerLeaderboard";
import DailyHomerPage from "./Components/DailyHomerPage";
import { ethers } from 'ethers'
import {useState, useEffect} from "react";
import {getPlayerSprintStats} from "./functions/mlbApi";
import {postTeamData, infuraTest} from "./functions/ipfs";
import {earlyDaysStats} from "./functions/earlyDays";
import {finalScoring} from "./functions/finalScoring";
const contractAddress = '0xdf3a0252D5c75640380ab29b2a55b7534Aa0De5B';
const url = process.env.REACT_APP_ALCHEMY_RINKEBY_URL;
const provider = new ethers.providers.JsonRpcProvider(url);
const privateKey = process.env.REACT_APP_RINKEBY_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedPlayerStats, setSelectedPlayerStats] = useState({});
  const [ppOpen, setPpOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [teamRosters, setTeamRosters] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [playerArray, setPlayerArray] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [navSelect, setNavSelect] = useState('League Leaderboard');
  const [loginPanelOpen, setLoginPanelOpen] = useState(false);
  const [draftStats, setDraftStats] = useState([]);
  const [projections, setProjections] = useState({});
  const [projLoading, setProjLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [roundsDrafted, setRoundsDrafted] = useState(0);
  const [loginSelected, setLoginSelected] = useState(false);
  const [showLoginSuccessNote, setShowLoginSuccessNote] = useState(false);
  const [leagueHasStarted, setLeagueHasStarted] = useState(false);
  const [leagueStartUnix, setLeagueStartUnix] = useState(0);
  const [leagueStartTime, setLeagueStartTime] = useState("");
  const [proposalEvents, setProposalEvents] = useState([]);
  const [myProposalEvents, setMyProposalEvents] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [executedTrades, setExecutedTrades] = useState([]);

  useEffect(() => {
    let subscribed = true;
    if (subscribed) {
    async function getLeagueStart() {
      console.log('team load start');
      // check if the league is in draft mode or league started mode
    const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
    const started = await bbContract.leagueHasStarted();
    setLeagueHasStarted(started);

    let autoLoggedIn = false;
    let autoTeamId;
    // pull username from local storage if username exists
    const username = localStorage.getItem("username");
    const pw = localStorage.getItem("pw");
    if (username && pw) {
      setOwnerName(username);
      const pwHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(pw));
    try {
      // double-check login
      const login = await bbContract.login(username, pwHash);
      const id = login.toNumber();
      setTeamId(id);
      setLoggedIn(true);
      autoLoggedIn = true;
      autoTeamId = id;
      } catch(e) {
          console.error(e);
      }
      } else {
        setLoginPanelOpen(true);
      }
    
      if (started) {
      setLoginSelected(true);
    // get bytes32 cid from smart contract and format for ipfs retrieval
    const contractRosters = await bbContract.leagueRoster();
    const hexString32 = "0x" + "1220" + contractRosters.slice(2);
    const uintArray = ethers.utils.arrayify(hexString32);
    const rosterCID = ethers.utils.base58.encode(uintArray);
    let rosterObject = await infuraTest(rosterCID);
    console.log(rosterObject);
    const elapsedTime = Date.now() - rosterObject.kickoffTime;
    console.log(elapsedTime);
    
    // get trade proposal events
    const filters = bbContract.filters.NewTradeProposal();
    const allProposals = await bbContract.queryFilter(filters);
    console.log(allProposals);
    // get accepted trade events
    const tradeFilters = bbContract.filters.TradeAccepted();
    const allAcceptedTrades = await bbContract.queryFilter(tradeFilters);
    console.log(allAcceptedTrades);
    const pendingProposals = [];
    const tradesToExecute = [];
    // filter out proposals to pending ones from last 5 days only
    for (const proposal of allProposals) {
        
        let index1 = rosterObject.teams.findIndex(t => t.teamId === proposal.args._teamId_1.toNumber());
        let index2 = rosterObject.teams.findIndex(t => t.teamId === proposal.args._teamId_2.toNumber());
        let playersStillAvailable = false;
        if (rosterObject.teams[index1].roster.includes(proposal.args._playerId_11) && rosterObject.team[index1].roster.includes(proposal.args._playerId_12 && rosterObject.team[index2].roster.includes(proposal.args._playerId_21) && rosterObject.team[index2].roster.includes(proposal.args._playerId_22))) {
            playersStillAvailable = true;
        }
        console.log(playersStillAvailable);
        const proposalPlayers = [proposal.args._playerId_11.toNumber(), proposal.args._playerId_12.toNumber(), proposal.args._playerId_21.toNumber(), proposal.args._playerId_22.toNumber()];
        let uniquePlayers = new Set(proposalPlayers).size === proposalPlayers.length;
        console.log(proposalPlayers);
        console.log(uniquePlayers);
        if (uniquePlayers && playersStillAvailable) {
        const executeIndex = allAcceptedTrades.findIndex(t => t.args._tradeId._hex === proposal.args._tradeId._hex);
        const proposalTimestamp = proposal.args._proposal_timestamp.toNumber() * 1000;
        if (executeIndex === -1) {
            if (Date.now() - proposalTimestamp < 432000000) {
          pendingProposals.push(proposal);
            }
        } else {
          const acceptedTimestamp = allAcceptedTrades[executeIndex].args._accept_timestamp.toNumber() * 1000;
            if (acceptedTimestamp - proposalTimestamp < 432000000) {
          tradesToExecute.push(allAcceptedTrades[executeIndex]);
            }
        }
      }
    }
    setProposalEvents(pendingProposals);
    if (pendingProposals.length > 0 && autoLoggedIn) {
      getTradeProposals(autoTeamId, pendingProposals);
    }
    let executedTradeArr = [];
    let i = 0;
    // execute all accepted trades
    for (const trade of tradesToExecute) {
      console.log(i);
        let index1 = rosterObject.teams.findIndex(t => t.teamId === trade.args._teamId_1.toNumber());
        let index2 = rosterObject.teams.findIndex(t => t.teamId === trade.args._teamId_2.toNumber());
        if (trade.args._isGamble) {
          console.log('gamble trade');
          let player1;
          let player2;
          let player1Index;
          let player2Index;
          if (trade.args._gamble_team_1) {
            player1 = trade.args._playerId_11.toNumber();
          } else {
            player1 = trade.args._playerId_12.toNumber();
          }
          if (trade.args._gamble_team_2) {
            player2 = trade.args._playerId_21.toNumber();
          } else {
            player2 = trade.args._playerId_22.toNumber();
          }
          player1Index = rosterObject.teams[index1].roster.findIndex(p => p === player1);
          player2Index = rosterObject.teams[index2].roster.findIndex(p => p === player2);
          console.log(player1Index, player2Index);
          
          if (player1Index !== -1 && player2Index !== -1) {
            console.log('valid gamble trade');
          let temp1 = rosterObject.teams[index1].roster[player1Index];
          let temp2 = rosterObject.teams[index2].roster[player2Index];
          rosterObject.teams[index1].roster[player1Index] = rosterObject.teams[index2].roster[player2Index];
          rosterObject.teams[index2].roster[player2Index] = rosterObject.teams[index1].roster[player1Index];
          rosterObject.teams[index1].roster[player1Index] = temp2;
          rosterObject.teams[index2].roster[player2Index] = temp1;
          executedTradeArr.push({
            team1: {
              name: rosterObject.teams[index1].name,
              tradedPlayers: [player1],
            },
            team2: {
              name: rosterObject.teams[index2].name,
              tradedPlayers: [player2],
            },
            timestamp: trade.args._accept_timestamp.toNumber() * 1000,
            isGamble: true,
          });
          };
        } else {
          // executes this if trade is an even 2 for 2 trade
          let player11 = trade.args._playerId_11.toNumber();
          let player12 = trade.args._playerId_12.toNumber();
          let player21 = trade.args._playerId_21.toNumber();
          let player22 = trade.args._playerId_22.toNumber();
          console.log(player11, player12, player21, player22);
          let player11Index = rosterObject.teams[index1].roster.findIndex(p => p === player11);
          let player12Index = rosterObject.teams[index1].roster.findIndex(p => p === player12);
          let player21Index = rosterObject.teams[index2].roster.findIndex(p => p === player21);
          let player22Index = rosterObject.teams[index2].roster.findIndex(p => p === player22);
          if (player11Index !== -1 && player12Index !== -1 && player21Index !== -1 && player22Index !== -1) {
          console.log(player21);
          console.log(player11Index, player12Index, player21Index, player22Index);
          console.log(index1);
          rosterObject.teams[index1].roster[player11Index] = player21;
          rosterObject.teams[index1].roster[player12Index] = player22;
          rosterObject.teams[index2].roster[player21Index] = player11;
          rosterObject.teams[index2].roster[player22Index] = player12;
          console.log(rosterObject);
          executedTradeArr.push({
            team1: {
              name: rosterObject.teams[index1].name,
              tradedPlayers: [player11, player12],
            },
            team2: {
              name: rosterObject.teams[index2].name,
              tradedPlayers: [player21, player22],
            },
            timestamp: trade.args._accept_timestamp.toNumber() * 1000,
            isGamble: false,
          });
        }
      }
    i++;
    }
    console.log(executedTradeArr);
    console.log(rosterObject);
    setExecutedTrades(executedTradeArr);
    // run function for when the league has just started and not all players have stats yet
    if (elapsedTime < 172800000) {
      earlyDaysStats(setTeamRosters, setTeamLoading, setPlayerArray, rosterObject, setProjections, setProjLoading);
    } else {
      // run normal function for fetching stats, points, and projections
    getPlayerSprintStats(setTeamRosters, setTeamLoading, setPlayerArray, rosterObject, setProjections, setProjLoading);
    }
    } else {
      // function for when league has not started, begins with fetching list of team creations
      const filters = bbContract.filters.NewTeam();
      const newTeams = await bbContract.queryFilter(filters);
      console.log(newTeams);
      const teamsArray = [];
        for (const team of newTeams) {
        const username = team.args._username;
        const teamName = team.args._teamName;
        const teamId = Number.parseInt(team.args._teamId);
        const roster = await bbContract.getRoster(username);
        console.log(roster);
        const draftComplete = roster.length === 7 ? true: false;
        console.log(draftComplete);
        const teamInfo = {
          username,
          teamName,
          teamId,
          draftComplete
        }
        teamsArray.push(teamInfo);
        }
        console.log(teamsArray);
        setTeamLoading(false);
        setTeamList(teamsArray);
    };
    };
    try {
    getLeagueStart();
    } catch(e) {
      console.log(e);
    }
  }
  return () => subscribed = false;
  }, []);

  useEffect(() => {
    if (!leagueHasStarted) {
    getStartTime();
    }
  }, []);
  //re-run point totals after trade is accepted
  async function swapAfterTrade(teamArray) {
      getPlayerSprintStats(setTeamRosters, setTeamLoading, setPlayerArray, teamArray, setProjections, setProjLoading);
  }
  // filter trade proposals for those received by logged in account only
  async function getTradeProposals(id, proposals) {
    const myProposals = proposals.filter(e => e.args._teamId_2.toNumber() === id);
    console.log(myProposals);
    setMyProposalEvents(myProposals);
  }
  // get and format the start time of the league from the blockchain
  async function getStartTime() {
    const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
    const unixTimeBig = await bbContract.startTime();
    const unixTime = unixTimeBig.toNumber() * 1000;
    console.log(unixTime);
    setLeagueStartUnix(unixTime);
    const startDate = new Date(unixTime);
    const startString = startDate.toString();
    const leagueStartString = startString.substring(0, startString.length - 33);
    console.log(leagueStartString);
    setLeagueStartTime(leagueStartString);
  }

  async function startLeague() {
    // gather team draft picks and put them into a team rosters object
    const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
    const filters = bbContract.filters.PickSubmitted(null, null, null, null, null);
    const events = await bbContract.queryFilter(filters);
    console.log(events);
    const rosters = [];
    const playerId = events[0].args._playerId._hex;
    console.log(playerId);
    const playerNum = Number.parseInt(playerId);
    console.log(playerNum);

    for (const draftPick of events) {
      let eventTeamName = draftPick.args._teamName;
      let ownerEthAddress = draftPick.args._ethAddress;
      let ownerUsername = draftPick.args._username;
      let playerNumber = Number.parseInt(draftPick.args._playerId._hex);
      let teamNumber = Number.parseInt(draftPick.args._teamId._hex);
      let teamIndex = rosters.findIndex(p => p.owner === ownerUsername);
      if (teamIndex === -1) {
        let obj = {
          address: ownerEthAddress,
          name: eventTeamName,
          owner: ownerUsername,
          roster: [playerNumber],
          teamId: teamNumber,
        }
        rosters.push(obj);
      } else {
        rosters[teamIndex].roster.push(playerNumber);
      }
    }
    console.log(rosters);
    const kickoffTime = Date.now();
    const ipfsObject = {
      teams: rosters,
      kickoffTime,
    }
    // upload team rosters object to ipfs
    console.log(ipfsObject);
    const leagueCID = await postTeamData(ipfsObject);
    console.log(leagueCID);
    const hexValue = ethers.utils.base58.decode(leagueCID);
    console.log(hexValue);
    const hexString = ethers.utils.hexlify(hexValue);
    console.log(hexString);
    const hexString32 = hexString.substring(6);
    console.log(hexString32);
    const hex32 = "0x" + hexString32;
    const leagueStart = await bbContract.startLeague(hex32);
    await leagueStart.wait();
    console.log(leagueStart);
  }

  async function finalScore() {
      const teamFinalScoring = finalScoring(teamRosters, playerArray);
      const winner = teamFinalScoring[0];
      const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
      const winnerPaid = bbContract.payWinner(winner.teamId);
      console.log(winnerPaid);
  }
  
  return (<>
    {navSelect === 'Team Rosters' ? <TeamPage setLoginPanelOpen={setLoginPanelOpen} loggedIn={loggedIn} roundsDrafted={roundsDrafted} leagueHasStarted={leagueHasStarted} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} teamRosters={teamRosters}
    setPpOpen={setPpOpen} setSelectedPlayer={setSelectedPlayer} setNavSelect={setNavSelect} playerArray={playerArray} navSelect={navSelect} /> : ""}
    {navSelect === 'League Leaderboard' ? <TeamTable setSelectedPlayer={setSelectedPlayer} finalScore={finalScore} myProposalEvents={myProposalEvents} roundsDrafted={roundsDrafted} setShowLoginSuccessNote={setShowLoginSuccessNote} leagueHasStarted={leagueHasStarted} setLeagueHasStarted={setLeagueHasStarted}
    leagueStartUnix={leagueStartUnix} leagueStartTime={leagueStartTime} startLeague={startLeague} teamList={teamList} executedTrades={executedTrades}
    setPpOpen={setPpOpen} teamRosters={teamRosters} setSelectedTeam={setSelectedTeam} setNavSelect={setNavSelect} navSelect={navSelect} loggedIn={loggedIn} setLoggedIn={setLoggedIn} setRoundsDrafted={setRoundsDrafted} playerArray={playerArray}
    setLoginPanelOpen={setLoginPanelOpen} projections={projections} teamLoading={teamLoading} projLoading={projLoading} setTeamName={setTeamName} ownerName={ownerName} setOwnerName={setOwnerName} setTeamId={setTeamId} /> : ""}
    {navSelect === 'Player Leaderboards' ? <PlayerLeaderboard playerArray={playerArray} teamRosters={teamRosters} setLoginPanelOpen={setLoginPanelOpen} loggedIn={loggedIn}
    setNavSelect={setNavSelect} setSelectedPlayer={setSelectedPlayer} setPpOpen={setPpOpen} roundsDrafted={roundsDrafted} leagueHasStarted={leagueHasStarted}
    setSelectedTeam={setSelectedTeam} setHighlightOpen={setHighlightOpen} setSelectedPlayerStats={setSelectedPlayerStats} navSelect={navSelect} /> : ""}
    {ppOpen ? <PlayerProfile selectedPlayer={selectedPlayer}
    ppOpen={ppOpen} setPpOpen={setPpOpen} playerArray={playerArray}
    setHighlightOpen={setHighlightOpen} selectedPlayerStats={selectedPlayerStats}
    setSelectedPlayerStats={setSelectedPlayerStats} selectedTeam={selectedTeam}
    teamRosters={teamRosters} /> : ""}
    {navSelect === 'Draft a Team' ? <DraftPage draftStats={draftStats} setDraftStats={setDraftStats} ownerName={ownerName} teamId={teamId} roundsDrafted={roundsDrafted} setRoundsDrafted={setRoundsDrafted}
    navSelect={navSelect} setNavSelect={setNavSelect} setHighlightOpen={setHighlightOpen} setSelectedPlayer={setSelectedPlayer} loggedIn={loggedIn} teamList={teamList} setTeamList={setTeamList} leagueHasStarted={leagueHasStarted} />: ""}
    {highlightOpen ? <Highlights highlightOpen={highlightOpen} setHighlightOpen={setHighlightOpen}
    selectedPlayer={selectedPlayer}
    selectedPlayerStats={selectedPlayerStats} /> : ""}
    {teamLoading ? <Loader /> : ""}
    {navSelect === 'Trading Post' ? <TradingPost navSelect={navSelect} setLoginPanelOpen={setLoginPanelOpen} proposalEvents={proposalEvents} ownerName={ownerName} loggedIn={loggedIn} roundsDrafted={roundsDrafted} leagueHasStarted={leagueHasStarted} setNavSelect={setNavSelect} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} teamRosters={teamRosters} playerArray={playerArray} setSelectedPlayer={setSelectedPlayer} setPpOpen={setPpOpen} swapAfterTrade={swapAfterTrade} />: ""}
    {navSelect === 'Player Leaderboards' || navSelect === 'Daily Homers' ? "": <Footer />}
    {navSelect === 'Daily Homers' ? <DailyHomerPage navSelect={navSelect} setNavSelect={setNavSelect} setLoginPanelOpen={setLoginPanelOpen} loginPanelOpen={loginPanelOpen} loggedIn={loggedIn} />: ""}
    <LoginSuccessNote show={showLoginSuccessNote} setShow={setShowLoginSuccessNote} loginSelected={loginSelected} ownerName={ownerName} loggedIn={loggedIn} />
    <LoginPanel loginPanelOpen={loginPanelOpen} teamList={teamList} setTeamList={setTeamList} setRoundsDrafted={setRoundsDrafted} setLoginPanelOpen={setLoginPanelOpen} teamName={teamName} setTeamName={setTeamName} teamRosters={teamRosters} setTeamId={setTeamId} ownerName={ownerName} setOwnerName={setOwnerName} setNavSelect={setNavSelect}
    showLoginSuccessNote={showLoginSuccessNote} setShowLoginSuccessNote={setShowLoginSuccessNote} setLoggedIn={setLoggedIn} loginSelected={loginSelected} setLoginSelected={setLoginSelected} leagueHasStarted={leagueHasStarted} getTradeProposals={getTradeProposals} proposalEvents={proposalEvents} />
  </>);
}

export default App;
