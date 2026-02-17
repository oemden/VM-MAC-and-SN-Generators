-- Save results table (design: 2026-02-16-save-results-backend-design)
CREATE TABLE IF NOT EXISTS `saved_results` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `type` text NOT NULL,
  `value` text NOT NULL,
  `comment` text,
  `vm_name` text,
  `created_at` integer NOT NULL,
  `user_id` integer,
  `project_id` integer
);

CREATE INDEX IF NOT EXISTS `saved_results_type_created_at_idx` ON `saved_results` (`type`, `created_at`);
