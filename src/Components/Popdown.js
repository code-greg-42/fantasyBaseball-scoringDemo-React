import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

const pages = [
    {
    name: 'League Leaderboard',
    url: 'league_leaderboard',  
    },
    {
    name: 'Player Leaderboards',
    url: 'player_leaderboards',
    },
    {
    name: 'Team Rosters',
    url: 'team_rosters',
    },
    {
    name: 'Draft a Team',
    url: 'draft_team',
    },
    {
    name: 'Trading Post',
    url: 'trading_post',
    },
    {
    name: 'Daily Homers',
    url: 'daily_homers',
    }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Popdown(props) {

  function disableButton(page) {
    // function to disable buttons while any of the following conditions are met
    let counter = 0;
    if (page === 'Trading Post') {
      if (!props.loggedIn) {
        counter++;
      };
      if (!props.leagueHasStarted) {
        counter++
      };
      };
     if (page === 'Draft a Team') {
      if (props.leagueHasStarted) {
        counter++;
      }
      if (!props.loggedIn) {
        counter++;
      }
    };
    if (counter > 0) {
      return true;
    } else {
      return false;
    }
  }

  const linkIndex = pages.findIndex(page => page.name === props.navSelect);

  function handleSelectClick(page) {
        if (!disableButton(page)) {
      props.setNavSelect(page);
        }
    }

  if (props.isSmall) {
    pages.forEach(page => {
      let smallName = page.name.split(" ");
      page.smallName = smallName[0];
    })
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              open ? 'text-white' : 'text-blue-200',
              'group bg-transparent rounded-md inline-flex items-center text-xl font-bold hover:text-white focus:outline-none'
            )}
          >
            <img src={require(`../media_files/nav_icons/${pages[linkIndex].url}.png`)} className="flex-shrink-0 h-6 w-6" aria-hidden="true" />
            <span className="ml-1">{props.isSmall ? pages[linkIndex].smallName: pages[linkIndex].name}</span>
            <ChevronDownIcon
              className={classNames(open ? 'text-gray-100' : 'text-gray-400', 'ml-1 h-5 w-5 group-hover:text-blue-300')}
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 left-24 transform -translate-x-1/2 mt-2 w-sm max-w-md">
              <div className="rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className={props.isSmall ? "relative grid gap-6 bg-gray-800 pt-7 pb-3 pl-7 pr-8 sm:gap-8 sm:pt-7 sm:pb-3 sm:pl-7 sm:pr-8": "relative grid gap-6 bg-gray-600 pt-7 pb-3 pl-7 pr-8 sm:gap-8 sm:pt-7 sm:pb-3 sm:pl-7 sm:pr-8"}>
                  {pages.map((page, index) => (
                    index === linkIndex ? "":
                    <a
                      key={page.name}
                      onClick={() => handleSelectClick(page.name)}
                      className={props.isSmall ? "-m-2 mr-1 w-20 h-10 flex items-start rounded-lg transition ease-in-out duration-150": "-m-5 flex items-start rounded-lg transition ease-in-out duration-150"}
                    >
                      <img src={require(`../media_files/nav_icons/${page.url}.png`)} className="flex-shrink-0 h-6 w-6" aria-hidden="true" />
                      <div className="ml-1">
                        <p className={classNames(disableButton(page.name) === true ? "text-gray-500 pointer-events-none": "text-gray-200","text-base font-medium cursor-pointer text-gray-200 hover:text-blue-300")}>{props.isSmall ? page.smallName: page.name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
