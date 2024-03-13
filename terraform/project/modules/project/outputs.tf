output "lb_dns" {
  value = { for ecs in module.ecs : ecs.task_name => ecs.lb_dns }
}
