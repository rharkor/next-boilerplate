variable "identifier" {
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

variable "cpu" {
  type = number
}

variable "memory" {
  type = number
}

variable "scale_in_cooldown" {
  type = number
}

variable "scale_out_cooldown" {
  type = number
}

variable "private_subnets" {
  type = any
}

variable "public_subnets" {
  type = any
}

variable "vpc_id" {
  type = string
}

variable "lb_sg_id" {
  type = string
}

variable "ecs_sg_id" {
  type = string
}

variable "ecs_cluster_id" {
  type = string
}

variable "ecs_cluster_name" {
  type = string
}
