import { hitterInfo } from "./nameStorage"
const axios = require('axios').default;

const url = "http://statsapi.mlb.com";

export async function getPlayerNames() {
    let playerList = {};
    let countryList = [];
    const baseEndpoint = `/api/v1/stats?stats=season&group=hitting&playerPool=All&limit=800&sortStat=onBasePlusSlugging`;
    const res = await axios.get(url + baseEndpoint);
    console.log(res.data);
    const splits = res.data.stats[0].splits;
    
    for (const split of splits) {
    const endpoint = `/api/v1/people/${split.player.id}`
    const response = await axios.get(url + endpoint);
    console.log(response.data);
    const {birthCountry, currentAge, fullName, height, id, mlbDebutDate, weight, primaryNumber} = response.data.people[0];
    const position = response.data.people[0].primaryPosition.name;
    const teamId = split.team.id;
    const teamName = split.team.name;
    const handedness = response.data.people[0].batSide.code + "/" + response.data.people[0].pitchHand.code;
    const playerData = {
        birthCountry,
        currentAge,
        mlbDebutDate,
        fullName,
        id,
        height,
        weight,
        position,
        handedness,
        primaryNumber,
        teamId,
        teamName,
    }

    playerList[fullName] = playerData;
    if (!countryList.includes(birthCountry)) {
        countryList.push(birthCountry);
    }}
    console.log(playerList);
    console.log(countryList);
}

export function numOwners(teamRosters, playerArray) {
    let ownersArray = {};
    playerArray.forEach(player => {
        let owners = teamRosters.filter(team => team.roster.includes(player.id));
        console.log(owners);
        ownersArray[player.id] = owners.length;
    });
    console.log(ownersArray);
    return ownersArray;
}

function testPointTotals(stats) {
    return stats.totalBases + (stats.hits * 1.5) + (stats.rbi * 0.75) + (stats.runs * 0.75) + stats.freePasses + (stats.homeRuns * 1.25) + stats.stolenBases;
}

function returnRandom(start, players) {
    let rand = Math.floor(Math.random() * 10 + start);
    if (!players.includes(rand)) {
        return rand;
    } else {
    return returnRandom(start, players);
    };
}

export function rollDraftPicks(start) {
    let players = [];
    for (let i = 0; i < 4; i++) {
    let rand = returnRandom(start, players);
    if (rand) {
    players.push(rand);
    }
    }
    return players;
}

function preRankPointTotals(stats) {
    return (stats.totalBases + (stats.hits * 1.5) + (stats.rbi * 0.75) + (stats.runs * 0.75) + stats.baseOnBalls + stats.hitByPitch + (stats.homeRuns * 1.25) + (stats.stolenBases)) / stats.gamesPlayed;
}

