import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <header className="home-header">
            <div className="logo">Scent Nest</div>
            <nav className="navbar">
                <ul>
                    <li><Link to="/">Acasă</Link></li>
                    <li><Link to="/top">Top Parfumuri</Link></li>
                    <li><Link to="/celebrities" className="nav-link">Parfumuri Celebrități</Link></li>
                    <li><Link to="/account">Contul Meu</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;
