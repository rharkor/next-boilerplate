variable "projectName" {
  type = string
}

variable "task_name" {
  type = string
}


variable "vpc" {
  type = string
}

variable "subnet_a_id" {
  type = string
}

variable "subnet_b_id" {
  type = string
}

variable "subnet_c_id" {
  type = string
}

variable "image" {
  type = string
}

variable "region" {
  type = string
}

variable "desired_count" {
  type = number
}

variable "max_capacity" {
  type = number
}

variable "min_capacity" {
  type = number
}

variable "ecs_task_execution_role_arn" {
  type = string
}

variable "cpu" {
  type = number
}

variable "memory" {
  type = number
}

variable "vpc_cidr_block" {
  type = string
}
