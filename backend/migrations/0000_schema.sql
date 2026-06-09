CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text,
	`files` text,
	`annotations` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`user_id` text NOT NULL,
	`title` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `document_edits` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`chat_message_id` text,
	`version_id` text NOT NULL,
	`change_id` text NOT NULL,
	`del_w_id` text,
	`ins_w_id` text,
	`deleted_text` text DEFAULT '' NOT NULL,
	`inserted_text` text DEFAULT '' NOT NULL,
	`context_before` text,
	`context_after` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`version_id`) REFERENCES `document_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `document_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`storage_path` text NOT NULL,
	`pdf_storage_path` text,
	`source` text DEFAULT 'upload' NOT NULL,
	`version_number` integer,
	`filename` text,
	`file_type` text,
	`size_bytes` integer,
	`page_count` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_doc_versions_unique` ON `document_versions` (`document_id`,`version_number`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`folder_id` text,
	`current_version_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folder_id`) REFERENCES `project_subfolders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `hidden_workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workflow_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_hidden_workflows_unique` ON `hidden_workflows` (`user_id`,`workflow_id`);--> statement-breakpoint
CREATE TABLE `project_subfolders` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`parent_folder_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_folder_id`) REFERENCES `project_subfolders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`cm_number` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`shared_with` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ro_legal_index` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`act_number` text,
	`act_type` text,
	`title` text,
	`publication_date` text,
	`official_gazette` text,
	`content_summary` text,
	`source_url` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tabular_cells` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`document_id` text NOT NULL,
	`column_index` integer NOT NULL,
	`content` text,
	`citations` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `tabular_reviews`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tabular_review_chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text,
	`annotations` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `tabular_review_chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tabular_review_chats` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `tabular_reviews`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tabular_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`user_id` text NOT NULL,
	`title` text,
	`columns_config` text,
	`document_ids` text,
	`workflow_id` text,
	`practice` text,
	`shared_with` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user_api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`encrypted_key` text NOT NULL,
	`iv` text NOT NULL,
	`auth_tag` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_api_keys_user_provider` ON `user_api_keys` (`user_id`,`provider`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`organisation` text,
	`tier` text DEFAULT 'Free' NOT NULL,
	`message_credits_used` integer DEFAULT 0 NOT NULL,
	`credits_reset_date` text NOT NULL,
	`title_model` text,
	`tabular_model` text DEFAULT 'gemini-3-flash-preview' NOT NULL,
	`quote_model` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `workflow_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`shared_by_user_id` text NOT NULL,
	`shared_with_email` text NOT NULL,
	`allow_edit` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_workflow_shares_unique` ON `workflow_shares` (`workflow_id`,`shared_with_email`);--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`prompt_md` text,
	`columns_config` text,
	`practice` text,
	`is_system` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
