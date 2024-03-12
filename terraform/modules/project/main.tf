module "vpc" {
  source = "./vpc"

  projectName = var.projectName
  subnet_a_id = module.ecs.subnet_a_id
  subnet_b_id = module.ecs.subnet_b_id
  subnet_c_id = module.ecs.subnet_c_id
}

module "iam" {
  source = "./iam"

  projectName = var.projectName
  region      = var.region
}

module "ecs" {
  source = "./ecs"
  count  = length(var.task_definitions)

  vpc         = module.vpc.vpc_id
  region      = var.region
  projectName = var.projectName

  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn

  lb_ecs_tg_arn = module.lb.lb_ecs_tg_arn
  lb_front_end  = module.lb.lb_front_end

  task_name     = var.task_definitions[count.index].task_name
  cpu           = var.task_definitions[count.index].cpu
  memory        = var.task_definitions[count.index].memory
  image         = var.task_definitions[count.index].docker_image
  desired_count = var.task_definitions[count.index].desired_count
  min_capacity  = var.task_definitions[count.index].min_capacity
  max_capacity  = var.task_definitions[count.index].max_capacity
}

module "lb" {
  source = "./lb"

  vpc         = module.vpc.vpc_id
  projectName = var.projectName
  ecs_sg_id   = module.ecs.ecs_sg_id
  subnet_a_id = module.ecs.subnet_a_id
  subnet_b_id = module.ecs.subnet_b_id
  subnet_c_id = module.ecs.subnet_c_id
}
