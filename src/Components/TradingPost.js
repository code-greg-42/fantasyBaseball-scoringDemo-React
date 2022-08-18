import FantasyBaseball from "../contracts/FantasyBaseball.sol/FantasyBaseball"
import Popdown from "./Popdown"
import TradeModal from "./TradeModal"
import TradeSuccessNote from "./TradeSuccessNote"
import { ethers } from 'ethers'
import {useState, useEffect} from "react"
const contractAddress = '0xdf3a0252D5c75640380ab29b2a55b7534Aa0De5B'
const url = process.env.REACT_APP_ALCHEMY_RINKEBY_URL;
const provider = new ethers.providers.JsonRpcProvider(url);
const privateKey = process.env.REACT_APP_RINKEBY_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function TradingPost(props) {

  const [myTradeBlock, setMyTradeBlock] = useState([]);
  const [otherTradeBlock, setOtherTradeBlock] = useState([]);
  const [validTrade, setValidTrade] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeProposals, setTradeProposals] = useState([]);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [showTradeSuccessNote, setShowTradeSuccessNote] = useState(false);

  const myIndex = props.teamRosters.findIndex(team => team.owner === props.ownerName);
  const myTeam = props.teamRosters[myIndex];
  const myPlayers = [];
    myTeam.roster.forEach(p => {
      const i = props.playerArray.findIndex(player => player.id === p);
      myPlayers.push(props.playerArray[i])
    });

  const team = props.teamRosters[props.selectedTeam];
  const players = [];
    team.roster.forEach(p => {
      const i = props.playerArray.findIndex(player => player.id === p);
      players.push(props.playerArray[i])
    });

  function handleDetailsClick(player) {
    props.setSelectedPlayer(player);
    props.setPpOpen(true);
  }

  async function propose(isGamble) {
    // send trade proposal and whether or not it is an even trade
    console.log(isGamble);
    setTradeLoading(true);
    const myId = myTeam.teamId;
    const otherId = team.teamId;
    const player11 = myTeam.roster[myTradeBlock[0]];
    const player12 = myTeam.roster[myTradeBlock[1]];
    const player21 = team.roster[otherTradeBlock[0]];
    const player22 = team.roster[otherTradeBlock[1]];
    const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
    const tradeProposal = await bbContract.proposeTrade(myId, otherId, player11, player12, player21, player22, isGamble);
    await tradeProposal.wait();
    setShowTradeSuccessNote(true);
    console.log(tradeProposal);
    setTradeLoading(false);
    setTimeout(() => {
      setShowTradeSuccessNote(false)
    }, 5000);
  }

  async function getProposals() {
    // get all trade proposals 
    if (props.proposalEvents.length > 0) {
    const myProposals = props.proposalEvents.filter(e => Number.parseInt(e.args._teamId_2._hex) === myTeam.teamId);
    if (myProposals.length > 0) {
    const proposalArray = [];
    myProposals.forEach(proposal => {
    const proposalInfo = {
      tradeId: Number.parseInt(proposal.args._tradeId._hex),
      isGamble: proposal.args._isGamble,
      timestamp: Number.parseInt(proposal.args._proposal_timestamp._hex),
      sendingTeam: {
        teamId: Number.parseInt(proposal.args._teamId_1._hex),
        players: [Number.parseInt(proposal.args._playerId_11._hex), Number.parseInt(proposal.args._playerId_12._hex)],
      },
      receivingTeam: {
        teamId: Number.parseInt(proposal.args._teamId_2._hex),
        players: [Number.parseInt(proposal.args._playerId_21._hex), Number.parseInt(proposal.args._playerId_22._hex)],
      },
    };
    proposalArray.push(proposalInfo);
    });
    console.log(proposalArray);
    setTradeProposals(proposalArray);
    };
    }
  }

  function handleOtherTeamClick(index) {
    // set selected players via index
    console.log(index);
    if (otherTradeBlock.length === 0) {
      setOtherTradeBlock([index]);
    }
    if (otherTradeBlock.length === 1 && !otherTradeBlock.includes(index)) {
      let newBlock = [...otherTradeBlock, index];
      setOtherTradeBlock(newBlock);
    }
    if (otherTradeBlock.includes(index)) {
        let newBlock = otherTradeBlock.filter(num => num !== index);
        setOtherTradeBlock(newBlock);
    } else {
      console.log('Capped at 2!');
    }
}

  function handleMyTeamClick(index) {
    // same as above
    console.log(index);
    if (myTradeBlock.length === 0) {
      setMyTradeBlock([index]);
    }
    if (myTradeBlock.length === 1 && !myTradeBlock.includes(index)) {
      let newBlock = [...myTradeBlock, index];
      setMyTradeBlock(newBlock);
    }
    if (myTradeBlock.includes(index)) {
        let newBlock = myTradeBlock.filter(num => num !== index);
        setMyTradeBlock(newBlock);
    } else {
      console.log('Capped at 2!');
    }
  }

  // add point totals for each end of the trade and assess whether the trade is valid
  const myTotal = myTradeBlock.length > 1 ? myPlayers[myTradeBlock[0]].totalPoints + myPlayers[myTradeBlock[1]].totalPoints: myTradeBlock.length > 0 ? myPlayers[myTradeBlock[0]].totalPoints: "";
  const otherTotal = otherTradeBlock.length > 1 ? players[otherTradeBlock[0]].totalPoints + players[otherTradeBlock[1]].totalPoints: otherTradeBlock.length > 0 ? players[otherTradeBlock[0]].totalPoints: "";

  useEffect(() => {
    if (myTradeBlock.length > 0 && otherTradeBlock.length > 0 && Math.abs(myTotal - otherTotal) < ((myTotal + otherTotal) / 2 / 10)) {
        setValidTrade(true);
    } else {
      setValidTrade(false);
    }
  }, [myTradeBlock, otherTradeBlock])

  useEffect(() => {
      let subscribed = true;
      if (subscribed) {
        getProposals();
      }
      return () => subscribed = false;
  }, []);

  return (
    <>
      <div className="relative min-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 bg-black">
              <div className="max-w-7xl mx-auto">
                <div className="relative flex items-center mr-7 ml-10 justify-between h-20">
                  <div className="flex-auto ml-20">
                <Popdown navSelect={props.navSelect} setNavSelect={props.setNavSelect} setLoginPanelOpen={props.setLoginPanelOpen} roundsDrafted={props.roundsDrafted} leagueHasStarted={props.leagueHasStarted} loggedIn={props.loggedIn} />
                  </div>
                  {tradeProposals.length > 0 ? <img src={require('../media_files/new-mail-icon.png')} onClick={() => setTradeModalOpen(true)} className="w-[4vw] fixed mx-auto cursor-pointer" />: ""}
                  <select onChange={e => props.setSelectedTeam(e.target.value)} className="h-12 text-md min-w-0 rounded-md font-semibold bg-gray-900 text-blue-200">
                  {props.teamRosters.map((team, index) => (
                  <option key={team.owner} disabled={team.owner === props.ownerName} value={index}>{team.name + " (" + team.owner + ")"}</option>
                  ))}
                </select>
                </div>
              </div>
        </div>
        {/* 3 column wrapper */}
        <div className="flex-grow w-full max-w-7xl mx-auto px-1 flex">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 min-w-0 flex">
            <div className="border-blue-200 p-6 flex-shrink-0 border-r bg-gray-900">
              <div className="h-full w-[22vw] bg-gray-800">
                {/* Start left column area */}
                <div className="h-full relative">
                  <div className="absolute inset-0 border-2 border-blue-200 border-dashed rounded-lg" />
                  <div className="relative grid w-full justify-center">
                    <div className="text-blue-200 w-full mt-2 text-lg">
                  <ul className="grid w-full">
                  {myPlayers.map((player, index) => (
                    <button key={player.id} onClick={() => handleMyTeamClick(index)} className={classNames(myTradeBlock.includes(index) ? "border-2 border-green-200": "border-2 border-transparent", "w-[20vw] py-1 mt-2 bg-gray-900 hover:bg-gray-700 rounded-md cursor-pointer shadow-2xl")}>
                    <div className="inline-flex">
                    <img className="h-16 w-16" src={require(`../media_files/roster_pics/${player.playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
                    <div className="grid">
                    <li>{player.playerName}</li>
                    <p className="text-gray-300 text-opacity-75 mt-1 text-xs">Pts - {player.totalPoints} - Proj - {player.projection}</p>
                    <p onClick={() => handleDetailsClick(player.playerName)} className="text-center text-xs mt-1 text-blue-200 hover:text-white">view details</p>
                    </div>
                    </div>
                    </button>
                  ))}
                  </ul>
                  </div>
                  </div>
                </div>
                {/* End left column area */}
              </div>
            </div>

            <div className="bg-gray-900 min-w-[24vw] flex-1">
              <div className="h-full p-6">
                {/* Start main area*/}
                <div className="relative h-full">
                  <div className="absolute inset-0 border-2 border-blue-200 border-dashed rounded-lg" />
                  <div className="relative grid w-full">
                    <div className="text-blue-200 w-full mt-2 text-lg">
                  <ul className="grid w-full px-4">
                    {myTradeBlock.length > 0 ? <div className="inline-flex">
                        <h1 className={classNames(validTrade ? "text-green-300": "text-gray-400", "text-lg text-center font-semibold")}>{myTradeBlock.length > 1 ? `${props.ownerName} trades (${myTotal} pts)`: `${props.ownerName} trades`}</h1>
                        </div>: ""}
                  {myTradeBlock ? myTradeBlock.map(tradePlayer => (
                    <button key={myPlayers[tradePlayer].id} onClick={() => handleMyTeamClick(tradePlayer)} className="w-full border-2 border-transparent mt-2 bg-gray-700 hover:bg-gray-800 rounded-md cursor-pointer shadow-2xl">
                    <div className="inline-flex justify-center w-full">
                    <img className="h-24 w-24" src={require(`../media_files/roster_pics/${myPlayers[tradePlayer].playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
                    <div className="grid">
                    <li className="text-lg mt-2 font-bold">{myPlayers[tradePlayer].playerName}</li>
                    <p className="text-gray-300 text-opacity-75 mt-1 text-sm">Pts - {myPlayers[tradePlayer].totalPoints} - Proj - {myPlayers[tradePlayer].projection}</p>
                    <p onClick={() => handleDetailsClick(myPlayers[tradePlayer].playerName)} className="text-center text-sm mt-1 text-blue-200 hover:text-white">view details</p>
                    </div>
                    </div>
                    </button>
                  )): ""}
                  </ul>
                  </div>
                  </div>
                  <div className="relative grid w-full">
                    <div className="text-blue-200 w-full mt-2 text-lg">
                  <ul className="grid w-full px-4">
                    {otherTradeBlock.length > 0 ? <div className="inline-flex">
                      <h1 className={classNames(validTrade ? "text-green-300": "text-gray-400", "text-lg text-center font-semibold")}>{otherTradeBlock.length > 1 ? `${props.ownerName} receives (${otherTotal} pts)`: `${props.ownerName} receives`}</h1>
                      </div>: ""}
                  {otherTradeBlock ? otherTradeBlock.map(tradePlayer => (
                    <button key={players[tradePlayer].id} onClick={() => handleOtherTeamClick(tradePlayer)} className="w-full border-2 border-transparent mt-2 bg-gray-600 hover:bg-gray-700 rounded-md cursor-pointer shadow-2xl">
                    <div className="inline-flex justify-center w-full">
                    <img className="h-24 w-24" src={require(`../media_files/roster_pics/${players[tradePlayer].playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
                    <div className="grid">
                    <li className="text-lg mt-2 font-bold">{players[tradePlayer].playerName}</li>
                    <p className="text-gray-300 text-opacity-75 mt-1 text-sm">Pts - {players[tradePlayer].totalPoints} - Proj - {players[tradePlayer].projection}</p>
                    <p onClick={() => handleDetailsClick(players[tradePlayer].playerName)} className="text-center text-sm mt-1 text-blue-200 hover:text-white">view details</p>
                    </div>
                    </div>
                    </button>
                  )): ""}
                  </ul>
                  <div className="grid w-full mt-4 px-8">
                  {myTradeBlock.length === 0 && otherTradeBlock.length === 0 ? <p className="text-lg text-center text-gray-400 font-semibold">Click on a player to add to trade</p>: ""}
                  {myTradeBlock.length > 1 && otherTradeBlock.length > 1 && myTradeBlock.length === otherTradeBlock.length ? (<>
                  <button disabled={!validTrade || tradeLoading} onClick={() => propose(true)} className={classNames(validTrade ? "cursor-pointer bg-blue-900": "pointer-events-none bg-gray-800", "w-full py-3 mt-2 text-blue-200 rounded-md hover:bg-[#003083] hover:text-white shadow-2xl font-semibold text-lg")}>
                    <div className="inline-flex">
                    <p>{!tradeLoading ? 'Gamble Trade (random selection)': 'Submitting Trade...'}</p>
                    {tradeLoading ? <div className="pl-4 flex justify-center items-center">
                        <div className="animate-spin inline-block">
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                        </div>
                        </div>: ""}
                      </div>
                  </button>
                  <button disabled={!validTrade || tradeLoading} onClick={() => propose(false)} className={classNames(validTrade ? "cursor-pointer bg-blue-900": "pointer-events-none bg-gray-800", "w-full py-3 mt-4 text-blue-200 rounded-md hover:bg-[#003083] hover:text-white shadow-2xl font-semibold text-lg")}>
                  <div className="inline-flex">
                    <p>{!tradeLoading ? 'Propose an even trade': 'Submitting Trade...'}</p>
                    {tradeLoading ? <div className="pl-4 flex justify-center items-center">
                        <div className="animate-spin inline-block">
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                        </div>
                        </div>: ""}
                      </div>
                  </button></>): ""}
                  </div>
                  </div>
                  </div>
                </div>
                {/* End main area */}
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 flex-shrink-0 border-l border-blue-200">
            <div className="h-full w-[22vw] bg-gray-800">
              {/* Start right column area */}
              <div className="h-full relative">
                <div className="absolute inset-0 border-2 border-blue-200 border-dashed rounded-lg" />
                <div className="relative grid w-full justify-center">
                  <div className="text-blue-200 w-full mt-2 text-lg">
                  <ul className="grid w-full">
                  {players.map((player, index) => (
                    <button key={player.id} onClick={() => handleOtherTeamClick(index)} className={classNames(otherTradeBlock.includes(index) ? "border-2 border-green-200": "border-2 border-transparent", "w-[20vw] py-1 mt-2 bg-gray-900 hover:bg-gray-700 rounded-md cursor-pointer shadow-2xl")}>
                    <div className="inline-flex">
                    <img className="h-16 w-16" src={require(`../media_files/roster_pics/${player.playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
                    <div className="grid">
                    <li>{player.playerName}</li>
                    <p className="text-gray-300 text-opacity-75 mt-1 text-xs">Pts - {player.totalPoints} - Proj - {player.projection}</p>
                    <p onClick={() => handleDetailsClick(player.playerName)} className="text-center text-xs mt-1 text-blue-200 hover:text-white">view details</p>
                    </div>
                    </div>
                    </button>
                  ))}
                  </ul>
                  </div>
                </div>
              </div>
              {/* End right column area */}
            </div>
          </div>
        </div>
      </div>
      {tradeModalOpen ? <TradeModal setTradeModalOpen={setTradeModalOpen} playerArray={props.playerArray} myIndex={myIndex} swapAfterTrade={props.swapAfterTrade} teamRosters={props.teamRosters} tradeProposals={tradeProposals} handleDetailsClick={handleDetailsClick} />: ""}
      {showTradeSuccessNote ? <TradeSuccessNote show={showTradeSuccessNote} setShow={setShowTradeSuccessNote} />: ""}
    </>
  )
}
