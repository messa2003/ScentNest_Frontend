import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        profile: {
            favoritePerfumes: [],
            favoriteNotes: []
        }
    });
    const [favoritePerfumes, setFavoritePerfumes] = useState([]);
    const [favoriteNotes, setFavoriteNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user data
                const userResponse = await fetch('http://127.0.0.1:8000/api/users/me/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await userResponse.json();
                setUserData(userData);

                // Fetch favorite perfumes details
                const perfumesResponse = await fetch('http://127.0.0.1:8000/api/perfumes/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                const allPerfumes = await perfumesResponse.json();
                const userFavorites = allPerfumes.filter(perfume => 
                    userData.profile.favoritePerfumes.includes(perfume.perfumeID)
                );
                setFavoritePerfumes(userFavorites);

                // Fetch favorite notes
                const notesResponse = await fetch('http://127.0.0.1:8000/api/notes/favorites/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                const notesData = await notesResponse.json();
                setFavoriteNotes(notesData);

            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="account-loading">Se încarcă...</div>;
    if (error) return <div className="account-error">Eroare: {error}</div>;

    return (
        <div className="account-container">
            <h1 className="account-title">Contul Meu</h1>
            
            <div className="account-info">
                <p><strong>Username:</strong> {userData.username}</p>
                <p><strong>Email:</strong> {userData.email}</p>
            </div>

            <div className="account-favorites-section">
                <h2>Parfumuri Favorite</h2>
                <div className="account-favorites-grid">
                    {favoritePerfumes.map(perfume => (
                        <div key={perfume.perfumeID} 
                             className="account-favorite-item" 
                             onClick={() => navigate(`/perfume/${perfume.perfumeID}`)}>
                            <div className="account-favorite-image-container">
                                <img 
                                    src={`http://127.0.0.1:8000${perfume.image}`} 
                                    alt={perfume.name}
                                />
                            </div>
                            <p className="account-favorite-name">{perfume.name}</p>
                            <p className="account-favorite-brand">{perfume.brand}</p>
                        </div>
                    ))}
                    {favoritePerfumes.length === 0 && (
                        <p className="account-no-favorites">Nu ai parfumuri favorite încă</p>
                    )}
                </div>
            </div>

            <div className="account-favorites-section">
                <h2>Note Favorite</h2>
                <div className="account-favorites-grid">
                    {favoriteNotes.map(note => (
                        <div key={note.noteID} className="account-favorite-item">
                            <div className="account-favorite-image-container">
                                <img 
                                    src={`http://127.0.0.1:8000${note.image}`} 
                                    alt={note.name}
                                />
                            </div>
                            <p className="account-favorite-name">{note.name}</p>
                        </div>
                    ))}
                    {favoriteNotes.length === 0 && (
                        <p className="account-no-favorites">Nu ai note favorite încă</p>
                    )}
                </div>
            </div>

            <button className="account-logout-btn" onClick={handleLogout}>
                Deconectare
            </button>
        </div>
    );
};

export default Account;
