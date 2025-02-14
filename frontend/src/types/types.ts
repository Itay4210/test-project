export interface GameState {
    board: (string | null)[];
    turn: "X" | "O";
    winner?: "X" | "O" | "TIE";
}

export interface GameJoinedResponse {
    gameId: string;
    symbol: "X" | "O";
    board: (string | null)[];
}
