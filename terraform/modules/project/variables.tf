variable "projectName" {
  type = string
}

variable "region" {
  type = string
}

variable "task_definitions" {
  type = list(object({
    task_name     = string
    cpu           = number
    memory        = number
    docker_image  = string
    desired_count = number
    max_capacity  = number
    min_capacity  = number
  }))
  description = "List of task definitions"
}
