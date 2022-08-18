import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import axios from 'axios';

const demoProjectId = '2CDb5s8hxGZEZgQtUPxjk9KwDtH';
const demoProjectSecret = 'fa39105826d2be41836e84e8a989a16a';
const buffer = Buffer.from(demoProjectId + ":" + demoProjectSecret);
const bufferString = buffer.toString('base64');
const auth = 'Basic ' + bufferString;
const client = create({
        host: 'fantasybaseballsprint.infura-ipfs.io',
        protocol: 'https',
        path: 'ipfs/api/v0',
        headers: {
        Authorization: auth
        }
  });


export async function postTeamData(data) {
  const ipfs = create({
    host: 'ipfs.infura.io',
    protocol: 'https',
    path: 'ipfs/api/v0',
    port: 5001,
    headers: {
    Authorization: auth
    }
});
  let result = await ipfs.add({
    path: '/',
    content: JSON.stringify(data),
  });
    return result.path;
}

const teamCID = "QmUnws2qewTMAbB2AnWoHk66is4qYoNTXm41QD2QnEXRE1";

export async function fetchTeamData() {
    let response = client.cat(teamCID);
    let content = [];
    for await (const chunk of response) {
      content = [...content, ...chunk];
    };
    const raw = Buffer.from(content).toString('utf8');
    const data = JSON.parse(raw);
    console.log(data);
    return data;
}

export async function fetchTeamDataTest(cid) {
  let response = client.cat(cid);
  let content = [];
  for await (const chunk of response) {
    content = [...content, ...chunk];
  };
  const raw = Buffer.from(content).toString('utf8');
  const data = JSON.parse(raw);
  console.log(data);
  return data;
}

export async function infuraTest(cid) {
  let urlEndpoint = `https://fantasybaseballsprint.infura-ipfs.io/ipfs/${cid}`;
  let response = await axios.get(urlEndpoint);
  return response.data
}

export async function infuraPostTest() {
  const response = await axios.post('https://fantasybaseballsprint.infura-ipfs.io', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic 2CDb5s8hxGZEZgQtUPxjk9KwDtH',
    },
    mode: 'no-cors',
    body: 'hello there friend. nice to talk to you again',
  })
  console.log(response);
}