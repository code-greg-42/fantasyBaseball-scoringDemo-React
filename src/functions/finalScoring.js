export function finalScoring(teamRosters, playerArray) {
    const finalTeamsArray = [];
    for (const team in teamRosters) {
        let finalTeamPoints = 0;
        let playerFinalStats = [];
        for (const player in team.roster) {
            const playerStats = playerArray.find(p => p.id === player);
            playerFinalStats.push(playerStats);
        }
        playerFinalStats.sort((a, b) => b.totalPoints - a.totalPoints);
        let playerCounter = 0;
        let gamesNeeded = 25;
        let currentPoints = 0;
        for (let i = 0; playerCounter < 5 && i < playerFinalStats.length; i++) {
            if (playerFinalStats[i].gamesPlayed >= gamesNeeded) {
                finalTeamPoints += (currentPoints + (playerFinalStats[i].pointsPerGame * gamesNeeded));
                playerCounter++;
                currentPoints = 0;
            } else {
                currentPoints = playerFinalStats[i].totalPoints;
                gamesNeeded -= playerFinalStats[i].gamesPlayed;
            }
        }
        let teamObj = { teamId: team.teamId, name: team.name, finalPoints: finalTeamPoints };
        finalTeamsArray.push(teamObj);
    }
    finalTeamsArray.sort((a, b) => b.finalPoints - a.finalPoints);
    console.log(finalTeamsArray);
    return finalTeamsArray;
}