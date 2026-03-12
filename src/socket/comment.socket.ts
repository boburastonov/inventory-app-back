import { Server } from "socket.io";

export function setupCommentSocket(io: Server) {
  io.on("connection", (socket) => {
    socket.on("joinInventory", (inventoryId: string) => {
      socket.join(`inventory:${inventoryId}`);
    });

    socket.on("leaveInventory", (inventoryId: string) => {
      socket.leave(`inventory:${inventoryId}`);
    });
  });
}
