import { Link } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';

import '../css/nav.css'

export function Nav() {
    const { contextTheme } = useThemeContext();
    return (
        <>
          <div className={`${contextTheme} nav`}>
                <div className="imgContNav"><Link className="white hover" to="/games"><div className="logo"></div></Link></div>
                <div className="imgContNav"><Link className="white hover" to="/editProfile"><div className="logoSettings"></div></Link></div>
                <div className="imgContNav"><Link className="white hover" to="/profile"><div className="logoProfile"></div></Link></div>
                <div className="imgContNav"><Link className="white hover" to="/inbox"><div className="logoInbox"></div></Link></div>
            </div>
            <div className={`${contextTheme} navHolder`} />
        </>
    );
} 