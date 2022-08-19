const axios = require('axios').default;

const url = "https://statsapi.mlb.com";
const highlightKeywords = ["homer", "home-run", "home-runs", "slam", "slams", "grand-slams", "grand-slam", "dinger", "smash", "smashes", "homers", "blast", "blasts", "bomb", "bombs", "dingers", "walkoff", "walk-off", "walk off", "home run", "home runs", "grand slams", "grand slam", "launches", "blasts", "crushes", "crushed", "luanched"]

export async function getHighlights(playerId, teamId) {
    let originDate = new Date();
    const endDate = originDate.toISOString().split('T')[0];
    console.log(endDate);
    originDate.setMonth(originDate.getMonth() - 2);
    const startDate = originDate.toISOString().split('T')[0];
    console.log(startDate);
    const playerIdString = playerId.toString();
    const scheduleEndpoint = `/api/v1/schedule?sportId=1&teamId=${teamId}&season=2022&gameType=R&startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url + scheduleEndpoint);
    const gameDates = response.data.dates;
    const videos = [];

    for (let i = gameDates.length - 1; i > 0; i--) {
        if (videos.length > 2) {
            break;
        }
    const gamePk = gameDates[i].games[0].gamePk;
    console.log(gamePk);
    const contentEndpoint = `/api/v1/game/${gamePk}/content`;
    const content = await axios.get(url + contentEndpoint);
    console.log(content);
    const highlightReel = content.data.highlights;
    if (highlightReel.highlights !== null) {
    const highlights = content.data.highlights.highlights.items;
    console.log(highlights);
    const filtered = highlights.filter(highlight => {
        const index = highlight.keywordsAll.findIndex(keyword => keyword.value === playerIdString);
        console.log(index);
        if (index !== -1 && highlightKeywords.some(word => highlight.headline.includes(word))) {
        const highlightParticipants = highlight.keywordsAll.filter(keyword => keyword.type === 'player_id');
        console.log(highlightParticipants);
        if (highlightParticipants.length < 2) {
            return highlight;
        }};
        });
    console.log(filtered);
    if (filtered[0]) {
    videos.push(filtered[0].playbacks[4].url);
    const videoDate = filtered[0].date.substring(5, 10);
    console.log(videoDate);
    videos.push(videoDate);
    if (filtered.length > 1) {
    videos.push(filtered[1].playbacks[4].url);
    const videoDateTwo = filtered[1].date.substring(5, 10);
    console.log(videoDateTwo);
    videos.push(videoDateTwo);
    }}};
    console.log(videos);
    }
    console.log(videos);
    return videos;
}

export async function getMoreHighlights(playerId, teamId, endDate) {
    const newMonth = Number.parseInt(endDate[6] + endDate[7]) - 2;
    console.log(newMonth);
    const startDate = endDate.substring(0, 6) + newMonth.toString() + "-" + endDate.substring(8);
    console.log(startDate);
    let newDay = Number.parseInt(endDate.substring(endDate.length - 2)) - 1;
    if (endDate.substring(endDate.length - 2) === '01') {
        newDay = 30;
    }
    console.log(newDay);
    let newEndDate = endDate.substring(0, endDate.length - 2) + newDay.toString();
    console.log(newEndDate);
    const playerIdString = playerId.toString();
    const scheduleEndpoint = `/api/v1/schedule?sportId=1&teamId=${teamId}&season=2022&gameType=R&startDate=${startDate}&endDate=${newEndDate}`;
    const response = await axios.get(url + scheduleEndpoint);
    const gameDates = response.data.dates;
    console.log(gameDates);
    const videos = [];

    for (let i = gameDates.length - 2; i > 0; i--) {
        if (videos.length > 2) {
            break;
        }
    const gamePk = gameDates[i].games[0].gamePk;
    console.log(gamePk);
    const contentEndpoint = `/api/v1/game/${gamePk}/content`;
    const content = await axios.get(url + contentEndpoint);
    const highlights = content.data.highlights.highlights.items;
    console.log(highlights);
    const filtered = highlights.filter(highlight => {
        const index = highlight.keywordsAll.findIndex(keyword => keyword.value === playerIdString);
        console.log(index);
        if (index !== -1 && highlightKeywords.some(word => highlight.headline.includes(word))) {
        const highlightParticipants = highlight.keywordsAll.filter(keyword => keyword.type === 'player_id');
        console.log(highlightParticipants);
        if (highlightParticipants.length < 2) {
            return highlight;
        }};
        });
    console.log(filtered);
    if (filtered[0]) {
    videos.push(filtered[0].playbacks[4].url);
    const videoDate = filtered[0].date.substring(5, 10);
    console.log(videoDate);
    videos.push(videoDate);
    if (filtered.length > 2) {
    videos.push(filtered[1].playbacks[4].url);
    const videoDateTwo = filtered[1].date.substring(5, 10);
    console.log(videoDateTwo);
    videos.push(videoDateTwo);
    }};
    console.log(videos);
    }
    console.log(videos);
    return videos;
}

export async function getDailyHomers(date, setErrorMessage) {
    let response;
    let videos = [];
    if (!date) {
    const endpoint = '/api/v1/schedule?sportId=1';
    response = await axios.get(url + endpoint);
    } else {
        const endpoint = `/api/v1/schedule?sportId=1&startDate=${date}&endDate=${date}`;
        response = await axios.get(url + endpoint);
    }
    let games = response.data.dates[0].games;
    if (games) {
        for (const game of games) {
            let gamePk = game.gamePk;
            let contentEndpoint = `/api/v1/game/${gamePk}/content`
            const res = await axios.get(url + contentEndpoint);
            const highlights = res.data.highlights.highlights.items;
            const homerHighlights = highlights.filter(highlight => highlightKeywords.some(word => highlight.headline.includes(word) && highlight.keywordsAll[highlight.keywordsAll.length - 1].value !== 'interview' ));
            homerHighlights.forEach(homer => {
                if (homer.playbacks.length < 5 && homer.playbacks.length > 0) {
                    videos.push(homer.playbacks[0].url)
                    videos.push(homer.headline);
                }
                if (homer.playbacks.length > 4) {
                    videos.push(homer.playbacks[4].url);
                    videos.push(homer.headline);
                }
            });
            }
    } else {
        setErrorMessage('No highlights found.');
    }
    console.log(videos);
    return videos;

    }

    export async function getDraftPlayerHighlight(playerId, teamId) {
        let originDate = new Date();
        const endDate = originDate.toISOString().split('T')[0];
        console.log(endDate);
        originDate.setMonth(originDate.getMonth() - 2);
        const startDate = originDate.toISOString().split('T')[0];
        console.log(startDate);
        const playerIdString = playerId.toString();
        const scheduleEndpoint = `/api/v1/schedule?sportId=1&teamId=${teamId}&season=2022&gameType=R&startDate=${startDate}&endDate=${endDate}`;
        const response = await axios.get(url + scheduleEndpoint);
        const gameDates = response.data.dates;
        const videos = [];
    
        for (let i = gameDates.length - 1; i > 0; i--) {
            if (videos.length > 2) {
                break;
            }
        const gamePk = gameDates[i].games[0].gamePk;
        console.log(gamePk);
        const contentEndpoint = `/api/v1/game/${gamePk}/content`;
        const content = await axios.get(url + contentEndpoint);
        const highlights = content.data.highlights.highlights.items;
        console.log(highlights);
        const filtered = highlights.filter(highlight => {
            const index = highlight.keywordsAll.findIndex(keyword => keyword.value === playerIdString);
            console.log(index);
            if (index !== -1 && highlightKeywords.some(word => highlight.headline.includes(word))) {
            const highlightParticipants = highlight.keywordsAll.filter(keyword => keyword.type === 'player_id');
            console.log(highlightParticipants);
            if (highlightParticipants.length < 2) {
                return highlight;
            }};
            });
        if (filtered[0]) {
        videos.push(filtered[0].playbacks[4].url);
        const videoDate = filtered[0].date.substring(5, 10);
        const videoHeadline = filtered[0].headline;
        videos.push(videoDate);
        videos.push(videoHeadline);
        };
        };
        return videos;
    };