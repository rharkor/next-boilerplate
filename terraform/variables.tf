variable "PROJECT_NAME" {
  type = string
}

variable "AWS_PROFILE" {
  type = string
}

variable "AWS_REGION" {
  type = string
}

variable "PROJECT_MODULE" {
  type        = string
  description = "The type of project to deploy (ec2, fargate)."

  validation {
    condition     = contains(["ec2", "fargate"], var.PROJECT_MODULE)
    error_message = "Allowed values for PROJECT_MODULE are \"ec2\" or \"fargate\"."
  }
}

variable "CPU" {
  type        = number
  description = "The number of CPU units used by the task (256, 512, ...)."
}

variable "MEMORY" {
  type        = number
  description = "The amount (in MiB) of memory used by the task (512, 1024, ...)."
}

variable "DOCKER_IMAGE" {
  type = string
}
