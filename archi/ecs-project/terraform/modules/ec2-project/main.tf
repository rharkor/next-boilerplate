module "vpc" {
  source = "./vpc"

  projectName = var.projectName
  region      = var.region
  az_count    = var.az_count
}

module "ecs" {
  source = "./ecs"
  count  = length(var.task_definitions)

  vpc             = module.vpc.vpc_id
  vpc_cidr_block  = module.vpc.vpc_cidr_block
  region          = var.region
  projectName     = var.projectName
  public_ec2_key  = var.public_ec2_key
  user_data       = var.user_data
  private_subnets = module.vpc.private_subnets
  public_subnets  = module.vpc.public_subnets

  task_name          = var.task_definitions[count.index].task_name
  cpu                = var.task_definitions[count.index].cpu
  memory             = var.task_definitions[count.index].memory
  image              = var.task_definitions[count.index].docker_image
  desired_count      = var.task_definitions[count.index].desired_count
  min_capacity       = var.task_definitions[count.index].min_capacity
  max_capacity       = var.task_definitions[count.index].max_capacity
  scale_in_cooldown  = var.task_definitions[count.index].scale_in_cooldown
  scale_out_cooldown = var.task_definitions[count.index].scale_out_cooldown
  instance_type      = var.task_definitions[count.index].instance_type
}
