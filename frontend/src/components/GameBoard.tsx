import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "./../hooks/socket";
import { GameState, GameJoinedResponse } from "./../types/types";
import styles from "./GameBoard.module.css";
import { useNavigate } from "react-router-dom";
import { Button,Typography} from 'antd';

const { Title, Text } = Typography;

const GameBoard: React.FC = () => {
    const navigate = useNavigate();
    const { gameId } = useParams<{ gameId?: string }>();
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
    const [turn, setTurn] = useState<"X" | "O">("X");
    const [winner, setWinner] = useState<"X" | "O" | "TIE" | null>(null);
    const [isJoined, setIsJoined] = useState<boolean>(false);

    useEffect(() => {
        if (!gameId || isJoined) return; 

        console.log(`📡 שולח בקשת הצטרפות לשרת עם Game ID: ${gameId}`);
        socket.emit("joinGame", gameId);

        const handleGameJoined = (data: GameJoinedResponse) => {
            console.log(`✅ קיבלת סימון מהשרת: ${data.symbol}`);
            setPlayerSymbol(data.symbol);
            setBoard(data.board);
            setIsJoined(true); 
        };

        socket.on("gameJoined", handleGameJoined);
        socket.on("updateBoard", (data: GameState) => {
            console.log(`🔄 עדכון לוח: ${data.board}`);
            setBoard(data.board);
            setTurn(data.turn);
        });

        socket.on("gameOver", (data: { winner: "X" | "O" | "TIE" }) => {
            console.log(`🏆 סיום משחק - המנצח: ${data.winner}`);
            setWinner(data.winner);
        });

        return () => {
            socket.off("gameJoined", handleGameJoined);
            socket.off("updateBoard");
            socket.off("gameOver");
        };
    }, [gameId]); 

    useEffect(() => {
        console.log(`🟢 playerSymbol עודכן: ${playerSymbol}`);
    }, [playerSymbol]);

    const handleMove = (index: number) => {
        if (board[index] === null && turn === playerSymbol && winner === null) {
            console.log(`🕹️ שליחת מהלך: ${playerSymbol} -> משבצת ${index}`);
            socket.emit("makeMove", { gameId, index, symbol: playerSymbol });
        }
    };

    return (
        <>
         <Button
                onClick={() => navigate("/")} 
                style={{ 
                    position: "absolute", 
                    top: 10, 
                    right: 10, 
                    padding: "5px 10px", 
                    backgroundColor: "#007bff", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "5px", 
                    cursor: "pointer" 
                }}
            >Log out</Button>
        <div style={{ 
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
              {gameId && (
                <div style={{ marginTop: 20 }}>
                    <Text strong>🔢 מזהה המשחק שלך:</Text>
                    <Title level={4} style={{ margin: "10px 0" }}>{gameId}</Title>
                    
                   
                </div>
            )}
            <h3>{winner ? (winner === "TIE" ? "תיקו!" : `המנצח הוא: ${winner}`) : turn === playerSymbol ? "🔵 תורך!" : "🕓 מחכה ליריב..."}</h3>

            <div className={styles.board}>
                {board.map((cell, index) => (
                    <div key={index} className={`${styles.cell} ${cell ? styles.occupied : ""}`} onClick={() => handleMove(index)}>
                        {cell}
                    </div>
                ))}
            </div>
        </div>
        </>
    );
};

export default GameBoard;
