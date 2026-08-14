import {
  User,
  Property,
  Key,
  KeyCheckoutEvent,
  KeyCheckinEvent,
  Activity,
  KeyStatus,
} from "./types";

// Simple in-memory storage for prototype
class KeyTrackerStorage {
  private users: Map<string, User> = new Map();
  private properties: Map<string, Property> = new Map();
  private keys: Map<string, Key> = new Map();
  private checkoutEvents: Map<string, KeyCheckoutEvent> = new Map();
  private checkinEvents: Map<string, KeyCheckinEvent> = new Map();
  private activities: Map<string, Activity> = new Map();

  private idCounter = {
    user: 0,
    property: 0,
    key: 0,
    checkoutEvent: 0,
    checkinEvent: 0,
    activity: 0,
  };

  private generateId(type: keyof typeof this.idCounter): string {
    this.idCounter[type]++;
    return `${type}_${Date.now()}_${this.idCounter[type]}`;
  }

  // User operations
  createUser(user: Omit<User, "id">): User {
    const newUser: User = { ...user, id: this.generateId("user") };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  findUserByPhone(phone: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.phone === phone);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Property operations
  createProperty(property: Omit<Property, "id" | "createdAt">): Property {
    const newProperty: Property = {
      ...property,
      id: this.generateId("property"),
      createdAt: new Date(),
    };
    this.properties.set(newProperty.id, newProperty);
    return newProperty;
  }

  getProperty(id: string): Property | undefined {
    return this.properties.get(id);
  }

  getAllProperties(): Property[] {
    return Array.from(this.properties.values());
  }

  searchProperties(query: string): Property[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.properties.values()).filter((p) =>
      p.address.toLowerCase().includes(lowerQuery)
    );
  }

  // Key operations
  createKey(key: Omit<Key, "id" | "createdAt">): Key {
    const newKey: Key = {
      ...key,
      id: this.generateId("key"),
      createdAt: new Date(),
      status: "available",
    };
    this.keys.set(newKey.id, newKey);
    return newKey;
  }

  getKey(id: string): Key | undefined {
    return this.keys.get(id);
  }

  getKeysByProperty(propertyId: string): Key[] {
    return Array.from(this.keys.values()).filter(
      (k) => k.propertyId === propertyId
    );
  }

  updateKeyStatus(keyId: string, status: KeyStatus): Key | undefined {
    const key = this.keys.get(keyId);
    if (key) {
      key.status = status;
      this.keys.set(keyId, key);
      return key;
    }
    return undefined;
  }

  updateKey(keyId: string, updates: Partial<Key>): Key | undefined {
    const key = this.keys.get(keyId);
    if (key) {
      const updated = { ...key, ...updates };
      this.keys.set(keyId, updated);
      return updated;
    }
    return undefined;
  }

  // Checkout event operations
  createCheckoutEvent(event: Omit<KeyCheckoutEvent, "id">): KeyCheckoutEvent {
    const newEvent: KeyCheckoutEvent = {
      ...event,
      id: this.generateId("checkoutEvent"),
    };
    this.checkoutEvents.set(newEvent.id, newEvent);

    // Update key status
    this.updateKey(event.keyId, {
      status: "checked_out",
      currentHolder: event.holder,
      checkedOutAt: event.checkedOutAt,
      expectedReturnAt: event.expectedReturnAt,
      reason: event.reason,
      signature: event.signature,
      checkedOutBy: event.checkedOutBy,
    });

    // Add activity
    this.createActivity({
      propertyId: event.propertyId,
      type: "key_checked_out",
      description: `Keys checked out to ${event.holder.name}. Expected return: ${event.expectedReturnAt.toLocaleString()}`,
      timestamp: new Date(),
      metadata: { keyId: event.keyId, holder: event.holder },
    });

    return newEvent;
  }

  getCheckoutEvent(id: string): KeyCheckoutEvent | undefined {
    return this.checkoutEvents.get(id);
  }

  getCheckoutEventsByProperty(propertyId: string): KeyCheckoutEvent[] {
    return Array.from(this.checkoutEvents.values()).filter(
      (e) => e.propertyId === propertyId
    );
  }

  // Checkin event operations
  createCheckinEvent(event: Omit<KeyCheckinEvent, "id">): KeyCheckinEvent {
    const newEvent: KeyCheckinEvent = {
      ...event,
      id: this.generateId("checkinEvent"),
    };
    this.checkinEvents.set(newEvent.id, newEvent);

    // Update key status
    this.updateKey(event.keyId, {
      status: "available",
      currentHolder: undefined,
      checkedOutAt: undefined,
      expectedReturnAt: undefined,
    });

    // Add activity
    this.createActivity({
      propertyId: event.propertyId,
      type: "key_checked_in",
      description: `Keys checked in at ${event.checkedInAt.toLocaleString()}`,
      timestamp: new Date(),
      metadata: { keyId: event.keyId },
    });

    return newEvent;
  }

  getCheckinEvent(id: string): KeyCheckinEvent | undefined {
    return this.checkinEvents.get(id);
  }

  getCheckinEventsByProperty(propertyId: string): KeyCheckinEvent[] {
    return Array.from(this.checkinEvents.values()).filter(
      (e) => e.propertyId === propertyId
    );
  }

  // Activity operations
  createActivity(activity: Omit<Activity, "id">): Activity {
    const newActivity: Activity = {
      ...activity,
      id: this.generateId("activity"),
    };
    this.activities.set(newActivity.id, newActivity);
    return newActivity;
  }

  getActivitiesByProperty(
    propertyId: string,
    limit?: number
  ): Activity[] {
    let activities = Array.from(this.activities.values()).filter(
      (a) => a.propertyId === propertyId
    );

    // Sort by timestamp descending (most recent first)
    activities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    if (limit) {
      activities = activities.slice(0, limit);
    }

    return activities;
  }

  // Seed initial data
  seedData(): void {
    // Create some sample staff
    const manager = this.createUser({
      name: "Sarah Jones",
      email: "sarah@agency.com",
      phone: "+1234567890",
      role: "staff",
    });

    const admin = this.createUser({
      name: "Mike Wilson",
      email: "mike@agency.com",
      phone: "+1234567891",
      role: "staff",
    });

    // Create some sample properties
    const prop1 = this.createProperty({
      address: "12B Smith Street",
      description: "Apartment",
    });

    const prop2 = this.createProperty({
      address: "45 Queen Road",
      description: "House",
    });

    // Create keys for properties
    const key1 = this.createKey({
      propertyId: prop1.id,
      status: "available",
    });

    const key2 = this.createKey({
      propertyId: prop2.id,
      status: "available",
    });

    // Create a sample checkout event
    const visitor = this.createUser({
      name: "John Smith",
      phone: "+1987654321",
      company: "ABC Photography",
      role: "visitor",
    });

    const checkoutTime = new Date(Date.now() - 30 * 60000); // 30 mins ago
    const returnTime = new Date(Date.now() + 30 * 60000); // 30 mins from now

    this.createCheckoutEvent({
      keyId: key1.id,
      propertyId: prop1.id,
      holder: visitor,
      checkedOutAt: checkoutTime,
      expectedReturnAt: returnTime,
      reason: "Photography",
      checkedOutBy: manager,
    });
  }
}

// Singleton instance
let storageInstance: KeyTrackerStorage | null = null;

export function getStorage(): KeyTrackerStorage {
  if (!storageInstance) {
    storageInstance = new KeyTrackerStorage();
    // Seed with initial data only once
    if (process.env.NODE_ENV !== "production") {
      storageInstance.seedData();
    }
  }
  return storageInstance;
}

export default KeyTrackerStorage;
