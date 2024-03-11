variable "projectName" {
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

variable "kind" {
  type = string
}

variable "lb_ecs_tg_arn" {
  type = string
}

variable "lb_front_end" {
  type = any
}
