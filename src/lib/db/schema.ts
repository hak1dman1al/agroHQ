import { pgTable, text, timestamp, boolean, integer, uuid, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const roleEnum = pgEnum("role", ["admin", "partner", "manager", "staff", "viewer"])
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"])
export const statusEnum = pgEnum("status", ["todo", "in_progress", "review", "completed", "blocked"])
export const entityTypeEnum = pgEnum("entity_type", ["task", "partner", "meeting", "document", "presentation"])

// Better Auth tables
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: roleEnum("role").notNull().default("viewer"),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Organization tables
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  position: text("position"),
  role: text("role"),
  responsibilities: text("responsibilities"),
  expertise: text("expertise"),
  equityPercentage: integer("equity_percentage"),
  joiningDate: timestamp("joining_date"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Tasks tables
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: uuid("assignee_id").references(() => partners.id),
  priority: priorityEnum("priority").notNull().default("medium"),
  status: statusEnum("status").notNull().default("todo"),
  dueDate: timestamp("due_date"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Task subtasks / checklist items
export const taskSubtasks = pgTable("task_subtasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const taskComments = pgTable("task_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const taskAttachments = pgTable("task_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  minioKey: text("minio_key").notNull(),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Activity feed
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id),
  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  tasksCreated: many(tasks),
  taskComments: many(taskComments),
  taskAttachments: many(taskAttachments),
  activities: many(activities),
  partners: many(partners),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, {
    fields: [partners.userId],
    references: [users.id],
  }),
  assignedTasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignee: one(partners, {
    fields: [tasks.assigneeId],
    references: [partners.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  comments: many(taskComments),
  attachments: many(taskAttachments),
  subtasks: many(taskSubtasks),
}))

export const taskSubtasksRelations = relations(taskSubtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [taskSubtasks.taskId],
    references: [tasks.id],
  }),
}))

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id],
  }),
}))

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id],
  }),
  uploader: one(users, {
    fields: [taskAttachments.uploadedBy],
    references: [users.id],
  }),
}))

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}))

// ============================================
// Phase 2: Vision & Mission, Meetings, Progress Updates
// ============================================

// Vision & Mission
export const visionSections = pgTable("vision_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // why_agro, mission, vision, core_values, long_term_goals
  orderIndex: integer("order_index").notNull().default(0),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Meetings
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  agenda: text("agenda"),
  discussion: text("discussion"),
  decisions: text("decisions"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const meetingParticipants = pgTable("meeting_participants", {
  meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
})

export const meetingActions = pgTable("meeting_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  assigneeId: uuid("assignee_id").references(() => partners.id),
  status: statusEnum("status").notNull().default("todo"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const meetingAttachments = pgTable("meeting_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  minioKey: text("minio_key").notNull(),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Progress Updates
export const progressUpdates = pgTable("progress_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const progressAttachments = pgTable("progress_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  updateId: uuid("update_id").notNull().references(() => progressUpdates.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  minioKey: text("minio_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const progressReactions = pgTable("progress_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  updateId: uuid("update_id").notNull().references(() => progressUpdates.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Phase 2 Relations
export const visionSectionsRelations = relations(visionSections, ({ one }) => ({
  creator: one(users, {
    fields: [visionSections.createdBy],
    references: [users.id],
  }),
}))

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  creator: one(users, {
    fields: [meetings.createdBy],
    references: [users.id],
  }),
  participants: many(meetingParticipants),
  actions: many(meetingActions),
  attachments: many(meetingAttachments),
}))

export const meetingParticipantsRelations = relations(meetingParticipants, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingParticipants.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [meetingParticipants.userId],
    references: [users.id],
  }),
}))

export const meetingActionsRelations = relations(meetingActions, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingActions.meetingId],
    references: [meetings.id],
  }),
  assignee: one(partners, {
    fields: [meetingActions.assigneeId],
    references: [partners.id],
  }),
}))

export const meetingAttachmentsRelations = relations(meetingAttachments, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingAttachments.meetingId],
    references: [meetings.id],
  }),
  uploader: one(users, {
    fields: [meetingAttachments.uploadedBy],
    references: [users.id],
  }),
}))

