module "vpc" {
  source = "./vpc"

  projectName = var.projectName
  region      = var.region
}

module "ecs" {
  source = "./ecs"
  count  = length(var.task_definitions)

  vpc            = module.vpc.vpc_id
  vpc_cidr_block = module.vpc.vpc_cidr_block
  subnet_a_id    = module.vpc.subnet_a_id
  subnet_b_id    = module.vpc.subnet_b_id
  subnet_c_id    = module.vpc.subnet_c_id
  region         = var.region
  projectName    = var.projectName

  ecs_task_execution_role_arn = var.ecs_task_execution_role_arn

  task_name     = var.task_definitions[count.index].task_name
  cpu           = var.task_definitions[count.index].cpu
  memory        = var.task_definitions[count.index].memory
  image         = var.task_definitions[count.index].docker_image
  desired_count = var.task_definitions[count.index].desired_count
  min_capacity  = var.task_definitions[count.index].min_capacity
  max_capacity  = var.task_definitions[count.index].max_capacity
}
