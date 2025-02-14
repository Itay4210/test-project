import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./../hooks/socket";
import {Button, Input, Typography } from "antd";
import { notification } from "antd";
const { Title, Text } = Typography;

const JoinGame: React.FC = () => {
    const [gameId, setGameId] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleCreateGame = () => {
        const newGameId = Math.random().toString(36).substr(2, 6);
        setGameId(newGameId);
        socket.emit("joinGame", newGameId);
        navigate(`/game/${newGameId}`);
    };

    const handleJoinGame = () => {
        if (gameId.trim()) {
            socket.emit("joinGame", gameId);
            navigate(`/game/${gameId}`);
        }
    };

    const handleCopyGameId = () => {
        navigator.clipboard.writeText(gameId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    socket.on("gameJoined", (data: { gameId: string }) => {
        setGameId(data.gameId);
        setError("");
    });

    socket.on("error", (msg: string) => {
        setError(msg);
    });
 

    useEffect(() => {
        socket.on("error", (message: string) => {
            if (message === "המשחק כבר מלא!") {
                notification.error({
                    message: "שגיאה",
                    description: "המשחק כבר מלא! לא ניתן להצטרף.",
                    placement: "topRight",
                });
                navigate("/"); // ✅ מחזיר לדף הראשי
            }
        });
    
        return () => {
            socket.off("error");
        };
    }, []);

    
   
   return (
        <div  style={{ 
            maxWidth: 400, 
            margin: "auto", 
            textAlign: "center", 
            padding: 20, 
            border: "1px solid #ccc", 
            borderRadius: 8, 
            backgroundColor: "white", 
            position: "absolute", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)" 
        }}>
            <h2>🎮 טיק-טק-טו אונליין</h2>
            <Button type="primary" onClick={handleCreateGame} block>
                🎮 צור משחק חדש
            </Button>

          

            <Input
                placeholder="🔑 הכנס מזהה משחק"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                style={{ marginTop: 20 }}
            />
            <Button type="primary" onClick={handleJoinGame} block style={{ marginTop: 10 }}>
                🚀 הצטרף למשחק
            </Button>

            {error && <Text type="danger">{error}</Text>}
        </div>
    );
};

export default JoinGame;