export const progressUpdatesRelations = relations(progressUpdates, ({ one, many }) => ({
  user: one(users, {
    fields: [progressUpdates.userId],
    references: [users.id],
  }),
  attachments: many(progressAttachments),
  reactions: many(progressReactions),
}))

export const progressAttachmentsRelations = relations(progressAttachments, ({ one }) => ({
  update: one(progressUpdates, {
    fields: [progressAttachments.updateId],
    references: [progressUpdates.id],
  }),
}))

export const progressReactionsRelations = relations(progressReactions, ({ one }) => ({
  update: one(progressUpdates, {
    fields: [progressReactions.updateId],
    references: [progressUpdates.id],
  }),
  user: one(users, {
    fields: [progressReactions.userId],
    references: [users.id],
  }),
}))

// ============================================
// Phase 3: Documents & Financial
// ============================================

// Document Folders
export const documentFolders = pgTable("document_folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Documents
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  folderId: uuid("folder_id").references(() => documentFolders.id),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  minioKey: text("minio_key").notNull(),
  version: integer("version").notNull().default(1),
  tags: text("tags"),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Financial - Capital Contributions
export const capitalContributions = pgTable("capital_contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id").notNull().references(() => partners.id),
  amount: integer("amount").notNull(), // stored in cents
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Financial - Transactions
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // expense, revenue
  category: text("category").notNull(),
  amount: integer("amount").notNull(), // stored in cents
  date: timestamp("date").notNull(),
  description: text("description"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ============================================
// Phase 4: Roadmap & Reports
// ============================================

// Roadmap
export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("planned"), // planned, in_progress, completed, delayed
  completionPercentage: integer("completion_percentage").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Milestones
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  roadmapId: uuid("roadmap_id").notNull().references(() => roadmaps.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ============================================
// Phase 5: Presentations
// ============================================

// Presentations
export const presentations = pgTable("presentations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  theme: text("theme").notNull().default("executive"),
  shareToken: text("share_token"),
  isPublic: boolean("is_public").notNull().default(false),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Slides
export const slides = pgTable("slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  presentationId: uuid("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // cover, section, text, bullet, kpi, timeline, roadmap, organization, comparison, cards, quote, image, gallery, table, financial, action_plan, swot, progress, meeting_summary, decision, risk, thank_you
  layout: text("layout").notNull().default("center"), // hero, center, two_column, three_column, grid, sidebar, split, cards, timeline, dashboard, full_visual
  title: text("title"),
  subtitle: text("subtitle"),
  mainMessage: text("main_message"),
  contentJson: jsonb("content_json"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Phase 3-5 Relations
export const documentFoldersRelations = relations(documentFolders, ({ one, many }) => ({
  creator: one(users, {
    fields: [documentFolders.createdBy],
    references: [users.id],
  }),
  documents: many(documents),
}))

export const documentsRelations = relations(documents, ({ one }) => ({
  folder: one(documentFolders, {
    fields: [documents.folderId],
    references: [documentFolders.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}))

export const capitalContributionsRelations = relations(capitalContributions, ({ one }) => ({
  partner: one(partners, {
    fields: [capitalContributions.partnerId],
    references: [partners.id],
  }),
  creator: one(users, {
    fields: [capitalContributions.createdBy],
    references: [users.id],
  }),
}))

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  creator: one(users, {
    fields: [financialTransactions.createdBy],
    references: [users.id],
  }),
}))

export const roadmapsRelations = relations(roadmaps, ({ one, many }) => ({
  creator: one(users, {
    fields: [roadmaps.createdBy],
    references: [users.id],
  }),
  milestones: many(milestones),
}))

export const milestonesRelations = relations(milestones, ({ one }) => ({
  roadmap: one(roadmaps, {
    fields: [milestones.roadmapId],
    references: [roadmaps.id],
  }),
}))

export const presentationsRelations = relations(presentations, ({ one, many }) => ({
  creator: one(users, {
    fields: [presentations.createdBy],
    references: [users.id],
  }),
  slides: many(slides),
}))

export const slidesRelations = relations(slides, ({ one }) => ({
  presentation: one(presentations, {
    fields: [slides.presentationId],
    references: [presentations.id],
  }),
}))
