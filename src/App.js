import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './pages/Navbar';
import TopPerfumes from './pages/TopPerfumes';
import PerfumeDetails from './pages/PerfumeDetails';
import Login from './pages/Login';
import { AuthContext } from './pages/AuthContext';
import Account from "./pages/Account";
import PerfumeCatalog from "./pages/PerfumeCatalog";
import CelebrityPerfumes from './pages/CelebrityPerfumes';

const App = () => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <div>
            {isAuthenticated ? (
                <>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/top" element={<TopPerfumes />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/perfume/:id" element={<PerfumeDetails />} />
                        <Route path="*" element={<Navigate to="/" />} />
                        <Route path="/catalog" element={<PerfumeCatalog />} />
                        <Route path="/celebrities" element={<CelebrityPerfumes />} />
                    </Routes>
                </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            )}
        </div>
    );
};

export default App;
