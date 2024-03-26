#####################################
#* Autoscaling Group
#####################################
resource "aws_autoscaling_group" "ecs_autoscaling_group" {
  name                  = "${var.project_name}-ecs-asg"
  max_size              = var.max_asg_capacity
  min_size              = var.min_asg_capacity
  vpc_zone_identifier   = aws_subnet.public.*.id
  health_check_type     = "EC2"
  protect_from_scale_in = true

  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupPendingInstances",
    "GroupStandbyInstances",
    "GroupTerminatingInstances",
    "GroupTotalInstances"
  ]

  launch_template {
    id      = aws_launch_template.ecs_launch_template.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
  }

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-ecs-asg"
    propagate_at_launch = true
  }
}
