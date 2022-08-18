import FantasyBaseball from "../contracts/FantasyBaseball.sol/FantasyBaseball"
import ArrowsOnly from "./ArrowsOnly"
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

export default function TradeModal(props) {

    const [myPlayers, setMyPlayers] = useState([]);
    const [otherPlayers, setOtherPlayers] = useState([]);
    const [otherTeamName, setOtherTeamName] = useState("");
    const [useIndex, setUseIndex] = useState(0);
    const [totalProposals, setTotalProposals] = useState(0);
    const [loading, setLoading] = useState(false);
    const [myTeamSelection, setMyTeamSelection] = useState(0);
    const [otherTeamSelection, setOtherTeamSelection] = useState(0);
    const [gambleComplete, setGambleComplete] = useState(false);
    const [tradeId, setTradeId] = useState(0);
    const [isGambleTrade, setIsGambleTrade] = useState(false);
    const [showAcceptSuccessNote, setShowAcceptSuccessNote] = useState(false);

    useEffect(() => {
        // find player names and stats from trade proposals
        setLoading(false);
        setGambleComplete(false);
        setMyTeamSelection(0);
        setOtherTeamSelection(0);
        setTradeId(props.tradeProposals[useIndex].tradeId);
        setIsGambleTrade(props.tradeProposals[useIndex].isGamble);
        const otherTeamTrade1 = props.playerArray.find(p => p.id === props.tradeProposals[useIndex].sendingTeam.players[0]);
        const otherTeamTrade2 = props.playerArray.find(p => p.id === props.tradeProposals[useIndex].sendingTeam.players[1]);
        setOtherPlayers([otherTeamTrade1, otherTeamTrade2]);
        const otherTeamId = props.tradeProposals[useIndex].receivingTeam.teamId;
        const otherTeam = props.teamRosters.find(t => t.teamId === otherTeamId).name;
        setOtherTeamName(otherTeam);
        const myTeamTrade1 = props.playerArray.find(p => p.id === props.tradeProposals[useIndex].receivingTeam.players[0]);
        const myTeamTrade2 = props.playerArray.find(p => p.id === props.tradeProposals[useIndex].receivingTeam.players[1]);
        setMyPlayers([myTeamTrade1, myTeamTrade2]);
    }, [useIndex]);

    useEffect(() => {
        setTotalProposals(props.tradeProposals.length);
    }, [])

    async function acceptTrade() {
      // accept trade and prompt a gamble roll if applicable
        setLoading(true);
        let newRoster = [...props.teamRoster];
        let myPlayerTopIndex = false;
        let otherPlayerTopIndex = false;
        if (props.tradeProposals[useIndex].isGamble) {
        const myRoll = Math.floor(Math.random() * 2);
        console.log(myRoll);
        const myTeamIndex = newRoster.findIndex(t => t.teamId === props.tradeProposals[useIndex].receivingTeam.teamId);
        const myTeamPlayer1Index = newRoster[myTeamIndex].roster.findIndex(p => p === props.tradeProposals[useIndex].receivingTeam.players[myRoll]);
        if (myRoll === 0) {
          myPlayerTopIndex = true;
        }
        const otherRoll = Math.floor(Math.random() * 2);
        console.log(otherRoll);
        const otherTeamIndex = newRoster.findIndex(t => t.teamId === props.tradeProposals[useIndex].sendingTeam.teamId);
        const otherTeamPlayer1Index = newRoster[otherTeamIndex].roster.findIndex(p => p === props.tradeProposals[useIndex].sendingTeam.players[otherRoll]);
        if (otherRoll === 0) {
          otherPlayerTopIndex = true;
        }
        setGambleComplete(true);
        setMyTeamSelection(myRoll);
        setOtherTeamSelection(otherRoll);
        let temp = newRoster[myTeamIndex].roster[myTeamPlayer1Index];
        let temp2 = newRoster[otherTeamIndex].roster[otherTeamPlayer1Index];
        newRoster[myTeamIndex].roster[myTeamPlayer1Index] = temp2;
        newRoster[otherTeamIndex].roster[otherTeamPlayer1Index] = temp;
        }
        // enact trade to current overall team rosters so user does not have to reload for trade to take effect
        const myTeamIndex = newRoster.findIndex(t => t.teamId === props.tradeProposals[useIndex].sendingTeam.teamId);
        const myTeamPlayer1Index = newRoster[myTeamIndex].roster.findIndex(p => p === props.tradeProposals[useIndex].sendingTeam.players[0]);
        const myTeamPlayer2Index = newRoster[myTeamIndex].roster.findIndex(p => p === props.tradeProposals[useIndex].sendingTeam.players[1]);
        const otherTeamIndex = newRoster.findIndex(t => t.teamId === props.tradeProposals[useIndex].receivingTeam.teamId);
        const otherTeamPlayer1Index = newRoster[otherTeamIndex].roster.findIndex(p => p === props.tradeProposals[useIndex].receivingTeam.players[0]);
        const otherTeamPlayer2Index = newRoster[otherTeamIndex].roster.findIndex(p => p === props.tradeProposals[useIndex].receivingTeam.players[1]);
        let temp1 = newRoster[myTeamIndex].roster[myTeamPlayer1Index];
        let temp2 = newRoster[myTeamIndex].roster[myTeamPlayer2Index];
        let temp3 = newRoster[otherTeamIndex].roster[otherTeamPlayer1Index];
        let temp4 = newRoster[otherTeamIndex].roster[otherTeamPlayer2Index];
        newRoster[myTeamIndex].roster[myTeamPlayer1Index] = temp3;
        newRoster[myTeamIndex].roster[myTeamPlayer2Index] = temp4;
        newRoster[otherTeamIndex].roster[otherTeamPlayer1Index] = temp1;
        newRoster[otherTeamIndex].roster[otherTeamPlayer2Index] = temp2;
        props.swapAfterTrade(newRoster);

        setShowAcceptSuccessNote(true);
        try {
        const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
        const tradeAccept = await bbContract.acceptTrade(tradeId, otherPlayerTopIndex, myPlayerTopIndex);
        await tradeAccept.wait();
        console.log(tradeAccept);
        } catch(e) {
          console.log(e);
        }
        setLoading(false);
        setTimeout(() => {
          setShowAcceptSuccessNote(false);
        }, 5000);
    }

    return (<>
        <div className="z-20 fixed inset-0 overflow-y-hidden h-screen w-screen bg-gray-500 bg-opacity-75">
        <div className="fixed inset-0 m-auto grid w-[50vw] justify-center">
                    <div className="text-blue-200 w-full mt-2 text-lg">
                  <ul className="grid w-full">
                <ArrowsOnly setUseIndex={setUseIndex} useIndex={useIndex} totalProposals={totalProposals} />
                <p className={classNames(isGambleTrade ? "text-yellow-400": "text-green-400", "text-md mt-2 text-center fond-semibold")}>{isGambleTrade ? 'This trade was proposed as a gamble (randomly selects 1)': `This trade was proposed as an even trade, meaning 2 for 2`}</p>
                <h2 className={classNames(gambleComplete ? "transition-all text-green-400 duration-1000 delay-400": "", "text-2xl text-blue-200 mt-2 mb-1 shadow-2xl text-center font-bold")}>{gambleComplete ? 'My team receives': 'My team will receive'}</h2>
                  {myPlayers.map((player, index) => (
                    <button key={player.id} onClick={() => props.handleDetailsClick(player.playerName)} className={classNames(gambleComplete ? myTeamSelection === index ? "transition ease-out border-2 border-green-400 duration-[2000ms] w-full pointer-events-none py-1 mt-2 bg-gray-800 rounded-md shadow-2xl": "transition ease-out opacity-0 duration-[2000ms] pointer-events-none w-full py-1 mt-2 bg-gray-900 border-2 border-transparent rounded-md shadow-2xl": "w-full py-1 mt-2 bg-gray-900 hover:bg-gray-700 border-2 border-transparent rounded-md shadow-2xl")}>
                    <div className="inline-flex">
                    <img className="h-20 w-20" src={require(`../media_files/roster_pics/${player.playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
                    <div className="grid">
                    <li>{player.playerName}</li>
                    <p className="text-gray-300 text-opacity-75 mt-1 text-xs">Pts - {player.totalPoints} - Proj - {player.projection}</p>
                    <p onClick={() => props.handleDetailsClick(player.playerName)} className="text-center text-xs mt-1 text-blue-200 hover:text-white">view details</p>
                    </div>
                    </div>
                    </button>
                  ))}
                  <h2 className={classNames(gambleComplete ? "transition-all text-green-400 duration-1000 delay-400": "","text-2xl text-blue-200 mt-2 mb-1 shadow-2xl text-center font-bold")}>{gambleComplete ? `${otherTeamName} receives`: `${otherTeamName} will receive`}</h2>
                  {otherPlayers.map((player, index) => (
                    <button key={player.id} onClick={() => props.handleDetailsClick(player.playerName)} className={classNames(gambleComplete ? otherTeamSelection === index ? "transition ease-out border-2 border-green-400 duration-[2000ms] w-full pointer-events-none py-1 mt-2 bg-gray-800 rounded-md shadow-2xl": "transition ease-out opacity-0 duration-[2000ms] pointer-events-none w-full py-1 mt-2 bg-gray-900 border-2 border-transparent rounded-md shadow-2xl": "w-full py-1 mt-2 bg-gray-900 hover:bg-gray-700 border-2 border-transparent rounded-md shadow-2xl")}>
                    <div className="inline-flex">
                    <img className="h-20 w-20" src={require(`../media_files/roster_pics/${player.playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
                    <div className="grid">
                    <li>{player.playerName}</li>
                    <p className="text-gray-300 text-opacity-75 mt-1 text-xs">Pts - {player.totalPoints} - Proj - {player.projection}</p>
                    <p onClick={() => props.handleDetailsClick(player.playerName)} className="text-center text-xs mt-1 text-blue-200 hover:text-white">view details</p>
                    </div>
                    </div>
                    </button>
                  ))}
                  <div className="z-20 relative">
                  <button
                onClick={acceptTrade}
                disabled={gambleComplete}
                className="bg-blue-800 inline-flex shadow-2xl border border-gray-900 hover:bg-blue-900 hover:text-white w-full h-12 mt-2 rounded-md text-blue-200 items-center justify-center space-x-2 p-2">
                    <div className="inline-flex">
                    <p>{!loading ? 'Accept Trade': 'Submitting Trade...'}</p>
                    {loading ? <div className="pl-4 flex justify-center items-center">
                        <div className="animate-spin inline-block">
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                        </div>
                        </div>: ""}
                      </div>
                </button>
                <button
                onClick={() => props.setTradeModalOpen(false)}
                className="bg-blue-800 inline-flex shadow-2xl border border-gray-900 hover:bg-blue-900 hover:text-white w-full h-12 mt-2 rounded-md text-blue-200 items-center justify-center space-x-2 p-2">
                    Go back
                </button>
            </div>
                  </ul>
                  </div>
                  </div>
        </div>
        {showAcceptSuccessNote ? <TradeSuccessNote tradeAccepted={true} show={showAcceptSuccessNote} setShow={setShowAcceptSuccessNote} />: ""}
        </>)

}