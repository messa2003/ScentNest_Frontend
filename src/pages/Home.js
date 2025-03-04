import React from 'react';
import './Home.css';
import backgroundImage from '../assets/kilian-french.jpg';
import {Link, useNavigate} from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        console.log("Navigating to /catalog");
        navigate('/catalog');
    };

    return (
        <div className="home-container">
            <header className="home-header">
                {}
            </header>

            <main
                className="hero"
                style={{backgroundImage: `url(${backgroundImage})`}}
            >
                <h1>Descoperă magia aromelor unice cu Scent Nest!</h1>
                <p>
                    Explorează universul parfumurilor rafinate și găsește esența care te reprezintă.
                    De la note dulci și florale, până la accente intense și lemnoase, Scent Nest te
                    ajută să găsești parfumul perfect pentru orice ocazie.
                </p>
                <button onClick={handleNavigate} className="explore-button">
                    Începe călătoria olfactivă
                </button>
            </main>
        </div>
    );
};

export default Home;
