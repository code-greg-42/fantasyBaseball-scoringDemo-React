import FantasyBaseball from "../contracts/FantasyBaseball.sol/FantasyBaseball"
import Loader from "./Loader"
import { ethers } from 'ethers'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
const contractAddress = '0xdf3a0252D5c75640380ab29b2a55b7534Aa0De5B';
const demoUrl = 'https://eth-rinkeby.alchemyapi.io/v2/2O0Sv9b_YJgqPnuyj0ynbT_Wz76lOZAn';
const provider = new ethers.providers.JsonRpcProvider(demoUrl);
const demoPrivateKey = '1cd4c4adff9cd49fe1b23624525c59ed0580a9a1020d5782ac2105943610436e';
const wallet = new ethers.Wallet(demoPrivateKey, provider);

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

export default function LoginPanel(props) {
  const [pwInput, setPwInput] = useState("");
  const [confirmPwInput, setConfirmPwInput] = useState("");
  const [pwShow, setPwShow] = useState(false);
  const [pwConfirmed, setPwConfirmed] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [wrongPw, setWrongPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (confirmPwInput !== pwInput) {
        setPwConfirmed(false);
    }
    if (confirmPwInput === pwInput) {
        setPwConfirmed(true);
    }
  }, [confirmPwInput]);

  useEffect(() => {

    if (props.teamList) {
            let index = props.teamList.findIndex(team => team.username.toLowerCase() === props.ownerName.toLowerCase());
            if (index !== -1) {
                setUsernameCheck(true);
            }
            if (index === -1) {
                setUsernameCheck(false);
            }
        }
    if (props.teamRosters) {
            let index = props.teamRosters.findIndex(team => team.owner.toLowerCase() === props.ownerName.toLowerCase());
            if (index !== -1) {
              setUsernameCheck(true);
          }
          if (index === -1) {
              setUsernameCheck(false);
          }
        }
  }, [props.ownerName]);

  function handlePwShowClick() {
    setPwShow(!pwShow);
  }

  function handlePwConfirmChange(e) {
    setConfirmPwInput(e.target.value);
  }

  function handleLoginPwInputChange(e) {
    setWrongPw(false);
    setPwInput(e.target.value);
  }

  async function handleTeamCreateSubmit(e) {
    // function for team creation, including creating an eth keypair
    e.preventDefault();
    try {
      if (pwConfirmed) {
      setLoginLoading(true);
      // create eth keypair and print to a .txt file that is downloaded by user
    const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
    const userWallet = ethers.Wallet.createRandom();
    const userAddress = userWallet.address;
    const userKeyString = `Ethereum Account Details
Private Key: ${userWallet.privateKey}
Address: ${userWallet.address}
Secret Phrase: ${userWallet.mnemonic.phrase}`
    const pw = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(pwInput));
    console.log(userAddress, pw);
    const blob = new Blob([userKeyString], { type: 'text', endings: 'native' })
    const blobData = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobData;
    link.download = 'eth-account.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobData);
    setPwInput("");
    setConfirmPwInput("");
    const id = await bbContract.totalTeams();
    const idNum = Number.parseInt(id._hex);
    props.setTeamId(idNum);
    // add new team to teamlist without having to be refreshed
    const teamInfo = {
        username: props.ownerName,
        teamName: props.teamName,
        teamId: idNum,
        draftComplete: false
    }
    const newTeamInfo = [...props.teamList, teamInfo];
    console.log(newTeamInfo);
    props.setTeamList(newTeamInfo);
    // add team to smart contract and wait until transaction is confirmed
    const teamCreated = await bbContract.join('baseball', props.teamName, props.ownerName, userAddress, pw, []);
    await teamCreated.wait();
    console.log(teamCreated);
    props.setLoginPanelOpen(false);
    props.setNavSelect('Draft a Team');
    setLoginLoading(false);
    props.setShowLoginSuccessNote(true);
    props.setLoggedIn(true);
        setTimeout(() => {
            props.setShowLoginSuccessNote(false);
        }, 5000);
      }
    } catch (e) {
      console.log('wrong inputs');
    }
  }

  async function handleLoginSubmit(e) {
    // check login via username and hashed password
    e.preventDefault();
    const bbContract = new ethers.Contract(contractAddress, FantasyBaseball.abi, wallet);
    const pw = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(pwInput));
    try {
    const login = await bbContract.login(props.ownerName, pw);
    const id = login.toNumber();
    console.log(id);
    props.setTeamId(id);
    if (rememberMe) {
    localStorage.setItem("username", props.ownerName);
    localStorage.setItem("pw", pwInput);
    }
    setPwInput("");
    const roster = await bbContract.getRoster(props.ownerName);
    console.log(roster.length);
    props.setRoundsDrafted(roster.length);
    if (props.proposalEvents.length > 0) {
    props.getTradeProposals(id);
    }
    props.setLoginPanelOpen(false);
    props.setShowLoginSuccessNote(true);
    props.setLoggedIn(true);
        setTimeout(() => {
            props.setShowLoginSuccessNote(false);
        }, 6000)
    } catch (e) {
      setWrongPw(true);
      console.error(e);
      console.log('incorrect password');
    }
  }

  return (
    <Transition.Root show={props.loginPanelOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={props.setLoginPanelOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-gray-900 text-blue-200 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="ml-6 text-md font-bold text-blue-200">{(<>
                          {!props.leagueHasStarted ? <div className="inline-flex w-full mt-4 justify-center space-x-0 divide-x-2 divide-x-blue-900">
                        <button onClick={() => props.setLoginSelected(true)} className={classNames(props.loginSelected ? "bg-blue-900 hover:bg-blue-900": "bg-gray-700 hover:bg-blue-700", "relative p-2 w-40 rounded-l-md shadow-2xl border-y-2 border-l-2 border-gray-900 text-blue-200 hover:text-blue-100 focus:outline-none")}>Login</button>
                        <button onClick={() => props.setLoginSelected(false)} className={classNames(!props.loginSelected ? "bg-blue-900 hover:bg-blue-900": "bg-gray-700 hover:bg-blue-700", "relative p-2 w-40 rounded-r-md shadow-2xl border-y-2 border-r-2 border-gray-900 text-blue-200 hover:text-blue-100 focus:outline-none")}>Create Team</button>
                        </div>: ""}</>)}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-gray-700 text-blue-300 hover:text-blue-500 focus:outline-none"
                            onClick={() => props.setLoginPanelOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6 bg-gray-700 rounded-md" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <div className="absolute inset-0 px-4 sm:px-6">
                        <div className="h-full border-2 border-gray-700" aria-hidden="true" />
                      </div>
                      {!loginLoading ? props.loginSelected ? <form onSubmit={handleLoginSubmit}>
                        <div className="grid justify-center">
                        <h3 className="text-blue-200 text-lg font-medium mt-6 shadow-xl">Username/Password</h3>
                        <p className="text-gray-400 text-xs font-medium shadow-xl">username is not case sensitive, but the password is.</p>
                        <input type="text" onChange={e => props.setOwnerName(e.target.value)} value={props.ownerName} placeholder="enter username" className={classNames(usernameCheck && props.ownerName ? "border border-green-400 focus:ring-green-400 focus:ring-offset-green-400": "border border-gray-800", "bg-gray-600 rounded-md relative mt-4 placeholder-blue-400 border hover:bg-gray-700 border-gray-800 placeholder-opacity-75")} />
                        {!pwShow ? <input type="password" placeholder="enter password" onChange={e => handleLoginPwInputChange(e)} value={pwInput} className={classNames(wrongPw ? "border-red-400 focus:ring-red-400 focus:ring-offset-red-400": "border-gray-800", "bg-gray-600 rounded-md relative mt-4 placeholder-blue-400 border hover:bg-gray-700 placeholder-opacity-75")} />:
                        <input type="text" placeholder="choose password" onChange={e => setPwInput(e.target.value)} value={pwInput} className="bg-gray-600 rounded-md relative mt-4 border border-gray-800 placeholder-blue-400 placeholder-opacity-75" />}
                        <p onClick={handlePwShowClick} className="text-xs cursor-pointer z-20 hover:text-white text-right">{pwShow ? "Hide Password": "Show Password"}</p>
                        <div className="inline-flex w-full mt-4 justify-center space-x-2">
                        <button type="submit" className="relative bg-gray-700 p-2 w-40 rounded-md shadow-2xl border border-gray-900 text-blue-200 hover:bg-blue-900 hover:text-blue-100">Login</button>
                        </div>
                        <div className="inline-flex mt-4 justify-center items-center z-20">
                        <input id="remember-me" type="checkbox" onChange={() => setRememberMe(!rememberMe)} checked={rememberMe} className="focus:outline-none cursor-pointer focus:ring-transparent focus:ring-offset-transparent bg-gray-400 text-blue-600" />
                        <label htmlFor="remember-me" className="text-xs ml-1 hover:text-white cursor-pointer">Remember Me</label>
                        </div>
                        </div>
                        </form>:
                        <form onSubmit={handleTeamCreateSubmit}>
                        <div className="grid justify-center">
                        <h3 className="text-blue-200 text-lg font-medium mt-6 shadow-xl">Enter Team Details</h3>
                        <input type="text" onChange={e => props.setTeamName(e.target.value)} value={props.teamName} placeholder="enter team name" className="bg-gray-600 rounded-md relative mt-4 placeholder-blue-400 border hover:bg-gray-500 border-gray-800 w-80 placeholder-opacity-75" />
                        <input type="text" onChange={e => props.setOwnerName(e.target.value)} value={props.ownerName} placeholder="enter username" className={classNames(!usernameCheck && props.ownerName ? "border border-green-400 focus:ring-green-400 focus:ring-offset-green-400": "border border-gray-800", "bg-gray-600 hover:bg-gray-500 rounded-md relative mt-4 placeholder-blue-400 placeholder-opacity-75")} />
                        <h3 className="text-blue-200 text-lg font-medium mt-4 shadow-xl">Choose Password</h3>
                        {!pwShow ? (<><input type="password" placeholder="choose password" onChange={e => setPwInput(e.target.value)} value={pwInput} className="bg-gray-600 rounded-md relative mt-4 placeholder-blue-400 border border-gray-800 hover:bg-gray-500 placeholder-opacity-75" />
                        <input type="password" placeholder="confirm password" onChange={e => handlePwConfirmChange(e)} value={confirmPwInput} className={classNames(!pwConfirmed && pwInput && confirmPwInput ? "border border-red-400 focus:ring-red-400 focus:ring-offset-red-400": "border border-gray-800", "bg-gray-600 hover:bg-gray-500 rounded-md relative mt-4 placeholder-blue-400 placeholder-opacity-75")} /></>):
                        (<><input type="text" placeholder="choose password" onChange={e => setPwInput(e.target.value)} value={pwInput} className="bg-gray-600 hover:bg-gray-700 rounded-md border border-gray-800 relative mt-4 placeholder-blue-400 placeholder-opacity-75" />
                        <input type="text" placeholder="confirm password" onChange={e => handlePwConfirmChange(e)} value={confirmPwInput} className={classNames(!pwConfirmed && pwInput && confirmPwInput ? "border border-red-400 focus:ring-red-400 focus:ring-offset-red-400": "border border-gray-800", "bg-gray-600 rounded-md relative mt-4 hover:bg-gray-500 placeholder-blue-400 placeholder-opacity-75")} /></>)}
                        <p onClick={handlePwShowClick} className="text-xs cursor-pointer z-20 hover:text-white text-right">{pwShow ? "Hide Password": "Show Password"}</p>
                        <div className="inline-flex w-full mt-6 justify-center space-x-2">
                        <button type="submit" className="relative bg-gray-700 p-2 w-56 rounded-md shadow-2xl border border-gray-900 text-blue-200 hover:bg-blue-900 hover:text-blue-100">Create Team</button>
                        </div>
                        </div>
                        </form>: <Loader isBigger={true} />}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
