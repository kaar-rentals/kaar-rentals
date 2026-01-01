let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    return io;
  },
  setIO: (socketIO) => {
    io = socketIO;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  notifyListingEvent: (type, listing) => {
    if (!io) {
      console.warn('Socket.io not initialized, cannot emit event.');
      return;
    }
    const owner_unique_id = listing.owner_unique_id || listing.owner?.unique_id || listing.ownerId?.unique_id;
    io.emit(`listing:${type}`, { listing, owner_unique_id });
  }
};

