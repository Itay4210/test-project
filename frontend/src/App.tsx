import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JoinGame from "./components/JoinGame";
import GameBoard from "./components/GameBoard";
import './App.css';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<JoinGame />} />
                <Route path="/game/:gameId" element={<GameBoard />} />
            </Routes>
        </Router>
    );
};

export default App;
