// Socket.IO utility for emitting listing events
let io = null;

function setIO(socketIO) {
  io = socketIO;
}

function notifyListingEvent(type, listing) {
  if (!io || !listing) return;
  
  // Get owner_unique_id from listing
  let owner_unique_id = null;
  if (listing.owner_unique_id) {
    owner_unique_id = listing.owner_unique_id;
  } else if (listing.owner && typeof listing.owner === 'object' && listing.owner.unique_id) {
    owner_unique_id = listing.owner.unique_id;
  }
  
  io.emit(`listing:${type}`, {
    listing,
    owner_unique_id
  });
  
  console.log(`[Socket] Emitted listing:${type} for owner: ${owner_unique_id || 'unknown'}`);
}

module.exports = { setIO, notifyListingEvent };