export async function getDraftPlayers(setDraftStats, setLoading) {
    const startDate = '2022-07-01';
    const endpoint1 = `/api/v1/stats?stats=season&sportId=1&season=2022&group=hitting&position=2,dh,3,4,5,6,7,8,9&limit=200`
    const response1 = await axios.get(url + endpoint1);
    const playerSeasonStats = response1.data.stats[0].splits;
    playerSeasonStats.sort((a, b) => preRankPointTotals(b.stat) - preRankPointTotals(a.stat));
    console.log(playerSeasonStats);
    const statsArray = playerSeasonStats.slice(0, 75);

    const draftStatsArray = [];

    for (const stats of statsArray) {
        const playerName = stats.player.fullName;
        const playerId = stats.player.id;
        const position = stats.position.abbreviation;
        const teamId = stats?.team.id ?? hitterInfo[playerName].teamId;
        const teamName = stats?.team.name ?? hitterInfo[playerName].teamName;
        const freePasses = stats.stat.baseOnBalls + stats.stat.hitByPitch;
        const { avg, gamesPlayed, hits, homeRuns, obp, ops, rbi, runs, slg, totalBases, stolenBases } = stats.stat;
        const selectedStats = {
            playerName,
            playerId,
            position,
            teamId,
            teamName,
            seasonStats: {
            freePasses,
            battingAverage: avg,
            gamesPlayed,
            hits,
            homeRuns,
            obp,
            ops,
            rbi,
            runs,
            slg,
            totalBases,
            stolenBases
            },
            sprintStats: {},
            }
            const points = testPointTotals(selectedStats.seasonStats);
            const pointsPerGamePlayed = points / selectedStats.seasonStats.gamesPlayed;
            const ppgRounded = Math.round((pointsPerGamePlayed + Number.EPSILON) * 100) / 100;
            selectedStats.seasonStats.totalPoints = points;
            selectedStats.seasonStats.pointsPerGame = ppgRounded;

            const statsEndpoint = `/api/v1/people/${playerId}?season=2022&hydrate=stats(group=hitting,type=byDateRange(startDate=${startDate}))`
            const statsResponse = await axios.get(url + statsEndpoint);
            const playerSprint = statsResponse.data.people[0].stats[0].splits[0].stat;

            const sprintStats = {
            freePasses: playerSprint.baseOnBalls + playerSprint.hitByPitch,
            battingAverage: playerSprint.avg,
            gamesPlayed: playerSprint.gamesPlayed,
            hits: playerSprint.hits,
            homeRuns: playerSprint.homeRuns,
            obp: playerSprint.obp,
            ops: playerSprint.ops,
            rbi: playerSprint.rbi,
            runs: playerSprint.runs,
            slg: playerSprint.slg,
            totalBases: playerSprint.totalBases,
            stolenBases: playerSprint.stolenBases,
            }
            const sprintPoints = testPointTotals(sprintStats);
            const sprintPointsPerGame = sprintPoints / sprintStats.gamesPlayed;
            const sprintPpgRounded = Math.round((sprintPointsPerGame + Number.EPSILON) * 100) / 100;
            sprintStats.totalPoints = sprintPoints;
            sprintStats.pointsPerGame = sprintPpgRounded;
            selectedStats.sprintStats = sprintStats;
            selectedStats.ppgAverage = Math.round((sprintPpgRounded + ppgRounded) / 2 * 100) / 100;
            draftStatsArray.push(selectedStats);
        };
        draftStatsArray.sort((a, b) => b.ppgAverage - a.ppgAverage);
        console.log(draftStatsArray);
        setDraftStats(draftStatsArray);
        setLoading(false);
}

