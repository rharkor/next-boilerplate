output "lb_ecs_tg_arn" {
  value = aws_lb_target_group.lb_ecs_tg.arn
}

output "lb_front_end" {
  value = aws_lb_listener.lb_front_end
}
