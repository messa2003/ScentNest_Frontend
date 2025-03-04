import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Login.css';


const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false); // Controlează dacă utilizatorul vrea să creeze un cont
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Câmp pentru confirmarea parolei
    const [email, setEmail] = useState(''); // Doar pentru înregistrare
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.access, data.refresh);
                navigate('/'); // Redirecționează utilizatorul către Home
            } else {
                setError('Autentificare eșuată. Verifică username-ul și parola.');
            }
        } catch (error) {
            setError('Eroare la conectare.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Parolele nu se potrivesc.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                alert('Cont creat cu succes! Acum te poți autentifica.');
                setIsRegistering(false); // Revin-o la pagina de logare
            } else {
                setError('Înregistrare eșuată. Verifică datele introduse.');
            }
        } catch (error) {
            setError('Eroare la conectare.');
        }
    };

    return (
        <div className="login-register-container">
            <div className="site-title">
                <h1>Scent Nest</h1>
            </div>
            <div className="form-container">
                <h1>{isRegistering ? 'Creare cont' : 'Autentificare'}</h1>
                {isRegistering ? (
                    <form onSubmit={handleRegister} className="form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Introduceți username-ul"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Introduceți email-ul"
                            />
                        </div>
                        <div className="form-group">
                            <label>Parola</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Introduceți parola"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirmă parola</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirmă parola"
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        <button type="submit" className="btn-primary">
                            Creează cont
                        </button>
                        <p>
                            Ai deja un cont?{' '}
                            <span
                                onClick={() => setIsRegistering(false)}
                                className="toggle-form"
                            >
                                Autentifică-te
                            </span>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Introduceți username-ul"
                            />
                        </div>
                        <div className="form-group">
                            <label>Parola</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Introduceți parola"
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        <button type="submit" className="btn-primary">
                            Autentificare
                        </button>
                        <p>
                            Nu ai cont?{' '}
                            <span
                                onClick={() => setIsRegistering(true)}
                                className="toggle-form"
                            >
                                Creează cont
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
