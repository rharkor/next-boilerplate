module "vpc" {
  source = "./vpc"

  projectName = var.projectName
  subnet_a_id = module.ecs.subnet_a_id
  subnet_b_id = module.ecs.subnet_b_id
  subnet_c_id = module.ecs.subnet_c_id
}

module "ecs" {
  source = "./ecs"

  vpc           = module.vpc.vpc_id
  cpu           = var.cpu
  memory        = var.memory
  region        = var.region
  projectName   = var.projectName
  image         = var.image
  kind          = var.kind
  lb_ecs_tg_arn = module.lb.lb_ecs_tg_arn
  lb_front_end  = module.lb.lb_front_end
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
