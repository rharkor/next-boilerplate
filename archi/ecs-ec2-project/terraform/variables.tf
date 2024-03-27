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

variable "instance_type" {
  type = string
}

variable "max_asg_capacity" {
  type = number
}

variable "min_asg_capacity" {
  type = number
}

variable "architecture" {
  type = string
}

variable "minimum_scaling_step_size" {
  type = number
}

variable "maximum_scaling_step_size" {
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
