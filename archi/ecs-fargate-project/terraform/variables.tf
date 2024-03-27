variable "project_name" {
  type = string
}

variable "aws_profile" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "az_count" {
  type = number
}

variable "task_definitions" {
  type = list(object({
    task_name          = string
    cpu                = number
    memory             = number
    desired_count      = number
    max_capacity       = number
    min_capacity       = number
    scale_in_cooldown  = number
    scale_out_cooldown = number
  }))
  description = "List of task definitions"
}
