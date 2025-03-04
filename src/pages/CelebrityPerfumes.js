import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CelebrityPerfumes.css';

const CelebrityPerfumes = () => {
    const [celebrities, setCelebrities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCelebrities = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/celebrities/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCelebrities(data);
                }
            } catch (error) {
                console.error('Error fetching celebrities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCelebrities();
    }, []);

    if (loading) return <div className="loading">Se încarcă...</div>;

    return (
        <div className="celebrity-container">
            <h1 className="celebrity-title">Parfumurile Celebrităților</h1>
            
            <div className="celebrity-grid">
                {celebrities.map(celebrity => (
                    <div key={celebrity.celebrityID} className="celebrity-card">
                        <div className="celebrity-image-container">
                            <img
                                src={celebrity.image}
                                alt={celebrity.name}
                                className="celebrity-image"
                            />
                        </div>
                        <div className="celebrity-info">
                            <div className="celebrity-text">
                                <h2 className="celebrity-name">{celebrity.name}</h2>
                                <p className="celebrity-occupation">{celebrity.occupation}</p>
                                <p className="celebrity-description">{celebrity.description}</p>
                            </div>
                            
                            <div className="celebrity-perfumes">
                                <div className="perfume-list">
                                    {celebrity.perfumes.map(perfume => (
                                        <div 
                                            key={perfume.perfumeID} 
                                            className="celebrity-perfume-item"
                                            onClick={() => navigate(`/perfume/${perfume.perfumeID}`)}
                                        >
                                            <img 
                                                src={perfume.image}
                                                alt={perfume.name} 
                                            />
                                            <p>{perfume.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CelebrityPerfumes; 