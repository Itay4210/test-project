import { io } from "socket.io-client";

const socket = io("http://itay:5000");

export default socket;
