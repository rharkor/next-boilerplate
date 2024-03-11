resource "aws_lb" "ecs_alb" {
  name               = "${var.projectName}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.ecs_sg_id]
  subnets            = [var.subnet_a_id, var.subnet_b_id, var.subnet_c_id]

  enable_deletion_protection = false

  tags = {
    Name = "${var.projectName}-alb"
  }
}

resource "aws_lb_target_group" "lb_ecs_tg" {
  name        = "${var.projectName}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc
  target_type = "ip"

  health_check {
    path                = "/"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "lb_front_end" {
  load_balancer_arn = aws_lb.ecs_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lb_ecs_tg.arn
  }
}
