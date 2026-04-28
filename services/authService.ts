import { User } from "../types";

const USERS_KEY = "omnicreator_users";
const SESSION_KEY = "omnicreator_current_user_id";

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const registerUser = (name: string, email: string, password: string): User => {
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    throw new Error("User with this email already exists");
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    password, // Simulating backend storage
    joinedDate: Date.now(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  localStorage.setItem(SESSION_KEY, newUser.id);
  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  localStorage.setItem(SESSION_KEY, user.id);
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return null;

  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};