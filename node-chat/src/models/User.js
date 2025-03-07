class User {
    constructor(id, name, isModerator, connection, ip = "unknown", isLoggedIn = false, mobileDevice = false, banned = false) {
        this.id = id;
        this.name = name || "default";
        this.isModerator = isModerator || 0;
        this.connection = connection;
        this.messageCount = 0;
        this.lastMessageTimestamp = null;
        this.messageCooldown = 1;
        this.cooldownMultiplier = 2;
        this.sentTheScore = false;
        this.listeningTypes = new Set();
        this.ip = ip;
        this.isLoggedIn = isLoggedIn;
        this.mobileDevice = mobileDevice;
        this.banned = banned;
    }
}
export default User;
