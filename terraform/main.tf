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
  region  = var.AWS_REGION
  profile = var.AWS_PROFILE
}

module "project" {
  source = "./modules/project"

  projectName = var.PROJECT_NAME
  region      = var.AWS_REGION
  cpu         = var.CPU
  memory      = var.MEMORY
  image       = var.DOCKER_IMAGE
  kind        = var.PROJECT_MODULE
}
