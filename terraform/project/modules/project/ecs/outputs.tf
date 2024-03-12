output "ecs_sg_id" {
  value = aws_security_group.ecs_sg.id
}

output "lb_dns" {
  value = module.lb.lb_dns
}
