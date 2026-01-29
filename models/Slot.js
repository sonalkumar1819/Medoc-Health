class Slot {
  constructor(slotId, capacity) {
    this.slotId = slotId;
    this.capacity = capacity;
    this.tokens = [];
    this.waitingList = [];
  }

  addToken(token) {
    this.tokens.push(token);
  }

  removeToken(tokenId) {
    this.tokens = this.tokens.filter(t => t.tokenId !== tokenId);
  }

  addToWaitingList(token) {
    this.waitingList.push(token);
    this.waitingList.sort((a, b) => a.priority - b.priority);
  }

  getNextFromWaitingList() {
    return this.waitingList.shift();
  }

  isFull() {
    return this.tokens.filter(t => t.isActive()).length >= this.capacity;
  }

  getActiveTokens() {
    return this.tokens.filter(t => t.isActive());
  }

  getLowestPriorityToken() {
    const activeTokens = this.getActiveTokens();
    if (activeTokens.length === 0) return null;
    
    return activeTokens.reduce((lowest, current) => 
      current.priority > lowest.priority ? current : lowest
    );
  }

  hasLowerPriorityThan(priority) {
    const lowestPriority = this.getLowestPriorityToken();
    return lowestPriority && lowestPriority.priority > priority;
  }
}

module.exports = Slot;
