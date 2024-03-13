output "lb_ecs_tg_arn" {
  value = aws_lb_target_group.lb_ecs_tg.arn
}

output "lb_front_end" {
  value = aws_lb_listener.lb_front_end
}

output "lb_dns" {
  value = aws_lb.ecs_alb.dns_name
}
