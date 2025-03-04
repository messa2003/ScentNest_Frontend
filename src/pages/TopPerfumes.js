import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TopPerfumes.css';

const TopPerfumes = () => {
    const [perfumes, setPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerfumes = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/perfumes/popular/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Eroare la preluarea parfumurilor.');
                }
                const data = await response.json();
                setPerfumes(Array.isArray(data) ? data : []); // Asigură-te că `data` este o listă
            } catch (error) {
                console.error('Error fetching perfumes:', error);
                setError('Nu s-au putut prelua parfumurile.');
            } finally {
                setLoading(false);
            }
        };

        fetchPerfumes();
    }, []);

    if (loading) {
        return <p>Se încarcă parfumurile...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!perfumes.length) {
        return <p className="no-perfumes-message">Momentan nu există parfumuri disponibile.</p>;
    }

    return (
        <div className="top-perfumes-container">
            <h1 className="top-perfumes-title">Top Parfumuri</h1>
            <ul className="perfumes-list">
                {perfumes.map((perfume) => (
                    <li 
                        key={perfume.perfumeID} 
                        className="perfume-card"
                        data-perfume-name={perfume.name}
                    >
                        <Link to={`/perfume/${perfume.perfumeID}`}>
                            <img
                                src={`http://127.0.0.1:8000${perfume.image}`}
                                alt={perfume.name}
                                className="perfume-image"
                            />
                            <h2 className="perfume-name">{perfume.name}</h2>
                            <p className="perfume-rating">
                                Rating: {perfume.avg_rating ? perfume.avg_rating.toFixed(2) : 'N/A'}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopPerfumes;
