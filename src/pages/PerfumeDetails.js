import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PerfumeDetails.css';

const PerfumeDetails = () => {
    const { id } = useParams();
    const [perfume, setPerfume] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteNotes, setFavoriteNotes] = useState(new Set());
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        comment: '',
        rating: 5
    });
    const [userReview, setUserReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Move fetchPerfumeDetails outside useEffect
    const fetchPerfumeDetails = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/perfumes/${id}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPerfume(data);
            } else {
                console.error('Error fetching perfume details:', response.status);
            }
        } catch (error) {
            console.error('Error fetching perfume details:', error);
        }
    };

    useEffect(() => {
        fetchPerfumeDetails();
    }, [id]);

    // Fetch favorite status
    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/perfumes/${id}/is-favorite/`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsFavorite(data.is_favorite);
                } else {
                    console.error('Error fetching favorite status:', response.status);
                }
            } catch (error) {
                console.error('Error fetching favorite status:', error);
            }
        };

        fetchFavoriteStatus();
    }, [id]);

    // Toggle favorite status
    const handleToggleFavorite = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/perfumes/${id}/toggle-favorite/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsFavorite(!isFavorite);
                alert(data.message);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'An error occurred.');
            }
        } catch (error) {
            console.error('Error connecting to the server:', error);
            alert('Error connecting to the server.');
        }
    };

    // Add this useEffect to fetch favorite notes status
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

    // Update handleNoteFavorite function
    const handleNoteFavorite = async (noteId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/notes/${noteId}/toggle-favorite/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                setFavoriteNotes(prev => {
                    const newFavorites = new Set(prev);
                    if (newFavorites.has(noteId)) {
                        newFavorites.delete(noteId);
                    } else {
                        newFavorites.add(noteId);
                    }
                    return newFavorites;
                });
                const data = await response.json();
                console.log(data.message);
            }
        } catch (error) {
            console.error('Error toggling favorite note:', error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const reviewData = {
                reviewTitle: formData.title,
                reviewComment: formData.comment,
                rating: parseFloat(formData.rating),
                perfume: parseInt(id)
            };

            const url = isEditing 
                ? `http://127.0.0.1:8000/api/reviews/${userReview.reviewID}/`
                : `http://127.0.0.1:8000/api/perfumes/${id}/reviews/`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(reviewData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit review');
            }

            await fetchPerfumeDetails();
            setShowReviewForm(false);
            setFormData({ title: '', comment: '', rating: 5 });
            setIsEditing(false);
            setUserReview(null);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.message || 'A apărut o eroare la adăugarea recenziei.');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Ești sigur că vrei să ștergi această recenzie?')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/reviews/${reviewId}/`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (response.ok) {
                    fetchPerfumeDetails();
                }
            } catch (error) {
                console.error('Error deleting review:', error);
            }
        }
    };

    const handleEditReview = async (review) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/reviews/${review.reviewID}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    reviewTitle: formData.title,
                    reviewComment: formData.comment,
                    rating: parseFloat(formData.rating),
                    perfume: parseInt(id)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update review');
            }

            await fetchPerfumeDetails();
            setShowReviewForm(false);
            setFormData({ title: '', comment: '', rating: 5 });
            setIsEditing(false);
            setUserReview(null);
        } catch (error) {
            console.error('Error updating review:', error);
            alert(error.message || 'A apărut o eroare la actualizarea recenziei.');
        }
    };

    // Add this function to sort reviews
    const sortReviews = (reviews) => {
        const username = localStorage.getItem('username');
        console.log('Sorting reviews. Current username:', username);
        
        return reviews.sort((a, b) => {
            const aIsUser = a.user.username === username;
            const bIsUser = b.user.username === username;
            
            if (aIsUser && !bIsUser) return -1;
            if (!aIsUser && bIsUser) return 1;
            return b.reviewID - a.reviewID;
        });
    };

    useEffect(() => {
        // Debug log for username
        console.log('Username in localStorage:', localStorage.getItem('username'));
    }, []);

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            console.warn('No username found in localStorage');
            // Optionally redirect to login
            // navigate('/login');
        } else {
            console.log('Logged in as:', username);
        }
    }, []);

    const isUserReview = (review) => {
        const username = localStorage.getItem('username');
        console.log({
            storedUsername: username,
            reviewUsername: review.user.username,
            isMatch: username === review.user.username,
            review: review
        });
        return review.user.username === username;
    };

    useEffect(() => {
        const verifyUsername = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    // Update username in localStorage if it doesn't match
                    if (localStorage.getItem('username') !== userData.username) {
                        localStorage.setItem('username', userData.username);
                        console.log('Updated username in localStorage:', userData.username);
                    }
                }
            } catch (error) {
                console.error('Error verifying username:', error);
            }
        };

        verifyUsername();
    }, []);

    if (!perfume) {
        return <p>Loading...</p>;
    }

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const partialStarPercentage = (rating - fullStars) * 100;

        for (let i = 0; i < 10; i++) {
            if (i < fullStars) {
                stars.push(<div key={i} className="star filled"></div>);
            } else if (i === fullStars) {
                stars.push(
                    <div
                        key={i}
                        className="star partial"
                        style={{
                            background: `linear-gradient(to right, #ffd700 ${partialStarPercentage}%, #ccc ${partialStarPercentage}%)`,
                        }}
                    ></div>
                );
            } else {
                stars.push(<div key={i} className="star"></div>);
            }
        }
        return stars;
    };

    return (
        <div className="perfume-details-container">
            <div className="perfume-image-container">
                <img
                    src={`http://127.0.0.1:8000${perfume.image}`}
                    alt={perfume.name}
                    className="perfume-details-image"
                />
                <div className="star-container">{renderStars(perfume.avg_rating)}</div>
                <p className="perfume-details-rating">
                    Rating: {perfume.avg_rating ? perfume.avg_rating.toFixed(2) : 'N/A'}
                </p>
                <button
                    className="btn-favorite"
                    onClick={handleToggleFavorite}
                    style={{
                        backgroundColor: isFavorite ? 'orange' : 'gray',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                    }}
                >
                    {isFavorite ? 'Șterge din favorite' : 'Adaugă la favorite'}
                </button>
            </div>
            <div className="perfume-details-text">
                <h1 className="perfume-title">{perfume.name}</h1>
                <p className="perfume-brand">By {perfume.brand}</p>
                <div className="perfume-info-grid">
                    <p className="perfume-price">
                        Preț recomandat: {perfume.recommended_price ? `${perfume.recommended_price} RON` : 'Indisponibil'}
                    </p>
                    <p className="perfume-concentration">
                        Concentrație: {perfume.concentration || 'Indisponibil'}
                    </p>
                    <p className="perfume-quantity">
                        Cantitate: {perfume.quantity || 'Indisponibil'}
                    </p>
                </div>
                <p className="perfume-description">{perfume.description}</p>
            </div>
            <div className="notes-section">
                <h2 className="notes-title">NOTE DE VÂRF</h2>
                <div className="notes-grid">
                    {perfume.top_notes?.map((note) => (
                        <div key={note.noteID} className="note-item">
                            <div className="note-image-container">
                                <img src={`http://127.0.0.1:8000${note.image}`} alt={note.name} />
                                <button 
                                    className={`note-favorite-btn ${favoriteNotes.has(note.noteID) ? 'favorite' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNoteFavorite(note.noteID);
                                    }}
                                >
                                    ♥
                                </button>
                            </div>
                            <p className="note-name">{note.name}</p>
                        </div>
                    ))}
                </div>
                <h2 className="notes-title">NOTE DE MIJLOC</h2>
                <div className="notes-grid">
                    {perfume.middle_notes?.map((note) => (
                        <div key={note.noteID} className="note-item">
                            <div className="note-image-container">
                                <img src={`http://127.0.0.1:8000${note.image}`} alt={note.name} />
                                <button 
                                    className={`note-favorite-btn ${favoriteNotes.has(note.noteID) ? 'favorite' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNoteFavorite(note.noteID);
                                    }}
                                >
                                    ♥
                                </button>
                            </div>
                            <p className="note-name">{note.name}</p>
                        </div>
                    ))}
                </div>
                <h2 className="notes-title">NOTE DE BAZĂ</h2>
                <div className="notes-grid">
                    {perfume.base_notes?.map((note) => (
                        <div key={note.noteID} className="note-item">
                            <div className="note-image-container">
                                <img src={`http://127.0.0.1:8000${note.image}`} alt={note.name} />
                                <button 
                                    className={`note-favorite-btn ${favoriteNotes.has(note.noteID) ? 'favorite' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNoteFavorite(note.noteID);
                                    }}
                                >
                                    ♥
                                </button>
                            </div>
                            <p className="note-name">{note.name}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="review-form-section">
                {!showReviewForm ? (
                    <button 
                        className="add-review-btn"
                        onClick={() => setShowReviewForm(true)}
                    >
                        Adaugă o recenzie
                    </button>
                ) : (
                    <form onSubmit={handleReviewSubmit} className="review-form">
                        <h3>{isEditing ? 'Editează recenzia' : 'Adaugă o recenzie'}</h3>
                        <div className="form-group">
                            <label>Titlu:</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Comentariu:</label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Rating (1-10):</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                step="0.5"
                                value={formData.rating}
                                onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                                required
                            />
                        </div>
                        <div className="form-buttons">
                            <button type="submit">
                                {isEditing ? 'Salvează modificările' : 'Adaugă recenzia'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setShowReviewForm(false);
                                    setIsEditing(false);
                                    setFormData({ title: '', comment: '', rating: 5 });
                                }}
                            >
                                Anulează
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <div className="reviews-section">
                <h2 className="reviews-title">Recenzii</h2>
                {perfume.reviews?.length > 0 ? (
                    sortReviews([...perfume.reviews]).map((review) => {
                        const userReview = isUserReview(review);
                        return (
                            <div key={review.reviewID} className={`review-item ${userReview ? 'user-review' : ''}`}>
                                <div className="review-header">
                                    <p className="review-user">
                                        {userReview ? 'Recenzia ta' : review.user.username}
                                    </p>
                                </div>
                                <p className="review-title">{review.reviewTitle}</p>
                                <p className="review-comment">{review.reviewComment}</p>
                                <p className="review-rating">Rating: {review.rating}</p>
                                {userReview && (
                                    <div className="review-actions">
                                        <button 
                                            className="edit-review-btn"
                                            onClick={() => {
                                                setUserReview(review);
                                                setFormData({
                                                    title: review.reviewTitle,
                                                    comment: review.reviewComment,
                                                    rating: review.rating
                                                });
                                                setIsEditing(true);
                                                setShowReviewForm(true);
                                            }}
                                        >
                                            Editează
                                        </button>
                                        <button 
                                            className="delete-review-btn"
                                            onClick={() => handleDeleteReview(review.reviewID)}
                                        >
                                            Șterge
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="no-reviews">Nu există review-uri pentru acest parfum.</p>
                )}
            </div>
        </div>
    );
};

export default PerfumeDetails;
