variable "projectName" {
  type = string
}

variable "region" {
  type = string
}

variable "task_definitions" {
  type = list(object({
    task_name          = string
    cpu                = number
    memory             = number
    docker_image       = string
    desired_count      = number
    max_capacity       = number
    min_capacity       = number
    scale_in_cooldown  = number
    scale_out_cooldown = number
    instance_type      = string
  }))
  description = "List of task definitions"
}

variable "public_ec2_key" {
  type = string
}

variable "user_data" {
  type = string
}

variable "az_count" {
  type = number
}