export async function getPlayerSprintStats(setTeamRosters, setTeamLoading, setPlayerArray, rosterObject, setProjections, setProjLoading) {
    const kickoffDate = rosterObject.kickoffTime;
    const kickoffString = new Date(kickoffDate);
    const kickoffStartDate = kickoffString.getFullYear() + "-" + (kickoffString.getMonth() + 1) + "-" + kickoffString.getDate();
    const teamRosters = rosterObject.teams;
    console.log(teamRosters);
    const hydratedEndpoint = `/api/v1/stats?stats=byDateRange&startDate=${kickoffStartDate}&group=hitting&playerPool=Qualified&limit=80&sortStat=onBasePlusSlugging`
    const response = await axios.get(url + hydratedEndpoint);
    const statsArray = response.data.stats[0].splits;
    console.log(statsArray);
    const playerArray = [];

    for (const team of teamRosters) {
        let teamPoints = 0;
        let topPlayer = {name: "", points: 0};
        console.log(team);
        for (const id of team.roster) {
            const playerIndex = playerArray.findIndex(p => p.id === id);
            const statsIndex = statsArray.findIndex(p => p.player.id === id);
            if (playerIndex === -1) {
                if (statsIndex !== -1) {
                const stats = statsArray[statsIndex];
                const playerName = stats.player.fullName;
                const position = stats.position.name;
                const teamId = stats?.team.id ?? hitterInfo[playerName].teamId;
                const teamName = stats?.team.name ?? hitterInfo[playerName].teamName;
                const freePasses = stats.stat.baseOnBalls + stats.stat.hitByPitch;
                const status = "active";
                const { atBats, avg, gamesPlayed, hits, homeRuns, obp, ops, plateAppearances, rbi, runs, slg, totalBases, stolenBases } = stats.stat;
                const sprintStats = {
                    id,
                    playerName,
                    teamName,
                    teamId,
                    position,
                    status,
                    atBats,
                    freePasses,
                    battingAverage: avg,
                    gamesPlayed,
                    hits,
                    homeRuns,
                    obp,
                    ops,
                    plateAppearances,
                    rbi,
                    runs,
                    slg,
                    totalBases,
                    stolenBases,
                };
                    const points = testPointTotals(sprintStats);
                    teamPoints += points;
                    const pointsPerGamePlayed = points / sprintStats.gamesPlayed;
                    const ppgRounded = Math.round((pointsPerGamePlayed + Number.EPSILON) * 100) / 100;
                    sprintStats.totalPoints = points;
                    sprintStats.pointsPerGame = ppgRounded;
                    if (points > topPlayer.points) {
                        topPlayer.name = playerName;
                        topPlayer.points = points;
                    }
                    playerArray.push(sprintStats);
                } else {
                    console.log(id);
                    const endpoint = `/api/v1/people/${id}?season=2022&hydrate=stats(group=hitting,type=byDateRange(startDate=${kickoffStartDate}))`
                    const response = await axios.get(url + endpoint);
                    const position = response.data.people[0].primaryPosition.name;
                    const stats = response.data.people[0]?.stats[0]?.splits[0]?.stat;
                    const playerName = response.data.people[0].fullName;
                    const teamName = response.data.people[0].stats[0]?.splits[0]?.team.name ?? hitterInfo[playerName].teamName;
                    const teamId = response.data.people[0].stats[0]?.splits[0]?.team.id ?? hitterInfo[playerName].teamId;
                    if (stats) {
                    const atBats = stats.atBats ? stats.atBats: 0;
                    const sprintStats = {
                        id,
                        playerName,
                        teamName,
                        teamId,
                        position,
                        status: "active",
                        atBats: atBats,
                        battingAverage: stats.avg ?? .000,
                        ops: stats.ops ?? .000,
                        gamesPlayed: stats.gamesPlayed ?? 0,
                        totalBases: stats.totalBases ?? 0,
                        hits: stats.hits ?? 0,
                        homeRuns: stats.homeRuns ?? 0,
                        plateAppearances: stats.plateAppearances ?? 0,
                        runs: stats.runs ?? 0,
                        rbi: stats.rbi ?? 0,
                        freePasses: stats.baseOnBalls ?? 0 + stats.hitByPitch ?? 0,
                        stolenBases: stats.stolenBases ?? 0,
                    }
                    const points = testPointTotals(sprintStats);
                    teamPoints += points;
                    const pointsPerGamePlayed = points / stats.gamesPlayed;
                    const ppgRounded = Math.round((pointsPerGamePlayed + Number.EPSILON) * 10) / 10;
                    sprintStats.totalPoints = points;
                    sprintStats.pointsPerGame = ppgRounded;
                    if (points > topPlayer.points) {
                        topPlayer.name = playerName;
                        topPlayer.points = points;
                    }
                    playerArray.push(sprintStats);
                } else {
                    const sprintStats = { 
                        id,
                        playerName,
                        teamId,
                        teamName,
                        position,
                        status: "injured" ,
                        atBats: 0,
                        battingAverage: 0,
                        ops: .000,
                        gamesPlayed: 0,
                        totalBases: 0,
                        hits: 0,
                        homeRuns: 0,
                        plateAppearances: 0,
                        runs: 0,
                        rbi: 0,
                        freePasses: 0,
                        stolenBases: 0,
                    }
                    playerArray.push(sprintStats);
                }
            }
        } else {
            const index = playerArray.findIndex(p => p.id === id);
            teamPoints += playerArray[index].totalPoints;
            if (playerArray[index].totalPoints > topPlayer.points) {
                topPlayer.name = playerArray[index].playerName;
                topPlayer.points = playerArray[index].totalPoints;
            }
        }};
        team.points = teamPoints;
        team.star = topPlayer;
        }
    teamRosters.sort((a, b) => b.points - a.points);
    teamRosters.forEach((team, index) => {
        team.ranking = index + 1;
        })
    playerArray.sort((a, b) => b.totalPoints - a.totalPoints);
    console.log(teamRosters);
    console.log(playerArray);
    setTeamRosters(teamRosters);
    setPlayerArray(playerArray);
    setTeamLoading(false);
    getPlayerSeasonStats(setPlayerArray, playerArray, teamRosters, setTeamRosters, setProjections, setProjLoading);
}

