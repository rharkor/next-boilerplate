terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.41"
    }
  }

  #? Variables are not available in the backend block
  backend "s3" {
    bucket = "next-boilerplate-terra-config"
    key    = "terraform.tfstate"
    region = "eu-west-1"
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "global" {
  source = "./modules/global"

  project_name              = var.project_name
  instance_type             = var.instance_type
  max_asg_capacity          = var.max_asg_capacity
  min_asg_capacity          = var.min_asg_capacity
  architecture              = var.architecture
  az_count                  = var.az_count
  region                    = var.aws_region
  user_data                 = file("templates/user_data.sh")
  public_ec2_key            = file("keys/id_rsa.pub")
  minimum_scaling_step_size = var.minimum_scaling_step_size
  maximum_scaling_step_size = var.maximum_scaling_step_size
}

module "project" {
  source = "./modules/project"

  count = length(var.task_definitions)

  private_subnets      = module.global.private_subnets
  public_subnets       = module.global.public_subnets
  lb_sg_id             = module.global.lb_sg_id
  vpc_id               = module.global.vpc_id
  ecs_cluster_id       = module.global.ecs_cluster_id
  ecs_cluster_name     = module.global.ecs_cluster_name
  ecs_service_role_arn = module.global.ecs_service_role_arn
  region               = var.aws_region

  identifier         = "${var.task_definitions[count.index].task_name}-${var.project_name}"
  cpu                = var.task_definitions[count.index].cpu
  memory             = var.task_definitions[count.index].memory
  desired_count      = var.task_definitions[count.index].desired_count
  min_capacity       = var.task_definitions[count.index].min_capacity
  max_capacity       = var.task_definitions[count.index].max_capacity
  scale_in_cooldown  = var.task_definitions[count.index].scale_in_cooldown
  scale_out_cooldown = var.task_definitions[count.index].scale_out_cooldown
}
