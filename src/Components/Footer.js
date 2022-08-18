export default function Footer() {
    return (
      <footer className="bg-[#090432]">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
              <a key="discord" href="https://discord.gg/n5xvSsuX" className="text-gray-600 hover:text-gray-700 inline-flex" target="_blank">
                <span className="sr-only">discord</span>
                <p className="text-gray-600 hover:text-gray-700 mr-4">discord</p>
                <img src={require('../media_files/discord-logo-2.png')} className="h-6 w-6" aria-hidden="true" />
              </a>
              <a key="mlb" href="https://mlb.com" className="text-gray-600 hover:text-gray-700 inline-flex" target="_blank">
                <span className="sr-only">mlb</span>
                <p className="text-gray-600 hover:text-gray-700 mr-4">mlb.com</p>
                <img src={require('../media_files/team_logos/mlb-logo-2.png')} className="h-6 w-10" aria-hidden="true" />
              </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-600">&copy; 2022 Fantasy Baseball Sprint Version 1 - Created by Greg Andersson - Philadelphia, PA</p>
          </div>
        </div>
      </footer>
    )
  }