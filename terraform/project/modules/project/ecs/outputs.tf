output "ecs_sg_id" {
  value = aws_security_group.ecs_sg.id
}

output "lb_dns" {
  value = module.lb.lb_dns
}

output "task_name" {
  value = var.task_name
}