export async function getPlayerSeasonStats(setPlayerArray, playerArray, teamRosters, setTeamRosters, setProjections, setProjLoading) {
    const endpoint1 = `/api/v1/stats?stats=season&group=hitting&playerPool=Qualified&limit=80&sortStat=onBasePlusSlugging`
    const response = await axios.get(url + endpoint1);
    const statsArray = response.data.stats[0].splits;
    statsArray.sort((a, b) => preRankPointTotals(b.stat) - preRankPointTotals(a.stat));

    const draftStatsArray = [];

    for (const stats of statsArray) {
        const playerIndex = playerArray.findIndex(p => p.playerName === stats.player.fullName);
        if ( playerIndex !== -1) {
        const freePasses = stats.stat.baseOnBalls + stats.stat.hitByPitch;
        const { avg, gamesPlayed, hits, homeRuns, obp, ops, rbi, runs, slg, totalBases, stolenBases } = stats.stat;
        const seasonStats = {
            freePasses,
            battingAverage: avg,
            gamesPlayed,
            hits,
            homeRuns,
            obp,
            ops,
            rbi,
            runs,
            slg,
            totalBases,
            stolenBases,
            playerIndex
        };
            const points = testPointTotals(seasonStats);
            const pointsPerGamePlayed = points / seasonStats.gamesPlayed;
            const ppgRounded = Math.round((pointsPerGamePlayed + Number.EPSILON) * 100) / 100;
            seasonStats.totalPoints = points;
            seasonStats.pointsPerGame = ppgRounded;
            const obj = {...playerArray[playerIndex], seasonStats};
            const cumulativeAvg = (obj.pointsPerGame + (obj.seasonStats.pointsPerGame * (30 - obj.gamesPlayed))) / 30;
            const weightedAvgPPG = Math.round((cumulativeAvg + Number.EPSILON) * 100) / 100;
            obj.weightedAvgPPG = weightedAvgPPG;
            const playerProj = weightedAvgPPG * (30 - obj.gamesPlayed);
            const playerProjection = Math.round((playerProj + Number.EPSILON) * 10) / 10;
            obj.projection = playerProjection;
            draftStatsArray.push(obj);
        };
    };
    for (const player of playerArray) {
        if (draftStatsArray.findIndex(p => p.playerName === player.playerName) === -1) {
            const endpoint = `/api/v1/people/${player.id}?season=2022&hydrate=stats(group=hitting,type=season)`;
            const response = await axios.get(url + endpoint);
            const stats = response.data.people[0].stats[0].splits[0].stat;
            const { avg, gamesPlayed, hits, homeRuns, obp, ops, rbi, runs, slg, totalBases, stolenBases } = stats;
            const seasonStats = {
                freePasses: stats.baseOnBalls + stats.hitByPitch,
                battingAverage: avg,
                gamesPlayed,
                hits,
                homeRuns,
                obp,
                ops,
                rbi,
                runs,
                slg,
                totalBases,
                stolenBases
                };
                const points = testPointTotals(seasonStats);
                const pointsPerGamePlayed = points / seasonStats.gamesPlayed;
                const ppgRounded = Math.round((pointsPerGamePlayed + Number.EPSILON) * 100) / 100;
                seasonStats.totalPoints = points;
                seasonStats.pointsPerGame = ppgRounded;
                const obj = {...player, seasonStats};
                const cumulativeAvg = (obj.pointsPerGame + (obj.seasonStats.pointsPerGame * (30 - obj.gamesPlayed))) / 30;
                const weightedAvgPPG = Math.round((cumulativeAvg + Number.EPSILON) * 100) / 100;
                obj.weightedAvgPPG = weightedAvgPPG;
                const playerProj = weightedAvgPPG * (30 - obj.gamesPlayed);
                const playerProjection = Math.round((playerProj + Number.EPSILON) * 10) / 10;
                obj.projection = playerProjection;
                draftStatsArray.push(obj);
        }
    }
        draftStatsArray.sort((a, b) => b.weightedAvgPPG - a.weightedAvgPPG);
        console.log(draftStatsArray);
        setPlayerArray(draftStatsArray);

        const teams = [];
        const projections = {};
        let injPlayers = 0;
        for (const team of teamRosters) {
            let ppgProj = 0;
            let gamesPlayed = 0;
            team.roster.forEach(p => {
                const index = draftStatsArray.findIndex(player => player.id === p);
                if (draftStatsArray[index].weightedAvgPPG) {
                ppgProj += draftStatsArray[index].weightedAvgPPG;
                gamesPlayed += draftStatsArray[index].gamesPlayed;
                } else {
                    injPlayers += 1;
                }
            });
            let ppgProjAvg = ppgProj / (team.roster.length - injPlayers);
            const gamesLeft = team.roster.length * 30 - gamesPlayed;
            const projectedPointsFromNow = ppgProjAvg * gamesLeft;
            const projectedPoints = Math.round(((projectedPointsFromNow + team.points) + Number.EPSILON) * 100) / 100;
            const obj = {...team, projectedPoints};
            teams.push(obj);
            projections[team.owner] = projectedPoints;
        }
        setTeamRosters(teams);
        setProjections(projections);
        setProjLoading(false);
}