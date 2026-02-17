-- VMs table (design: docs/plans/2026-02-17-VM-SN-MAC-business-rules-assessment.md)
CREATE TABLE IF NOT EXISTS `vms` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `vms_name_unique` ON `vms` (`name`);

-- Add vm_id to saved_results
ALTER TABLE `saved_results` ADD COLUMN `vm_id` integer REFERENCES `vms`(`id`);

-- Enforce 1 SN per VM (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS `saved_results_vm_id_type_sn_unique`
  ON `saved_results` (`vm_id`) WHERE `type` = 'sn';
