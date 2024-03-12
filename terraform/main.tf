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
  source = "./modules/project"


  projectName      = var.project_name
  region           = var.aws_region
  task_definitions = var.task_definitions
}
