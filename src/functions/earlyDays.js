import {getPlayerSeasonStats} from "./mlbApi";

const axios = require('axios').default;

const url = "https://statsapi.mlb.com";

function testPointTotals(stats) {
    return stats.totalBases + (stats.hits * 1.5) + (stats.rbi * 0.75) + (stats.runs * 0.75) + stats.freePasses + (stats.homeRuns * 1.25) + stats.stolenBases;
}

export async function earlyDaysStats(setTeamRosters, setTeamLoading, setPlayerArray, rosterObject, setProjections, setProjLoading) {
    const kickoffDate = rosterObject.kickoffTime;
    const kickoffString = new Date(kickoffDate);
    const kickoffStartDate = kickoffString.getFullYear() + "-" + (kickoffString.getMonth() + 1) + "-" + kickoffString.getDate();
    const teamRosters = rosterObject.teams;
    const playerArray = [];

    for (const team of teamRosters) {
        let teamPoints = 0;
        let topPlayer = {name: "", points: 0};
        for (const id of team.roster) {
            const playerIndex = playerArray.findIndex(p => p.id === id);
            if (playerIndex === -1) {
                    const endpoint = `/api/v1/people/${id}?season=2022&hydrate=stats(group=hitting,type=byDateRange(startDate=${kickoffStartDate}))`
                    const response = await axios.get(url + endpoint);
                    const position = response.data.people[0].primaryPosition.name;
                    const stats = response.data.people[0]?.stats[0]?.splits[0]?.stat;
                    const playerName = response.data.people[0].fullName;
                    const teamName = response.data.people[0].stats[0]?.splits[0]?.team.name;
                    const teamId = response.data.people[0].stats[0]?.splits[0]?.team.id;
                    const sprintStats = {
                        id,
                        playerName,
                        teamName,
                        teamId,
                        position,
                        atBats: stats?.atBats ?? 0,
                        battingAverage: stats?.avg ?? .000,
                        ops: stats?.ops ?? .000,
                        gamesPlayed: stats?.gamesPlayed ?? 0,
                        totalBases: stats?.totalBases ?? 0,
                        hits: stats?.hits ?? 0,
                        homeRuns: stats?.homeRuns ?? 0,
                        plateAppearances: stats?.plateAppearances ?? 0,
                        runs: stats?.runs ?? 0,
                        rbi: stats?.rbi ?? 0,
                        freePasses: (stats?.baseOnBalls ?? 0) + (stats?.hitByPitch ?? 0),
                        stolenBases: stats?.stolenBases ?? 0,
                    }
                    const points = testPointTotals(sprintStats);
                    teamPoints += points;
                    const pointsPerGamePlayed = points / (stats?.gamesPlayed ?? 1);
                    const ppgRounded = Math.round((pointsPerGamePlayed + Number.EPSILON) * 10) / 10;
                    sprintStats.totalPoints = points;
                    sprintStats.pointsPerGame = ppgRounded;
                    if (points > topPlayer.points) {
                        topPlayer.name = playerName;
                        topPlayer.points = points;
                    }
                    playerArray.push(sprintStats);
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
    setTeamRosters(teamRosters);
    setPlayerArray(playerArray);
    setTeamLoading(false);
    getPlayerSeasonStats(setPlayerArray, playerArray, teamRosters, setTeamRosters, setProjections, setProjLoading);
}