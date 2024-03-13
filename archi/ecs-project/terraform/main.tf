terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.36"
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

module "project" {
  source = "./modules/ec2-project"


  projectName      = var.project_name
  region           = var.aws_region
  task_definitions = var.task_definitions
  public_ec2_key   = file("keys/id_rsa.pub")
  user_data        = file("templates/user_data.sh")
  az_count         = var.az_count
}



# module "project" {
#   source = "./modules/fargate-project"


#   projectName                 = var.project_name
#   region                      = var.aws_region
#   task_definitions            = var.task_definitions
#   ecs_task_execution_role_arn = var.ecs_task_execution_role_arn
# }
