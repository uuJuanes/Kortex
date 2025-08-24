
declare var process: {
  env: {
    API_KEY?: string;
  }
};

export interface Label {
  id: string;
  text: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  profileSummary: string;
  isSystemAdmin?: boolean;
}

export enum UserRole {
  Admin = 'admin',
  Member = 'member',
}

export enum TeamPrivacy {
  Public = 'public',
  Private = 'private',
}

export interface TeamMember {
  userId: string;
  role: UserRole;
}

export interface Activity {
  id:string;
  userId: string;
  action: string;
  timestamp: string; // ISO 8601 string
}

export interface Team {
  id: string;
  name: string;
  privacy: TeamPrivacy;
  passcode?: string;
  members: TeamMember[];
  boards: Board[];
  activityLog?: Activity[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  title: string;
  items: ChecklistItem[];
}

export interface Attachment {
  id: string; // Now the primary key, used for IndexedDB lookup
  name: string;
  type: string;
  size: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string; // ISO 8601 string
}

export interface Card {
  id:string;
  title: string;
  description?: string;
  labels: Label[];
  dueDate?: string;
  members: User[];
  checklist?: Checklist;
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  teamId: string; // Each board now belongs to a team
  lists: List[];
}

export interface BoardAnalysis {
  summary: string;
  workload: Array<{
    userName: string;
    taskCount: number;
  }>;
  risks: string[];
  suggestions: string[];
}

export interface TeamAnalysis {
  summary: string;
  risks: string[];
  suggestions: string[];
}


export interface NewCardData {
    title: string;
    description?: string;
    labels: Label[];
    dueDate?: string;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Software' | 'Product' | 'Sales' | 'Marketing' | 'HR' | 'Operations' | 'Personal';
  board: {
    title: string;
    lists: {
      title: string;
      cards: {
        title: string;
        description?: string;
        labels?: string[]; // Array of label keys from LABELS constant
        checklist?: {
          title: string;
          items: { text: string }[];
        };
      }[];
    }[];
  };
}

export interface TaskGenerationContext {
  listId: string;
  listTitle: string;
  boardTitle: string;
  boardLists: { id: string; title: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  userAvatar?: string;
}
