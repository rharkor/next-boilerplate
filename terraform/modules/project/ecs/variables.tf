variable "projectName" {
  type = string
}

variable "task_name" {
  type = string
}

variable "cpu" {
  type = number
}

variable "memory" {
  type = number
}

variable "vpc" {
  type = string
}

variable "image" {
  type = string
}

variable "region" {
  type = string
}

variable "lb_ecs_tg_arn" {
  type = string
}

variable "lb_front_end" {
  type = any
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
