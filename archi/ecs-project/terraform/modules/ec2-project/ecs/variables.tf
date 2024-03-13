variable "projectName" {
  type = string
}

variable "task_name" {
  type = string
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

variable "vpc_cidr_block" {
  type = string
}

variable "scale_in_cooldown" {
  type = number
}

variable "scale_out_cooldown" {
  type = number
}

variable "public_ec2_key" {
  type = string
}

variable "user_data" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "private_subnets" {
  type = any
}

variable "public_subnets" {
  type = any
}
