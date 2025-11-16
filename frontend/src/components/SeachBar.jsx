import {HiOutlineSearch} from 'react-icons/hi';

const SeachBar = () => {
  return (
    <div>
        <label className="input">
        {/* <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
            >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
            </g>
        </svg> */}
        <HiOutlineSearch className='h-5 w-5 opacity-50'/>
        <input type="search" className="grow" placeholder="Recherhe..." />
        </label>
         {/* <select defaultValue="Color scheme" className="select select-accent">
                      <option disabled={true}>Color scheme</option>
                      <option>Light mode</option>
                      <option>Dark mode</option>
                      <option>System</option>
          </select> */}
    </div>
  )
}

export default SeachBar