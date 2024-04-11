variable "project_name" {
  type = string
}

variable "region" {
  type = string
}

variable "az_count" {
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

variable "architecture" {
  type = string
}

variable "max_asg_capacity" {
  type = number
}

variable "min_asg_capacity" {
  type = number
}

variable "maximum_scaling_step_size" {
  type = number
}

variable "minimum_scaling_step_size" {
  type = number
}
