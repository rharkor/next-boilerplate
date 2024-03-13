terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.36"
    }
  }

  #? Variables are not available in the backend block
  backend "s3" {
    bucket = "shared-elements-terra-config"
    key    = "terraform.tfstate"
    region = "eu-west-1"
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "iam" {
  source = "./modules/iam"


  region = var.aws_region
}
