import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PerfumeCatalog.css';

const PerfumeCatalog = () => {
    const navigate = useNavigate();
    const [perfumes, setPerfumes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [notes, setNotes] = useState([]);
    const [filters, setFilters] = useState({
        brand: '',
        gender: '',
        name: '',
        selectedNotes: new Set()
    });
    const [showFavoriteNotes, setShowFavoriteNotes] = useState(false);
    const [favoriteNotes, setFavoriteNotes] = useState(new Set());

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/branduri/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setBrands(data);
                } else {
                    console.error('Eroare la preluarea brandurilor:', response.status);
                }
            } catch (error) {
                console.error('Eroare la conectare:', error);
            }
        };

        fetchBrands();
    }, []);

    useEffect(() => {
        const fetchPerfumes = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/perfumes/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched perfumes data:', data);
                    setPerfumes(Array.isArray(data) ? data : []);
                } else {
                    console.error('Eroare la preluarea parfumurilor:', response.status);
                }
            } catch (error) {
                console.error('Eroare la conectare:', error);
            }
        };

        fetchPerfumes();
    }, []);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/note/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setNotes(data);
                } else {
                    console.error('Eroare la preluarea notelor:', response.status);
                }
            } catch (error) {
                console.error('Eroare la conectare:', error);
            }
        };

        fetchNotes();
    }, []);

    useEffect(() => {
        const fetchFavoriteNotes = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/notes/favorites/', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setFavoriteNotes(new Set(data.map(note => note.noteID)));
                }
            } catch (error) {
                console.error('Error fetching favorite notes:', error);
            }
        };

        fetchFavoriteNotes();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'selectedNotes') {
            const options = e.target.options;
            const selectedValues = [];
            for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                    selectedValues.push(options[i].value);
                }
            }
            setFilters(prev => ({
                ...prev,
                selectedNotes: new Set(selectedValues)
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleNoteToggle = (noteId) => {
        setFilters(prev => {
            const newSelectedNotes = new Set(prev.selectedNotes);
            if (newSelectedNotes.has(noteId)) {
                newSelectedNotes.delete(noteId);
            } else {
                newSelectedNotes.add(noteId);
            }
            return {
                ...prev,
                selectedNotes: newSelectedNotes
            };
        });
    };

    const handleFavoriteNotesToggle = () => {
        setShowFavoriteNotes(!showFavoriteNotes);
    };

    const filteredPerfumes = perfumes.filter(perfume => {
        const matchesName = !filters.name || 
            perfume.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesBrand = !filters.brand || perfume.brand === filters.brand;
        const matchesGender = !filters.gender || perfume.gender === filters.gender;
        
        const matchesNotes = filters.selectedNotes.size === 0 || 
            Array.from(filters.selectedNotes).every(noteId => 
                perfume.base_notes.some(note => note.noteID.toString() === noteId) ||
                perfume.middle_notes.some(note => note.noteID.toString() === noteId) ||
                perfume.top_notes.some(note => note.noteID.toString() === noteId)
            );

        const matchesFavoriteNotes = !showFavoriteNotes || 
            Array.from(favoriteNotes).some(noteId => 
                perfume.base_notes.some(note => note.noteID === noteId) ||
                perfume.middle_notes.some(note => note.noteID === noteId) ||
                perfume.top_notes.some(note => note.noteID === noteId)
            );

        return matchesName && matchesBrand && matchesGender && matchesNotes && matchesFavoriteNotes;
    });

    const renderPerfumeCard = (perfume) => {
        console.log(`Perfume Image URL: http://127.0.0.1:8000${perfume.image}`);

        return (
            <div 
                key={perfume.perfumeID} 
                className="perfume-card"
                onClick={() => navigate(`/perfume/${perfume.perfumeID}`)}
            >
                <div className="perfume-image-container">
                    <img src={`http://127.0.0.1:8000${perfume.image}`} alt={perfume.name} />
                </div>
                <div className="perfume-info">
                    <h3>{perfume.name}</h3>
                    <p className="brand">{perfume.brand}</p>
                    <p className="rating">Rating: {perfume.avg_rating ? perfume.avg_rating.toFixed(2) : 'N/A'}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="catalog-container">
            <h1 className="catalog-title">Catalog Parfumuri</h1>
            
            <div className="catalog-filters">
                <input
                    type="text"
                    name="name"
                    placeholder="Caută după nume"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className="catalog-search"
                />

                <select
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                >
                    <option value="">Toate brandurile</option>
                    {brands.map(brand => (
                        <option key={brand.brandID} value={brand.name}>
                            {brand.name}
                        </option>
                    ))}
                </select>

                <select
                    name="gender"
                    value={filters.gender}
                    onChange={handleFilterChange}
                >
                    <option value="">Toate</option>
                    <option value="M">Masculin</option>
                    <option value="F">Feminin</option>
                    <option value="U">Unisex</option>
                </select>

                <div className="notes-dropdown">
                    <button className="notes-button">Filtrează după note</button>
                    <div className="notes-filter-container">
                        <div className="catalog-notes-grid">
                            {notes.map(note => (
                                <label key={note.noteID} className="catalog-note-item">
                                    <input
                                        type="checkbox"
                                        checked={filters.selectedNotes.has(note.noteID.toString())}
                                        onChange={() => handleNoteToggle(note.noteID.toString())}
                                    />
                                    <span className="catalog-note-text">{note.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    className={`favorite-notes-btn ${showFavoriteNotes ? 'active' : ''}`}
                    onClick={handleFavoriteNotesToggle}
                >
                    Parfumuri cu notele preferate
                </button>
            </div>

            <ul className="catalog-grid">
                {filteredPerfumes.map((perfume) => (
                    <li 
                        key={perfume.perfumeID} 
                        className="catalog-item"
                        data-perfume-name={perfume.name}
                    >
                        <Link to={`/perfume/${perfume.perfumeID}`}>
                            <img
                                src={`http://127.0.0.1:8000${perfume.image}`}
                                alt={perfume.name}
                                className="catalog-image"
                            />
                            <h2 className="catalog-name">{perfume.name}</h2>
                            <p className="catalog-rating">
                                Rating: {perfume.avg_rating ? perfume.avg_rating.toFixed(2) : 'N/A'}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PerfumeCatalog;
