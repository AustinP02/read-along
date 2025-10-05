import './navbar.css'
import {Link} from "react-router-dom"
import logo from './assets/read-along-logo.png'


function NavBar() {

    return (
        <nav className="nav">
            <Link to="/"><img className='logo' src={logo} alt="Read Along logo"/></Link>
            <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
            </ul>
        </nav>
    );
}

export default NavBar;