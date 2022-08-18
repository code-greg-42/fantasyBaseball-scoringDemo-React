import FantasyBaseball from "../contracts/FantasyBaseball.sol/FantasyBaseball"
import Popdown from "./Popdown"
import DraftPlayerProfile from "./DraftPlayerProfile"
import DraftPlayerHighlight from "./DraftPlayerHighlight"
import SuccessNotification from "./SuccessNotification"
import Loader from "./Loader"
import { ethers } from 'ethers'
import {getDraftPlayers, rollDraftPicks} from "../functions/mlbApi";
import {useState, useEffect} from "react";
const contractAddress = '0xdf3a0252D5c75640380ab29b2a55b7534Aa0De5B';
const url = process.env.REACT_APP_ALCHEMY_RINKEBY_URL;
const provider = new ethers.providers.JsonRpcProvider(url);
const privateKey = process.env.REACT_APP_RINKEBY_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

const tierStartIndex = {
    1: 0,
    2: 4,
    3: 14,
    4: 24,
    5: 34,
    6: 44,
    7: 54,
}

export default function DraftPage(props) {

    const [draftStats, setDraftStats] = useState([]);
    const [profileSelectStats, setProfileSelectStats] = useState({});
    const [showSuccessNote, setShowSuccessNote] = useState(false);
    const [selected, setSelected] = useState(null);
    const [profileSelect, setProfileSelect] = useState("");
    const [picks, setPicks] = useState([]);
    const [options, setOptions] = useState([]);
    const [tier, setTier] = useState(0);
    const [otherTierOptions, setOtherTierOptions] = useState([]);
    const [rerolls, setRerolls] = useState(5);
    const [loading, setLoading] = useState(true);
    const [draftPickLoading, setDraftPickLoading] = useState(false);
    const [draftPpOpen, setDraftPpOpen] = useState(false);
    const [draftHighlightOpen, setDraftHighlightOpen] = useState(false);

    useEffect(() => {
        getDraftPlayers(setDraftStats, setLoading);
    }, []);

    useEffect(() => {
        if (tier > 0) {
        getTierOptions();
        }
    }, [tier]);

    useEffect(() => {
        if (!loading) {
            getRoster();
        }
    }, [loading]);

    async function getRoster() {
        console.log(props.ownerName);
        const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
        const roster = await bbContract.getRoster(props.ownerName);
        console.log(roster);
        console.log(roster.length);
        if (roster.length > 0) {
        const previouslyDrafted = [];
        roster.forEach(p => {
            const id = p.toNumber();
            console.log(id);
            const player = draftStats.find(hitter => id === hitter.playerId);
            console.log(player);
            previouslyDrafted.push(player);
        });
        setPicks(previouslyDrafted);
        props.setRoundsDrafted(roster.length);
        setTier(roster.length + 1);
        }
    }

    function handleProfileClick(playerName) {
        setProfileSelect(playerName);
        const playerStats = draftStats.find(p => p.playerName === playerName);
        const posRank = getPosRank(draftStats, playerStats.position, playerName);
        playerStats.posRank = posRank;
        setProfileSelectStats(playerStats);
        setDraftPpOpen(true);
    }

    async function handleRefreshClick() {
        if (rerolls > 0) {
        getTierOptions();
        setRerolls(prev => prev - 1);
        setSelected(null);
        setShowSuccessNote(true);
        setTimeout(() => {
            setShowSuccessNote(false);
        }, 6000)
        }
    }

    async function submitPick() {
        if (picks.length === 0) {
            setPicks([options[selected]]);
        } else {
        const picksArray = [...picks, options[selected]];
        console.log(picksArray);
        setPicks(picksArray);
        }
        try {
        const playerId = options[selected].playerId;
        setDraftPickLoading(true);
        if (tier === 7) {
            const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
            const draftPick = await bbContract.submitPick(props.ownerName, playerId);
            await draftPick.wait();
            console.log(draftPick);
            setSelected(null);
            setTier(prevTier => prevTier + 1);
            props.setRoundsDrafted(prevRound => prevRound + 1);
            const newArr = props.teamList.map(t => {
                if (t.username === props.ownerName) {
                    return {...t, draftComplete: true}
                }
                return t;
            });
            props.setTeamList(newArr);
            setDraftPickLoading(false);
        } else {
        setSelected(null);
        setTier(prevTier => prevTier + 1);
        props.setRoundsDrafted(prevRound => prevRound + 1);
        const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
        const draftPick = await bbContract.submitPick(props.ownerName, playerId);
        await draftPick.wait();
        console.log(draftPick);
        setDraftPickLoading(false);
        };
        } catch (e) {
            console.log('draft error');
        }
    }

    function getTierOptions() {
        if (tier === 1) {
            let topTier = [draftStats[0], draftStats[1], draftStats[2], draftStats[3]];
            topTier[0].overallRank = 1;
            topTier[1].overallRank = 2;
            topTier[2].overallRank = 3;
            topTier[3].overallRank = 4;
            console.log(topTier);
            setOptions(topTier);
        } else {
            if (tier < 8) {
            let indexes = rollDraftPicks(tierStartIndex[tier]);
            console.log(indexes);
            let tierIndexes = draftStats.filter((p, index) => index >= tierStartIndex[tier] && index < tierStartIndex[tier] + 10 && !indexes.includes(index));
            setOtherTierOptions(tierIndexes);
            let players = [draftStats[indexes[0]], draftStats[indexes[1]], draftStats[indexes[2]], draftStats[indexes[3]]];
            players[0].overallRank = indexes[0] + 1;
            players[1].overallRank = indexes[1] + 1;
            players[2].overallRank = indexes[2] + 1;
            players[3].overallRank = indexes[3] + 1;
            console.log(players);
            setOptions(players);
            };
        }
    }

    function getPosRank(stats, position, playerName) {
        let posArray = stats.filter(player => player.position === position);
        posArray.sort((a, b) => b.totalPoints - a.totalPoints);
        console.log(posArray);
        let index = posArray.findIndex(player => player.playerName === playerName);
        console.log(index);
        return index + 1;
    }

    function getTeamProjection(picks) {
        let ppgTotal = picks.reduce((p, c) => p + c.ppgAverage, 0);
        return (Math.round(ppgTotal * 30 * 100) / 100);
    }

    if (tier === 8) {
        return (<>
        <div className="mt-4 ml-4">
        <Popdown navSelect={props.navSelect} roundsDrafted={props.roundsDrafted} leagueHasStarted={props.leagueHasStarted} loggedIn={props.loggedIn} setNavSelect={props.setNavSelect} />
        </div>
        <div className="grid w-screen place-items-center">
            <div className="inline-flex items-center">
                <h1 className="text-blue-200 text-xl">Draft Complete! Projected Points:</h1>
                <p className="text-blue-400 ml-1 text-xl font-bold">{getTeamProjection(picks)}</p>
            </div>
        <div className="text-blue-200 mt-2 text-center text-lg">
        <ol className="grid p-1">
        {picks.map((pick, index) => (
            <button key={pick.playerId} onClick={() => handleProfileClick(pick.playerName, pick.overallRank - 1)} className="w-80 mt-2 bg-gray-800 hover:bg-gray-900 rounded-md cursor-pointer shadow-2xl">
            <div className="inline-flex p-2">
            <img key={pick.playerId} className="relative h-16 w-16" src={require(`../media_files/roster_pics/${pick.playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
            <div className="grid">
            <li key={pick.playerId}>{index + 1}. {pick.playerName}</li>
            <p className="text-gray-300 text-opacity-75 text-sm">Rank#{pick.overallRank} - Projected - {Math.round(pick.ppgAverage * 30 * 100) / 100}</p>
            </div>
            </div>
            </button>
        ))}
        <button onClick={() => props.setNavSelect('League Leaderboard')} className="w-80 h-16 mt-4 bg-blue-900 hover:bg-blue-700 text-blue-200 hover:text-white rounded-md cursor-pointer shadow-2xl">
            Back to League Leaderboard
        </button>
        </ol>
        </div>
        </div>
        {draftPpOpen ? <DraftPlayerProfile ppOpen={draftPpOpen} setPpOpen={setDraftPpOpen} selectedPlayer={profileSelect} selectedPlayerStats={profileSelectStats} setHighlightOpen={props.setHighlightOpen} setSelectedPlayer={props.setSelectedPlayer} setDraftHighlightOpen={setDraftHighlightOpen} />:""}
        {draftHighlightOpen ? <DraftPlayerHighlight selectedPlayer={profileSelect} selectedPlayerStats={profileSelectStats} setDraftHighlightOpen={setDraftHighlightOpen} />:""}
        </>)
    } else {
    return (<>
        <div className="absolute left-[47vw] top-[-3vh]">
        {loading ? <Loader />: ""}
        </div>
        <div className="mt-4 ml-4">
        <Popdown navSelect={props.navSelect} roundsDrafted={props.roundsDrafted} leagueHasStarted={props.leagueHasStarted} loggedIn={props.loggedIn} setNavSelect={props.setNavSelect} />
        </div>
        <div className="grid w-screen place-items-center">
        {tier < 2 ? <h1 className="text-blue-200 font-bold text-2xl text-center mt-8">{loading? "Loading...": "Select Your Team!"}</h1>:""}
        {tier > 1 ? <button onClick={handleRefreshClick} disabled={rerolls === 0} className="bg-gray-800 shadow-2xl inline-flex border border-gray-900 hover:text-white hover:bg-gray-900 w-60 mt-4 rounded-md text-blue-200 items-center justify-center text-lg space-x-2 p-2">
            <p>{rerolls === 0 ? "No Rolls Left": "Reroll This Tier"}</p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
        </button>: ""}
        {tier < 2 ? <p className="text-gray-400 mt-4 text-center">All 4 options from the first tier are available. The rest of the tier options are randomized. Re-rolls are available but limited to 3. Good luck!</p>: <p className="text-gray-400 mt-4 text-center">The other options in this tier are {otherTierOptions.map((op, i) => i === otherTierOptions.length - 1 ? "and " + op.playerName + ".": op.playerName + ", ")}</p>}
        </div>
        {tier === 0 ? <div className="grid mx-[15vw]">
            <button onClick={() => setTier(1)} disabled={loading} className={classNames(loading ? "pointer-events-none bg-gray-600 bg-opacity-75": "bg-gray-800", "shadow-2xl inline-flex border-x-4 border-black border-top-4 hover:text-white hover:bg-gray-900 font-bold text-lg w-full mt-4 rounded-md text-blue-200 items-center justify-center space-x-2 p-2")}>Start Draft</button>
            <img className="border-x-4 border-b-4 border-black shadow-2xl" src={require('../media_files/mlbStars.jpeg')} /></div>:
        (<>
        <h2 className="text-blue-200 font-bold text-2xl text-center mt-4">Tier {tier}/7</h2>
        <div className="flex justify-between my-6 mx-24 sm:mx-16">
        {options.map((option, index) => (<button key={index} onClick={() => setSelected(index)} className={classNames(index === selected ? "border-2 border-blue-200 bg-gray-900": "bg-gray-800 border-2 border-transparent", "rounded-lg shadow-2xl hover:bg-gray-900 hover:text-white text-blue-200 py-2 px-4")}>
            {(<>
                <div className="inline-flex items-center w-[19vw]">
                <div className="grid text-sm justify-items-center">
                <img src={require(`../media_files/team_logos/${option.teamName.toLowerCase().replaceAll(" ", "_")}.webp`)} className="h-6 m-1" />
                <p>Rank</p>
                <p>{option.overallRank}</p>
                </div>
                <img className="relative h-20 ml-[2vw] w-20" src={require(`../media_files/roster_pics/${option.playerName.toLowerCase().replaceAll(" ", "_")}.png`)} />
                <div className="grid">
                <h2 className="font-bold">{option.playerName}</h2>
                <p className="font-light text-gray-400">{option.position}</p>
                </div>
                </div>
            <table className="shadow-2xl divide-y divide-gray-600 mt-1 text-gray-200 w-full">
                    <thead>
                    <tr className="divide-x divide-gray-600">
                        <th colSpan="2" className="p-1 text-center text-sm">
                            Recent Points
                        </th>
                        <th colSpan="2" className="p-1 text-center text-sm">
                            Season Points
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr className="divide-x divide-gray-600">
                        <td className="text-sm text-blue-300 text-center p-2">{option.sprintStats.pointsPerGame}</td>
                        <td className="text-sm text-blue-300 text-center p-2">{option.sprintStats.totalPoints}</td>
                        <td className="text-sm text-blue-300 text-center p-2">{option.seasonStats.pointsPerGame}</td>
                        <td className="text-sm text-blue-300 text-center p-2">{option.seasonStats.totalPoints}</td>
                        </tr>
                        <tr className="divide-x divide-gray-600 text-xs text-gray-400 text-opacity-50">
                            <td>ppg</td>
                            <td>total</td>
                            <td>ppg</td>
                            <td>total</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs mt-4">Season Stats</p>
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
                            sb
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            ops
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr className="divide-x divide-gray-600"><td className="text-sm text-blue-300 px-1 py-2 text-center">{option.seasonStats.battingAverage}</td>
                        <td className="text-sm text-blue-300 px-1 py-2 text-center">{option.seasonStats.homeRuns}</td>
                        <td className="text-sm text-blue-300 px-1 py-2 text-center">{option.seasonStats.rbi}</td>
                        <td className="text-sm text-blue-300 px-1 py-2 text-center">{option.seasonStats.stolenBases}</td>
                        <td className="text-sm text-blue-300 px-1 py-2 text-center">{option.seasonStats.ops}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <p className="text-xs mt-4">Recent Stats</p>
                <div className="inline-block w-full">
                <table className="min-w-full shadow-2xl divide-y divide-gray-400 rounded-md bg-gray-800 text-gray-200">
                    <thead>
                    <tr className="divide-x divide-gray-600">
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            gp
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            avg
                        </th>
                        <th scope="col" className="text-center text-sm font-extrabold px-1 py-2">
                            hr
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
                        <tr className="divide-x divide-gray-600"><td className={classNames(option.sprintStats.gamesPlayed < 18 ? "bg-red-900 bg-opacity-50": "", "text-sm px-1 text-blue-300 py-2 text-center")}>{option.sprintStats.gamesPlayed}</td>
                        <td className="text-sm px-1 text-blue-300 py-2 text-center">{option.sprintStats.battingAverage}</td>
                        <td className="text-sm px-1 text-blue-300 py-2 text-center">{option.sprintStats.homeRuns}</td>
                        <td className="text-sm px-1 text-blue-300 py-2 text-center">{option.sprintStats.stolenBases}</td>
                        <td className="text-sm px-1 text-blue-300 py-2 text-center">{option.sprintStats.ops}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                <p onClick={() => handleProfileClick(option.playerName, option.overallRank - 1)} className="text-xs text-center hover:text-white text-gray-400">View More Details</p>
                </>)}
        </button>))}
        </div>
        <div className="grid w-full justify-center">
            <button onClick={submitPick} disabled={selected === null || draftPickLoading === true} className="bg-blue-800 inline-flex shadow-2xl border border-gray-900 hover:bg-blue-900 hover:text-white w-60 mt-2 rounded-md text-blue-200 items-center justify-center space-x-2 p-2">
                <p>{draftPickLoading ? "Confirming last pick...": "Submit Pick"}</p>
                {!draftPickLoading ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>: <div className="pl-2 flex justify-center items-center">
                        <div className="animate-spin inline-block">
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                            <span className="w-4 h-4 border-2 rounded-full gap-4"></span>
                        </div>
                        </div>}
            </button>
        </div>
        {tier > 1 ? <div className="text-blue-200 mt-8 text-center text-sm">
        <ol className="inline-flex space-x-2 p-1">
        {picks ? picks.map((pick, index) => (
            <li key={index}>{index + 1}. {pick.playerName}</li>
        )): ""}
        </ol>
        </div>:""}
        {loading ? <Loader />: ""}
        <SuccessNotification show={showSuccessNote} setShow={setShowSuccessNote} rerolls={rerolls} /></>)}
        {draftPpOpen ? <DraftPlayerProfile ppOpen={draftPpOpen} setPpOpen={setDraftPpOpen} selectedPlayer={profileSelect} selectedPlayerStats={profileSelectStats} setDraftHighlightOpen={setDraftHighlightOpen} />:""}
        {draftHighlightOpen ? <DraftPlayerHighlight selectedPlayer={profileSelect} selectedPlayerStats={profileSelectStats} setDraftHighlightOpen={setDraftHighlightOpen} />:""}
    </>)};
}