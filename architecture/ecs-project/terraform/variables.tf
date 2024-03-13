variable "project_name" {
  type = string
}

variable "aws_profile" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "task_definitions" {
  type = list(object({
    task_name                 = string
    cpu                       = number
    memory                    = number
    docker_image              = string
    desired_count             = number
    max_capacity              = number
    min_capacity              = number
    scale_in_cooldown         = number
    scale_out_cooldown        = number
    minimum_scaling_step_size = number
    maximum_scaling_step_size = number
    instance_type             = string
  }))
  description = "List of task definitions"
}

variable "ecs_task_execution_role_arn" {
  type = string
}

variable "ecs_task_execution_role_name" {
  type = string
}
